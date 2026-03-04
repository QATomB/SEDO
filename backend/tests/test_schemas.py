import datetime

from schemas import PydanticModels, SQLModels


class TestPydanticModels:
    def test_Token(self):
        token: PydanticModels.Token = PydanticModels.Token(access_token="token", token_type="type")
        assert hasattr(token, "access_token")
        if hasattr(token, "access_token"):
            assert type(token.access_token) == str
        assert hasattr(token, "token_type")
        if hasattr(token, "token_type"):
            assert type(token.token_type) == str
    
    def test_TokenData(self):
        token_data: PydanticModels.TokenData = PydanticModels.TokenData(username="employee_id")
        assert hasattr(token_data, "username")
        if hasattr(token_data, "username"):
            assert type(token_data.username) == str
            token_data.username = None
            assert type(token_data.username) == type(None)
    
    def test_UserBase(self):
        user_base: PydanticModels.UserBase = PydanticModels.UserBase(
            employee_id="employee_id",
            email="email",
            full_name="full name"
        )
        assert hasattr(user_base, "employee_id")
        if hasattr(user_base, "employee_id"):
            assert type(user_base.employee_id) == str
        assert hasattr(user_base, "email")
        if hasattr(user_base, "email"):
            assert type(user_base.email) == str
        assert hasattr(user_base, "full_name")
        if hasattr(user_base, "full_name"):
            assert type(user_base.full_name) == str

    def test_NewUser(self):
        new_user: PydanticModels.NewUser = PydanticModels.NewUser(
            employee_id="employee_id",
            email="email",
            full_name="full name",
            unhashed_password="password"
        )
        assert hasattr(new_user, "unhashed_password")
        if hasattr(new_user, "unhashed_password"):
            assert type(new_user.unhashed_password) == str
    
    def test_User(self):
        new_user: PydanticModels.User = PydanticModels.User(
            employee_id="employee_id",
            email="email",
            full_name="full name",
            access_level=1
        )
        assert hasattr(new_user, "access_level")
        if hasattr(new_user, "access_level"):
            assert type(new_user.access_level) == int
    
    def test_UpdateUser(self):
        pass

    def test_UserInDB(self):
        user_in_db: PydanticModels.UserInDB = PydanticModels.UserInDB(
            employee_id="employee_id",
            email="email",
            full_name="full name",
            hashed_password="password"
        )
        assert hasattr(user_in_db, "hashed_password")
        if hasattr(user_in_db, "hashed_password"):
            assert type(user_in_db.hashed_password) == str

    def test_NewAsset(self):
        new_asset: PydanticModels.NewAsset = PydanticModels.NewAsset(
            type="type",
            location_name="location"
        )
        assert hasattr(new_asset, "type")
        if hasattr(new_asset, "type"):
            assert type(new_asset.type) == str
        assert hasattr(new_asset, "location_name")
        if hasattr(new_asset, "location_name"):
            assert type(new_asset.location_name) == str
    
    def test_NewMovement(self):
        new_movement: PydanticModels.NewMovement = PydanticModels.NewMovement(
            asset_uid=1,
            new_location="location"
        )
        assert hasattr(new_movement, "asset_uid")
        if hasattr(new_movement, "asset_uid"):
            assert type(new_movement.asset_uid) == int
        assert hasattr(new_movement, "new_location")
        if hasattr(new_movement, "new_location"):
            assert type(new_movement.new_location) == str

class TestSQLModels:
    def test_User(self):
        user: SQLModels.User = SQLModels.User(
            employee_id="employee_id",
            email="email",
            full_name="full name",
            hashed_password="hashedpassword",
            access_level=1
        )
        assert hasattr(user, "employee_id")
        if hasattr(user, "employee_id"):
            assert type(user.employee_id) == str
        assert hasattr(user, "email")
        if hasattr(user, "email"):
            assert type(user.email) == str
        assert hasattr(user, "full_name")
        if hasattr(user, "full_name"):
            assert type(user.full_name) == str
        assert hasattr(user, "hashed_password")
        if hasattr(user, "hashed_password"):
            assert type(user.hashed_password) == str
        assert hasattr(user, "access_level")
        if hasattr(user, "access_level"):
            assert type(user.access_level) == int

    def test_Location(self):
        location: SQLModels.Location = SQLModels.Location(
            location_name="location",
            location_colour="red"
        )
        assert hasattr(location, "location_name")
        if hasattr(location, "location_name"):
            assert type(location.location_name) == str
        assert hasattr(location, "location_colour")
        if hasattr(location, "location_colour"):
            assert type(location.location_colour) == str
    
    def test_AssetType(self):
        asset_type: SQLModels.AssetType = SQLModels.AssetType(
            type="type"
        )
        assert hasattr(asset_type, "type")
        if hasattr(asset_type, "type"):
            assert type(asset_type.type) == str
    
    def test_Asset(self):
        asset_type: SQLModels.Asset = SQLModels.Asset(
            asset_uid=1,
            type="type"
        )
        assert hasattr(asset_type, "asset_uid")
        if hasattr(asset_type, "asset_uid"):
            assert type(asset_type.asset_uid) == int
        assert hasattr(asset_type, "type")
        if hasattr(asset_type, "type"):
            assert type(asset_type.type) == str

    def test_Asset(self):
        asset_location: SQLModels.AssetLocation = SQLModels.AssetLocation(
            movement_uid=1,
            asset=1,
            location="location",
            start_date=datetime.datetime.now(),
            end_date=datetime.datetime.now()
        )
        assert hasattr(asset_location, "movement_uid")
        if hasattr(asset_location, "movement_uid"):
            assert type(asset_location.movement_uid) == int
        assert hasattr(asset_location, "asset")
        if hasattr(asset_location, "asset"):
            assert type(asset_location.asset) == int
        assert hasattr(asset_location, "location")
        if hasattr(asset_location, "location"):
            assert type(asset_location.location) == str
        assert hasattr(asset_location, "start_date")
        if hasattr(asset_location, "start_date"):
            assert type(asset_location.start_date) == datetime.datetime
        assert hasattr(asset_location, "end_date")
        if hasattr(asset_location, "end_date"):
            assert type(asset_location.end_date) == datetime.datetime
            asset_location.end_date = None
            assert type(asset_location.end_date) == type(None)
