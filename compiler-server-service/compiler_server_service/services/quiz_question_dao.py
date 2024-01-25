import inspect
import logging
import uuid
from dataclasses import asdict, dataclass, field
from typing import ClassVar, List, Union

from compiler_server_service.services.db_dao import DB_DAO

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


@dataclass
class QuizQuestionData:
    title: str
    options: List[str]
    solution: List[int] # list of indices (0-based) corresponding to options
    score: int
    questionType: str # radio or checkbox
    image: str # URL or path
    quiz: str # quiz id
    id: str = field(default_factory=lambda: str(uuid.uuid4()))

    table_name: ClassVar[str] = 'QuizQuestions'
    
    def create(self):
        try:
            self.get_collection().insert_one(asdict(self))
            return self
        except Exception:
            log.exception('error on writing new object to db')
            return False
    
    # def add_completed_tutorial(self, tutorial: CompletedTutorial__OnlyId):
    #     self.tutorials_completed.append(tutorial)
    #     return self.update()
    
    # def update(self):
    #     """returns true if all items were updated successfully, false otherwise"""
    #     # update all declared attribute_names and their values for this object (not including weird python auto defined attributes)
    #     try:
    #         result = self.get_collection().replace_one({'id':self.id}, asdict(self))   
    #         if result.modified_count == 0: 
    #             return False
    #         elif result.modified_count == 1: 
    #             return True
    #         else:
    #             log.error('more than one item was updated when only one object was modified')
    #             return True
                
    #     except Exception:
    #         log.exception('error on updating user object to db')
    #         return False
            
    # def get_db_values(self):
    #     """Repopulates the attributes of this object with its values in the db"""
    #     found_object = self.get_collection().find_one({'id':self.id})
    #     return UserData.from_dict(found_object)        
    
    # @classmethod
    # def find_by_id(cls, id):
    #     found_object = cls.get_collection().find_one({'id': id})
    #     return UserData.from_dict(found_object)        
    
    
    # @classmethod
    # def find_by_title(cls, title:str):
    #     found_object = cls.get_collection().find_one({'title': title})
    #     return QuizQuestion.from_dict(found_object)

    # @classmethod
    # def find_by_quiz_title(cls, quiz_title):
    #     questions = cls.get_collection().find({'title' : quiz_title}, {'_id': 0}) # exclude _id from result
    #     # log.info(questions)
    #     return questions            
    
    @classmethod
    def find_by_quiz_id(cls, quiz_id):
        questions = cls.get_collection().find({'quiz' : quiz_id}, {'_id': 0}) # exclude _id from result
        # log.info(questions)
        return questions    
    
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
        

