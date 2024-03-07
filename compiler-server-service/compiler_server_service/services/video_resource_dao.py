import inspect
import logging
import uuid
from dataclasses import asdict, dataclass, field
from typing import ClassVar, List, Union

from compiler_server_service.services.db_dao import DB_DAO

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


# @dataclass
# class CompletedTutorial__OnlyId:
#     """abstracted tutorial object that only contains the relevant ids to be searched for"""
#     topic_id: int
#     tutorial_id: int

@dataclass
class VideoResourceData:
    title: str
    description: str
    link: str
    rating_count: int = 0
    rating_total: int = 0
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    
    table_name: ClassVar[str] = 'VideoResources'
    
    def create(self):
        try:
            self.get_collection().insert_one(asdict(self))
            return self
        except Exception:
            log.exception('error on writing new object to db')
            return False  
        
    @classmethod
    def find_all(cls):
        videos = cls.get_collection().find({}, {'_id': 0}) # exclude _id from result
        return videos  
    
    @classmethod
    def find_by_id(cls, id):
        found_object = cls.get_collection().find_one({'id': id})
        return VideoResourceData.from_dict(found_object)        
    
    
    @classmethod
    def get_collection(cls):
        return DB_DAO.get_database()[cls.table_name]
    
    @classmethod
    def from_dict(cls, d):
        if not d: return None
        return cls(**{
            k: v for k, v in d.items() 
            if k in inspect.signature(cls).parameters
        })
        

