import logging
import unittest

from compiler_server_service.services.db_dao import DB_DAO
from compiler_server_service.services.user_dao import UserData
from tests.mocks.user_data_mock import MockUserData

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


class TestUsers(unittest.TestCase):
    def test_user_database(self):
        tom = MockUserData('Tom')
        tom.create()
        assert MockUserData.find_by_id(tom.id)
        
        tom.name = 'Jerry'
        tom.update()
        entry_found = MockUserData.find_by_id(tom.id)
        assert entry_found.name == 'Jerry'
        
        
        
        
    