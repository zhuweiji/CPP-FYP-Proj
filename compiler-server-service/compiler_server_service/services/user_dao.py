import logging
import uuid
from dataclasses import asdict, dataclass, field
from typing import ClassVar, Union

from compiler_server_service.services.db_dao import DB_DAO

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


@dataclass
class UserData:
    name: str
    id: int = field(default_factory=lambda: str(uuid.uuid4()))
    
    table_name: ClassVar[str] = 'Users'
    
    def __post_init__(self):
        try:
            log.info('post_init completed')
            self.get_collection().insert_one(asdict(self))
        except Exception:
            # could try to create in db again at another time
            log.exception('error on writing new object to db')
    
    
    def update(self):
        """returns true if all items were updated successfully, false otherwise"""
        # update all declared attribute_names and their values for this object (not including weird python auto defined attributes)
        try:
            return self.get_collection().replace_one({'id':self.id}, asdict(self))   
        except Exception:
            log.exception('error on writing new object to db')
            return False
            
    def restore(self):
        log.info(asdict(self))
        return self.get_collection().find_one(asdict(self))
    
    @classmethod
    def get_collection(cls):
        return DB_DAO.get_database()[cls.table_name]
    
    @classmethod
    def find_by_id(cls, id):
        return cls.get_collection().find_one({'id': id})
    
    @classmethod
    def find_by_name(cls, name:str) -> Union[dict, None]:
        return cls.get_collection().find_one({'name': name})
        
    