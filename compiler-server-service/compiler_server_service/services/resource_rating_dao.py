import inspect
import logging
import uuid
from dataclasses import asdict, dataclass, field
from typing import ClassVar, List, Union

from compiler_server_service.services.db_dao import DB_DAO
from compiler_server_service.services.resource_dao import ResourceData

logging.basicConfig(
    format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


@dataclass
class ResourceRatingData:
    user_id: str
    resource_id: str
    rating: int
    resource_type: str  # notes, exam_paper, exam_solution, video_resource
    id: str = field(default_factory=lambda: str(uuid.uuid4()))

    table_name: ClassVar[str] = 'ResourceRatings'

    def create(self, session=None):
        try:
            self.get_collection().insert_one(asdict(self), session=session)
            return self
        except Exception:
            log.exception('error on writing new object to db')
            return False

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

    @classmethod
    def delete_ratings_by_resource_id(cls, resource_id: str, session=None) -> int:
        result = cls.get_collection().delete_many(
            {'resource_id': resource_id}, session=session)
        return result.deleted_count

    @classmethod
    def update_rating(cls, id: str, new_rating: int, session=None):
        updated_object = cls.get_collection().find_one_and_update(
            {'id': id}, {'$set': {'rating': new_rating}}, session=session)
        return cls.from_dict(updated_object)

    @classmethod
    def find_all_by_resource_type(cls, resource_type: str):
        res = cls.get_collection().find(
            {'resource_type': resource_type}, {'_id': 0})
        return res

    @classmethod
    def find_by_keys(cls, user_id: str, resource_id: str):
        found_object = cls.get_collection().find_one(
            {'user_id': user_id, 'resource_id': resource_id})
        return cls.from_dict(found_object)

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
