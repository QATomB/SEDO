from datetime import timedelta, datetime
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from sqlalchemy.sql.operators import is_

from schemas import PydanticModels, SQLModels
from auth import *
from database import engine, init_db_and_tables, get_session


app = FastAPI()

origins = [
    "https://sedo-cwgf.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db_and_tables()


@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_session),
) -> PydanticModels.Token:
    user = authenticate_user(form_data.username, form_data.password, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.employee_id}, expires_delta=access_token_expires
    )
    return PydanticModels.Token(access_token=access_token, token_type="bearer")


@app.get("/users/me/")
async def read_users_me(
    current_user: Annotated[PydanticModels.User, Depends(get_current_active_user)],
) -> PydanticModels.User:
    return current_user


@app.get("/users/")
async def get_all_users(
    current_user: Annotated[PydanticModels.User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
) -> list[PydanticModels.User]:
    if current_user.access_level < 2:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is unauthorised to view this content",
            headers={"WWW-Authenticate": "Bearer"},
        )
    all_users_db = session.exec(select(SQLModels.User)).all()
    all_users: list[PydanticModels.User] = []
    for db_user in all_users_db:
        all_users.append(
            PydanticModels.User(
                employee_id=db_user.employee_id,
                email=db_user.email,
                full_name=db_user.full_name,
                access_level=db_user.access_level
            )
        )
    return all_users


@app.post("/users/")
async def create_new_user(
    newUser: PydanticModels.NewUser,
    session: Session = Depends(get_session),
):
    new_user: SQLModels.User = SQLModels.User(
        employee_id=newUser.employee_id,
        email= newUser.email,
        access_level=1,
        hashed_password=get_password_hash(newUser.unhashed_password),
        full_name=newUser.full_name
    )
    if (
        len(session.exec(select(SQLModels.User).where(SQLModels.User.employee_id == newUser.employee_id)).all()) > 0
    ):
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail="The requested Employee ID is already taken",
            headers={"WWW-Authenticate": "Bearer"},
        )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user.employee_id


@app.delete("/users/{employee_id}/")
async def delete_user(
    current_user: Annotated[PydanticModels.User, Depends(get_current_active_user)],
    employee_id: str,
    session: Session = Depends(get_session),
) -> str:
    if current_user.access_level < 2:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is unauthorised to use this update endpoint",
            headers={"WWW-Authenticate": "Bearer"},
        )

    statement = select(SQLModels.User).where(SQLModels.User.employee_id == employee_id)
    user_to_delete = session.exec(statement).one()
    session.delete(user_to_delete)
    session.commit()
    return employee_id


@app.put("/users/{employee_id}/")
async def update_existing_user(
    current_user: Annotated[PydanticModels.User, Depends(get_current_active_user)],
    employee_id: str,
    updatedUser: PydanticModels.UpdateUser,
    session: Session = Depends(get_session),
) -> str:
    if current_user.access_level < 2:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is unauthorised to use this update endpoint",
            headers={"WWW-Authenticate": "Bearer"},
        )
    statement = select(SQLModels.User).where(SQLModels.User.employee_id == employee_id)
    user = session.exec(statement).one()
    # Check UID requested is avaliable
    if (
        updatedUser.employee_id != employee_id and 
        len(session.exec(select(SQLModels.User).where(SQLModels.User.employee_id == updatedUser.employee_id)).all()) > 0
    ):
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail="The requested Employee ID is already taken",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user.employee_id = updatedUser.employee_id
    user.email = updatedUser.email
    user.full_name = updatedUser.full_name
    user.access_level = updatedUser.access_level
    if updatedUser.unhashed_password != "":
        user.hashed_password = get_password_hash(updatedUser.unhashed_password)
    session.add(user)
    session.commit()
    return updatedUser.employee_id


@app.post("/asset/type/")
async def create_new_item_type(
    current_user: Annotated[PydanticModels.User, Depends(get_current_active_user)],
    asset_type: SQLModels.AssetType,
    session: Session = Depends(get_session),
) -> SQLModels.AssetType:
    session.add(asset_type)
    session.commit()
    session.refresh(asset_type)
    return asset_type


@app.post("/asset/")
async def create_new_asset(
    current_user: Annotated[PydanticModels.User, Depends(get_current_active_user)],
    newAsset: PydanticModels.NewAsset,
    session: Session = Depends(get_session),
) -> int:
    # Create initial item object in DB
    new_asset: SQLModels.Asset = SQLModels.Asset(type = newAsset.type)
    session.add(new_asset)
    session.commit()
    session.refresh(new_asset)
    
    # Create initial location in movement table of DB
    new_movement: SQLModels.AssetLocation = SQLModels.AssetLocation(
        asset=new_asset.asset_uid,
        location=newAsset.location_name,
        start_date=datetime.now()

    )

    session.add(new_movement)
    session.commit()
    session.refresh(new_movement)

    return new_asset.asset_uid


@app.get("/asset/")
async def get_all_assets(
    current_user: Annotated[PydanticModels.User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
) -> list[SQLModels.Asset]:
    all_assets = session.exec(select(SQLModels.Asset)).all()
    return all_assets


@app.post("/asset/movements/")
async def create_new_movement_log(
    current_user: Annotated[PydanticModels.User, Depends(get_current_active_user)],
    newMovement: PydanticModels.NewMovement,
    session: Session = Depends(get_session),
) -> int:
    new_movement: SQLModels.AssetLocation = SQLModels.AssetLocation(
        asset=newMovement.asset_uid,
        location=newMovement.new_location,
        start_date=datetime.now()

    )
    # Update old most recent movement log to end
    select_statement = select(SQLModels.AssetLocation).where(SQLModels.AssetLocation.asset == newMovement.asset_uid).where(is_(SQLModels.AssetLocation.end_date, None))
    old_last_movement: SQLModels.AssetLocation = session.exec(select_statement).one()

    old_last_movement.end_date = datetime.now()
    session.add(old_last_movement)
    session.commit()

    # Add new movement log
    session.add(new_movement)
    session.commit()
    session.refresh(new_movement)
    return new_movement.movement_uid


@app.get("/asset/movements/")
async def get_all_movements(
    current_user: Annotated[PydanticModels.User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
) -> list[SQLModels.AssetLocation]:
    all_movements: list[SQLModels.AssetLocation] = session.exec(select(SQLModels.AssetLocation)).all()

    return all_movements


@app.get("/asset/type/")
async def get_all_item_types(
    current_user: Annotated[PydanticModels.User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
) -> list[SQLModels.AssetType]:
    all_asset_types = session.exec(select(SQLModels.AssetType)).all()
    return all_asset_types


@app.post("/asset/location/")
async def create_new_location(
    current_user: Annotated[PydanticModels.User, Depends(get_current_active_user)],
    location: SQLModels.Location,
    session: Session = Depends(get_session),
) -> str:
    session.add(location)
    session.commit()
    session.refresh(location)
    return location.location_name


@app.get("/asset/location/")
async def get_all_locations(
    current_user: Annotated[PydanticModels.User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
) -> list[SQLModels.Location]:
    all_locations = session.exec(select(SQLModels.Location)).all()
    return all_locations


@app.get("/asset/{asset}/")
async def get_specific_asset(
    asset: int,
    current_user: Annotated[PydanticModels.User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
) -> SQLModels.Asset:
    asset_requested: SQLModels.Asset = session.exec(select(SQLModels.Asset).where(SQLModels.Asset.asset_uid == asset)).one()

    return asset_requested
