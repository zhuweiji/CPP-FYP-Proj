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
class ExamSolutionData:
    title: str
    link: str
    file: str
    rating_count: int = 0
    rating_total: int = 0
    id: str = field(default_factory=lambda: str(uuid.uuid4()))

    table_name: ClassVar[str] = 'ExamSolutions'

    def create(self, session=None):
        try:
            self.get_collection().insert_one(asdict(self), session=session)
            return self
        except Exception:
            log.exception('error on writing new object to db')
            return False

    @classmethod
    def add_rating(cls, id, rating, session=None):
        try:
            log.info('updating: ' + id)
            updated_object = cls.get_collection().find_one_and_update(
                {'id': id}, {'$inc': {'rating_count': 1, 'rating_total': rating}}, session=session)
            log.info(str(bool(updated_object)))
            return bool(updated_object)
        except Exception:
            log.exception('error on updating object on db')
            return False

    @classmethod
    def update_rating_stats(cls, id: str, increment: int, session=None):
        try:
            log.info('updating: ' + id)
            updated_object = cls.get_collection().find_one_and_update(
                {'id': id}, {'$inc': {'rating_total': increment}}, session=session)
            log.info(str(bool(updated_object)))
            return bool(updated_object)
        except Exception:
            log.exception('error on updating object on db')
            return False

    @classmethod
    def remove_by_id(cls, id, session=None):
        log.info('attempting delete: ' + str(id))
        result = cls.get_collection().delete_many({'id': id}, session=session)
        return result.deleted_count

    @classmethod
    def find_all(cls):
        exam_solutions = cls.get_collection().find(
            {}, {'_id': 0})  # exclude _id from result
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
        if not d:
            return None
        return cls(**{
            k: v for k, v in d.items()
            if k in inspect.signature(cls).parameters
        })
