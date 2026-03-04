from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from sqlmodel import Session, select
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from dotenv import load_dotenv
import os

from schemas import PydanticModels, SQLModels
from database import engine, get_session


load_dotenv()


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))


password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password):
    return password_hash.hash(password)


def get_user(employee_id: str, session: Session):
    current_user = session.exec(select(SQLModels.User).where(SQLModels.User.employee_id == employee_id)).first()
    return PydanticModels.UserInDB(
        employee_id=current_user.employee_id,
        full_name=current_user.full_name,
        email=current_user.email,
        hashed_password=current_user.hashed_password,
        access_level=current_user.access_level,
    )


def authenticate_user(employee_id: str, password: str, session: Session):
    user = get_user(employee_id, session)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], 
    session: Session = Depends(get_session)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = PydanticModels.TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = get_user(employee_id=token_data.username, session=session)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[PydanticModels.User, Depends(get_current_user)],
):
    return current_user