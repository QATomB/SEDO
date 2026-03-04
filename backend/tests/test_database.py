import os
from dotenv import load_dotenv
from sqlmodel import SQLModel
from sqlalchemy import Engine

from database import DATABASE_NAME, DATABASE_URL, connect_args

load_dotenv()

class TestDatabase:
    def test_DATABASE_NAME(self):
        assert DATABASE_NAME != None
        assert DATABASE_NAME == os.getenv("DATABASE_NAME")

    def test_DATABASE_URL(self):
        assert DATABASE_URL != None
        assert DATABASE_URL == f'sqlite:///{os.getenv("DATABASE_NAME")}'

    def test_connect_args(self):
        assert connect_args == {"check_same_thread": False}
