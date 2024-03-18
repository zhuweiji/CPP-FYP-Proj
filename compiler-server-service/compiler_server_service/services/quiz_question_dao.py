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
class QuizQuestionData:
    title: str
    options: List[str]
    solution: List[int]  # list of indices (0-based) corresponding to options
    score: int
    questionType: str  # radio or checkbox
    image: str  # URL or path
    quiz: str  # quiz id
    id: str = field(default_factory=lambda: str(uuid.uuid4()))

    table_name: ClassVar[str] = 'QuizQuestions'

    def create(self, session=None):
        try:
            self.get_collection().insert_one(asdict(self), session=session)
            return self
        except Exception:
            log.exception('error on writing new object to db')
            return False

    @classmethod
    def delete_questions_by_quiz_id(cls, quiz_id: str, session=None) -> dict:
        questions = cls.get_collection().find(
            {'quiz': quiz_id}, {'_id': 0})
        result = cls.get_collection().delete_many(
            {'quiz': quiz_id}, session=session)
        return {'count': result.deleted_count, 'questions': questions}

    @classmethod
    def find_by_quiz_id(cls, quiz_id):
        questions = cls.get_collection().find(
            {'quiz': quiz_id}, {'_id': 0})  # exclude _id from result
        return questions

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
