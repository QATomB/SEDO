import datetime

from sqlmodel import Field, SQLModel
from pydantic import BaseModel

class PydanticModels:
    class Token(BaseModel):
        access_token: str
        token_type: str

    class TokenData(BaseModel):
        username: str | None = None

    class UserBase(BaseModel):
        employee_id: str
        email: str
        full_name: str

    class NewUser(UserBase):
        unhashed_password: str

    class User(UserBase):
        access_level: int = 1

    class UpdateUser(User, NewUser):
        pass
    
    class UserInDB(User):
        hashed_password: str

    class NewAsset(BaseModel):
        type: str
        location_name: str

    class NewMovement(BaseModel):
        asset_uid: int
        new_location: str

class SQLModels:
    class User(SQLModel, table=True):
        employee_id: str = Field(default=None, primary_key=True)
        full_name: str
        email: str
        hashed_password: str
        access_level: int = Field(default=None, index=True)

    class Location(SQLModel, table=True):
        location_name: str = Field(default=None, primary_key=True)
        location_colour: str = Field(default=None)

    class AssetType(SQLModel, table=True):
        type: str = Field(default=None, primary_key=True)

    class Asset(SQLModel, table=True):
        asset_uid: int = Field(default=None, primary_key=True)
        type: str = Field(default=None, foreign_key="assettype.type")

    class AssetLocation(SQLModel, table=True):
        movement_uid: int = Field(default=None, primary_key=True)
        asset: int = Field(default=None, foreign_key="asset.asset_uid")
        location: str = Field(default=None, foreign_key="location.location_name")
        start_date: datetime.datetime = Field(default=None)
        end_date: datetime.datetime | None = Field(default=None)

