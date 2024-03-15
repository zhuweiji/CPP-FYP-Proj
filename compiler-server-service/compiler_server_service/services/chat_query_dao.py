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
class ChatQueryData:
    question: str
    answer: str
    chat_topic: str  # chat topic id
    id: str = field(default_factory=lambda: str(uuid.uuid4()))

    table_name: ClassVar[str] = 'ChatQuery'

    def create(self):
        try:
            self.get_collection().insert_one(asdict(self))
            return self
        except Exception:
            log.exception('error on writing new object to db')
            return False

    def update(self):
        # returns true if all items were updated successfully, false otherwise
        try:
            result = self.get_collection().replace_one(
                {'id': self.id}, asdict(self))
            if result.modified_count == 0:
                return False
            elif result.modified_count == 1:
                return True
            else:
                log.warning(
                    'more than one item was updated when only one object was modified')
                return True

        except Exception:
            log.exception('error on updating query object to db')
            return False

    # @classmethod
    # def find_by_id(cls, id):
    #     found_object = cls.get_collection().find_one({'id': id})
    #     return UserData.from_dict(found_object)

    # @classmethod
    # def find_by_title(cls, title:str):
    #     found_object = cls.get_collection().find_one({'title': title})
    #     return QuizQuestion.from_dict(found_object)

    @classmethod
    def remove_by_id(cls, id):
        x = cls.get_collection().delete_many({'id': id})
        return x.deleted_count

    @classmethod
    def find_all(cls):
        queries = cls.get_collection().find({}, {'_id': 0})  # exclude _id from result
        return queries

    @classmethod
    def find_by_chat_topic_id(cls, chat_topic_id):
        queries = cls.get_collection().find({'chat_topic': chat_topic_id}, {
            '_id': 0})
        return queries

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
