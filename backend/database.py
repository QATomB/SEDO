from dotenv import load_dotenv
from sqlmodel import create_engine, SQLModel
from sqlmodel import Session
import os


load_dotenv()

DATABASE_NAME = os.getenv("DATABASE_NAME")

DATABASE_URL = f"sqlite:///{DATABASE_NAME}"

connect_args = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

def init_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
