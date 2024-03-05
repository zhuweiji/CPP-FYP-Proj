import inspect
import logging
import uuid
from dataclasses import asdict, dataclass, field
from typing import ClassVar, List, Union

from compiler_server_service.services.db_dao import DB_DAO

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

@dataclass
class ExamSolutionData:
    title: str
    link: str
    file: str
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    
    table_name: ClassVar[str] = 'ExamSolutions'
    
    def create(self):
        try:
            self.get_collection().insert_one(asdict(self))
            return self
        except Exception:
            log.exception('error on writing new object to db')
            return False  
        
    @classmethod
    def find_all(cls):
        exam_solutions = cls.get_collection().find({}, {'_id': 0}) # exclude _id from result
        return exam_solutions  
    
    @classmethod
    def find_by_id(cls, id):
        found_object = cls.get_collection().find_one({'id': id})
        return ExamSolutionData.from_dict(found_object)        
    
    
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
        

