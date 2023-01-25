import os

import certifi
from dotenv import dotenv_values
from pymongo import MongoClient

os.environ.update(dotenv_values())

import logging

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

class MongoDAO:
    __CONNECTION_STRING = os.environ['NF_MONGODB_MONGO_SRV_ADMIN']
    assert __CONNECTION_STRING, "Mongo DB connection URI must be provided"
    
    @classmethod
    def get_database(cls):
        return MongoClient(cls.__CONNECTION_STRING, tlsCAFile=certifi.where()).Compiler_Server_Service
    

class DB_DAO(MongoDAO):
    pass