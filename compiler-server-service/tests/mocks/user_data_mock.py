from compiler_server_service.services.db_dao import DB_DAO
from compiler_server_service.services.user_dao import UserData


class MockUserData(UserData):
    table_name = 'MockUsers'
    
    
    @classmethod
    def get_collection(cls):
        return DB_DAO.get_database()[cls.table_name]
        