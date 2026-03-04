from fastapi.testclient import TestClient
import pytest
# import mock
from sqlmodel import create_engine, SQLModel
from sqlmodel import Session
from sqlmodel.pool import StaticPool

# import backend as api
from backend import app
import database
from auth import get_password_hash
from schemas import PydanticModels, SQLModels

# Fixtures

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[database.get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture(name="user_in_db")
def user_in_db_fixture():
    return SQLModels.User(
        employee_id = "EMP000",
        email = "test@test.com",
        full_name = "Test Account",
        hashed_password = get_password_hash("pwd"),
        access_level = 1
    )

@pytest.fixture(name="admin_in_db")
def admin_in_db_fixture():
    return SQLModels.User(
        employee_id = "EMP001",
        email = "admin@test.com",
        full_name = "Test Admin",
        hashed_password = get_password_hash("pwd"),
        access_level = 2
    )




# Globals

TEST_USER: PydanticModels.User = PydanticModels.User(
    employee_id = "EMP000",
    email = "test@test.com",
    full_name = "Test Account",
    access_level = 1
)

TEST_ADMIN: PydanticModels.User = PydanticModels.User(
    employee_id = "EMP001",
    email = "admin@test.com",
    full_name = "Test Admin",
    access_level = 2
)

TEST_USER_JSON = {
    "employee_id": "EMP000",
    "email": "test@test.com",
    "full_name": "Test Account",
    "access_level": 1
}



# Tests

class TestAPIEndpoints:
    def test_read_users_me(self, session: Session, client: TestClient, user_in_db: SQLModels.User):
        session.add(user_in_db)
        session.commit()

        auth = client.post(
            "/token",
            data = {"username": "EMP000", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        res = client.get("/users/me/", headers={"Authorization" : f"Bearer {auth.json()['access_token']}"})
        assert res.status_code == 200
        assert res.json() == TEST_USER_JSON

    def test_get_all_users(self, session: Session, client: TestClient, user_in_db: SQLModels.User, admin_in_db: SQLModels.User):
        session.add(user_in_db)
        session.add(admin_in_db)
        session.commit()

        user_auth = client.post(
            "/token",
            data = {"username": "EMP000", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        admin_auth = client.post(
            "/token",
            data = {"username": "EMP001", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        user_res = client.get("/users/", headers={"Authorization" : f"Bearer {user_auth.json()['access_token']}"})
        admin_res = client.get("/users/", headers={"Authorization" : f"Bearer {admin_auth.json()['access_token']}"})
        
        assert user_res.status_code == 401
        assert admin_res.status_code == 200
        assert len(admin_res.json()) == 2
        
    def test_post_new_user(self, session: Session, client: TestClient, user_in_db: SQLModels.User):
        NEW_USER: PydanticModels.NewUser = PydanticModels.NewUser(
            employee_id="EMP002",
            email="email@email.com",
            full_name="Full Name",
            unhashed_password="pwd"
        )
        session.add(user_in_db)
        session.commit()

        auth = client.post(
            "/token",
            data = {"username": "EMP000", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        res = client.post(
            "/users/",
            json={
                "employee_id": NEW_USER.employee_id,
                "email": NEW_USER.email,
                "full_name": NEW_USER.full_name,
                "unhashed_password": NEW_USER.unhashed_password
            },
            headers={"Authorization" : f"Bearer {auth.json()['access_token']}"}
        )
        
        assert res.status_code == 200
        assert res.json() == "EMP002"
    
    def test_delete_user(self, session: Session, client: TestClient, user_in_db: SQLModels.User, admin_in_db: SQLModels.User):
        session.add(user_in_db)
        session.add(admin_in_db)
        session.commit()

        user_auth = client.post(
            "/token",
            data = {"username": "EMP000", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        admin_auth = client.post(
            "/token",
            data = {"username": "EMP001", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        user_res = client.delete(f"/users/{user_in_db.employee_id}", headers={"Authorization" : f"Bearer {user_auth.json()['access_token']}"})
        admin_res = client.delete(f"/users/{user_in_db.employee_id}", headers={"Authorization" : f"Bearer {admin_auth.json()['access_token']}"})
        
        assert user_res.status_code == 401
        assert admin_res.status_code == 200
        assert admin_res.json() == user_in_db.employee_id

    def test_put_user(self, session: Session, client: TestClient, user_in_db: SQLModels.User, admin_in_db: SQLModels.User):
        session.add(user_in_db)
        session.add(admin_in_db)
        session.commit()

        user_auth = client.post(
            "/token",
            data = {"username": "EMP000", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        admin_auth = client.post(
            "/token",
            data = {"username": "EMP001", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        user_res = client.put(
            f"/users/{user_in_db.employee_id}",
            json={
                "employee_id": "EMP002",
                "email": "new@email.com",
                "full_name": "New Full-Name",
                "unhashed_password": "pwd"
            },
            headers={"Authorization" : f"Bearer {user_auth.json()['access_token']}"}
        )
        admin_res = client.put(
            f"/users/{user_in_db.employee_id}",
            json={
                "employee_id": "EMP002",
                "email": "new@email.com",
                "full_name": "New Full-Name",
                "unhashed_password": "pwd"
            },
            headers={"Authorization" : f"Bearer {admin_auth.json()['access_token']}"}
        )
        
        assert user_res.status_code == 401
        assert admin_res.status_code == 200
        assert admin_res.json() == user_in_db.employee_id

    def test_post_new_asset_type(self, session: Session, client: TestClient, user_in_db: SQLModels.User):
        NEW_ASSET_TYPE: SQLModels.AssetType = SQLModels.AssetType(
            type="new type"
        )
        session.add(user_in_db)
        session.commit()

        auth = client.post(
            "/token",
            data = {"username": "EMP000", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        res = client.post(
            "/asset/type/",
            json={"type": NEW_ASSET_TYPE.type},
            headers={"Authorization" : f"Bearer {auth.json()['access_token']}"}
        )
        
        assert res.status_code == 200
        assert res.json() == {"type": "new type"}

    def test_post_new_asset(self, session: Session, client: TestClient, user_in_db: SQLModels.User):
        NEW_ASSET_TYPE: SQLModels.AssetType = SQLModels.AssetType(
            type="new type"
        )
        NEW_ASSET_LOCATION: SQLModels.Location = SQLModels.Location(
            location_name="location",
            location_colour="red"
        )
        session.add(user_in_db)
        session.add(NEW_ASSET_TYPE)
        session.add(NEW_ASSET_LOCATION)
        session.commit()

        auth = client.post(
            "/token",
            data = {"username": "EMP000", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        res = client.post(
            "/asset/",
            json={"type": NEW_ASSET_TYPE.type, "location_name": NEW_ASSET_LOCATION.location_name},
            headers={"Authorization" : f"Bearer {auth.json()['access_token']}"}
        )
        
        assert res.status_code == 200
        assert res.json() == 1

    def test_get_all_assets(self, session: Session, client: TestClient, user_in_db: SQLModels.User):
        NEW_ASSET_TYPE: SQLModels.AssetType = SQLModels.AssetType(
            type="new type"
        )
        NEW_ASSET: SQLModels.Asset = SQLModels.Asset(
            type=NEW_ASSET_TYPE.type,
        )
        session.add(user_in_db)
        session.add(NEW_ASSET_TYPE)
        session.add(NEW_ASSET)
        session.commit()

        auth = client.post(
            "/token",
            data = {"username": "EMP000", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        res = client.get(
            "/asset/",
            headers={"Authorization" : f"Bearer {auth.json()['access_token']}"}
        )
        
        assert res.status_code == 200
        assert len(res.json()) == 1

    def test_post_new_asset_movement(self, session: Session, client: TestClient, user_in_db: SQLModels.User):
        NEW_ASSET_TYPE: SQLModels.AssetType = SQLModels.AssetType(
            type="new type"
        )
        NEW_ASSET_LOCATION_1: SQLModels.Location = SQLModels.Location(
            location_name="location 1",
            location_colour="red"
        )
        NEW_ASSET_LOCATION_2: SQLModels.Location = SQLModels.Location(
            location_name="location 2",
            location_colour="green"
        )
        session.add(user_in_db)
        session.add(NEW_ASSET_TYPE)
        session.add(NEW_ASSET_LOCATION_1)
        session.add(NEW_ASSET_LOCATION_2)
        session.commit()

        auth = client.post(
            "/token",
            data = {"username": "EMP000", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        _ = client.post(
            "/asset/",
            json={"type": NEW_ASSET_TYPE.type, "location_name": NEW_ASSET_LOCATION_1.location_name},
            headers={"Authorization" : f"Bearer {auth.json()['access_token']}"}
        )

        res = client.post(
            "/asset/movements/",
            json={"asset_uid": 1, "new_location": "location 2"},
            headers={"Authorization" : f"Bearer {auth.json()['access_token']}"}
        )
        
        assert res.status_code == 200
        assert res.json() == 2

    def test_get_all_asset_movement(self, session: Session, client: TestClient, user_in_db: SQLModels.User):
        NEW_ASSET_TYPE: SQLModels.AssetType = SQLModels.AssetType(
            type="new type"
        )
        NEW_ASSET_LOCATION_1: SQLModels.Location = SQLModels.Location(
            location_name="location 1",
            location_colour="red"
        )
        session.add(user_in_db)
        session.add(NEW_ASSET_TYPE)
        session.add(NEW_ASSET_LOCATION_1)
        session.commit()

        auth = client.post(
            "/token",
            data = {"username": "EMP000", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        _ = client.post(
            "/asset/",
            json={"type": NEW_ASSET_TYPE.type, "location_name": NEW_ASSET_LOCATION_1.location_name},
            headers={"Authorization" : f"Bearer {auth.json()['access_token']}"}
        )

        res = client.get(
            "/asset/movements/",
            headers={"Authorization" : f"Bearer {auth.json()['access_token']}"}
        )
        
        assert res.status_code == 200
        assert len(res.json()) == 1

    def test_get_all_asset_types(self, session: Session, client: TestClient, user_in_db: SQLModels.User):
        NEW_ASSET_TYPE: SQLModels.AssetType = SQLModels.AssetType(
            type="new type"
        )
        session.add(user_in_db)
        session.add(NEW_ASSET_TYPE)
        session.commit()

        auth = client.post(
            "/token",
            data = {"username": "EMP000", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        res = client.get(
            "/asset/type/",
            headers={"Authorization" : f"Bearer {auth.json()['access_token']}"}
        )
        
        assert res.status_code == 200
        assert len(res.json()) == 1

    def test_post_new_location(self, session: Session, client: TestClient, user_in_db: SQLModels.User):
        LOCATION: SQLModels.Location = SQLModels.Location(
            location_name="location 1",
            location_colour="red"
        )
        session.add(user_in_db)
        session.commit()

        auth = client.post(
            "/token",
            data = {"username": "EMP000", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        res = client.post(
            "/asset/location/",
            json={"location_name": LOCATION.location_name, "location_colour": LOCATION.location_colour},
            headers={"Authorization" : f"Bearer {auth.json()['access_token']}"}
        )
        
        assert res.status_code == 200
        assert res.json() == LOCATION.location_name

    def test_get_all_asset_locations(self, session: Session, client: TestClient, user_in_db: SQLModels.User):
        NEW_ASSET_LOCATION_1: SQLModels.Location = SQLModels.Location(
            location_name="location 1",
            location_colour="red"
        )
        session.add(user_in_db)
        session.add(NEW_ASSET_LOCATION_1)
        session.commit()

        auth = client.post(
            "/token",
            data = {"username": "EMP000", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        res = client.get(
            "/asset/location/",
            headers={"Authorization" : f"Bearer {auth.json()['access_token']}"}
        )
        
        assert res.status_code == 200
        assert len(res.json()) == 1

    def test_get_specific_asset(self, session: Session, client: TestClient, user_in_db: SQLModels.User):
        NEW_ASSET_TYPE: SQLModels.AssetType = SQLModels.AssetType(
            type="new type"
        )
        NEW_ASSET_LOCATION: SQLModels.Location = SQLModels.Location(
            location_name="location",
            location_colour="red"
        )
        session.add(user_in_db)
        session.add(NEW_ASSET_TYPE)
        session.add(NEW_ASSET_LOCATION)
        session.commit()

        auth = client.post(
            "/token",
            data = {"username": "EMP000", "password": "pwd"},
            headers={"Authorization": "Basic Og=="}
        )

        dep = client.post(
            "/asset/",
            json={"type": NEW_ASSET_TYPE.type, "location_name": NEW_ASSET_LOCATION.location_name},
            headers={"Authorization" : f"Bearer {auth.json()['access_token']}"}
        )

        res = client.get(
            f"/asset/{dep.json()}",
            headers={"Authorization" : f"Bearer {auth.json()['access_token']}"}
        )
        
        assert res.status_code == 200
        assert res.json() == {"asset_uid": 1, "type": "new type"}
