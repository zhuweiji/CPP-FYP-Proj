import inspect
import logging
import uuid
from dataclasses import asdict, dataclass, field
from typing import ClassVar, List, Union

from compiler_server_service.services.db_dao import DB_DAO

logging.basicConfig(
    format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


@dataclass
class QuizData:
    title: str
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    questions: List[int] = field(default_factory=lambda: [])
    # tutorials_completed: List[CompletedTutorial__OnlyId] = field(default_factory=lambda: [])

    table_name: ClassVar[str] = 'Quizzes'

    def create(self, session=None):
        try:
            self.get_collection().insert_one(asdict(self), session=session)
            return self
        except Exception:
            # could try to create in db again at another time
            log.exception('error on writing new object to db')
            return False

    # def get_db_values(self):
    #     """Repopulates the attributes of this object with its values in the db"""
    #     found_object = self.get_collection().find_one({'id':self.id})
    #     return UserData.from_dict(found_object)

    @classmethod
    def remove_by_id(cls, id, session=None):
        log.info('attempting delete: ' + str(id))
        result = cls.get_collection().delete_many({'id': id}, session=session)
        return result.deleted_count

    @classmethod
    def find_all(cls):
        quizzes = cls.get_collection().find({}, {'_id': 0, 'questions': 0}
                                            )  # exclude _id and questions from result
        return quizzes

    @classmethod
    def find_by_id(cls, id):
        found_object = cls.get_collection().find_one({'id': id})
        return QuizData.from_dict(found_object)

    @classmethod
    def find_by_title(cls, title: str):
        found_object = cls.get_collection().find_one({'title': title})
        return QuizData.from_dict(found_object)

    @classmethod
    def get_collection(cls):
        return DB_DAO.get_database()[cls.table_name]

    @classmethod
    def from_dict(cls, d):
        if not d:
            return None
        return cls(**{
            k: v for k, v in d.items()
            if k in inspect.signature(cls).parameters
        })
