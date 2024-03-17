import inspect
import logging
import uuid
from datetime import datetime
from dataclasses import asdict, dataclass, field
from typing import ClassVar

from compiler_server_service.services.db_dao import DB_DAO

logging.basicConfig(
    format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


@dataclass
class ResourceCommentData:
    user_id: str
    user_name: str
    resource_id: str
    text: str
    resource_type: str  # notes, exam_paper, exam_solution, video_resource
    time_stamp: str = field(default_factory=lambda: str(datetime.now()))
    id: str = field(default_factory=lambda: str(uuid.uuid4()))

    table_name: ClassVar[str] = 'ResourceComments'

    def create(self):
        try:
            self.get_collection().insert_one(asdict(self))
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

    # @classmethod
    # def update_rating(cls, id: str, new_rating: int):
    #     updated_object = cls.get_collection().find_one_and_update({'id': id}, {'$set': {'rating': new_rating}})
    #     return cls.from_dict(updated_object)

    @classmethod
    def deleted_comments_by_resource_id(cls, resource_id: str) -> int:
        result = cls.get_collection().delete_many({'resource_id': resource_id})
        return result.deleted_count

    @classmethod
    def find_all_by_resource_id(cls, resource_id: str):
        res = cls.get_collection().find(
            {'resource_id': resource_id}, {'_id': 0})
        return res

    # @classmethod
    # def find_by_keys(cls, user_id: str, resource_id: str):
    #     found_object = cls.get_collection().find_one({'user_id': user_id, 'resource_id': resource_id})
    #     return cls.from_dict(found_object)

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
