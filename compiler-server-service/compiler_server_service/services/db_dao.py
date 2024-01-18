import asyncio
import os
from dataclasses import dataclass, field
from typing import Callable, Coroutine, Union

import aioredis
import async_timeout
import certifi
from dotenv import dotenv_values
from pymongo import MongoClient

os.environ.update(dotenv_values())

import logging

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


class MongoDAO:
    # __CONNECTION_STRING = os.environ['NF_MONGODB_MONGO_SRV_ADMIN']
    __CONNECTION_STRING = "mongodb+srv://purifish:Rdsprwb7658@cluster1.dejl43o.mongodb.net/fyp?retryWrites=true&w=majority"
    assert __CONNECTION_STRING, "Mongo DB connection URI must be provided"
    
    @classmethod
    def get_database(cls):
        return MongoClient(cls.__CONNECTION_STRING, tlsCAFile=certifi.where()).Compiler_Server_Service        


class DB_DAO(MongoDAO):
    pass


class RedisDAO:
    redis = aioredis.from_url('redis://localhost')
    CHANNEL_STOPWORD = "STOP"
    
    @classmethod
    async def publish(cls, channel:str,message:str):
        log.info('published new message to channel')
        await cls.redis.publish(channel, message)
    
    @classmethod
    async def subscribe(cls, handler:Coroutine, channel_name):
        """Create a coroutine to subscribe to Redis PubSub"""
        pubsub = cls.redis.pubsub()
        await pubsub.subscribe(channel_name)
        
        while True:
            message = pubsub.get_message(ignore_subscribe_messages=True)
            message = await message
            
            if message is not None:
                # decode from redis pubsub format (dict: bytes)
                message = {k:
                    v.decode() if isinstance(v, bytes) else v
                    for k,v in message.items()}
                await handler(message)
            await asyncio.sleep(0.5)
        
        # while True:
        #     log.info('waiting for message on channel')
        #     message = pubsub.get_message(ignore_subscribe_messages=True)
        #     if message is not None:
        #         if message["data"].decode() == cls.CHANNEL_STOPWORD:
        #             break
        #         else:
        #             handler(message)
        
        log.info('complete')

    @classmethod
    def set(cls, k:str,v:str):
        return cls.redis.set(k,v)
        
    @classmethod
    def get(cls, k:str):
        return  cls.redis.get(k)
                        
    @classmethod
    def add_to_a_stream(cls, stream_name:str, message:str):
        data = {'message': message}
        cls.redis.xadd(stream_name, data)
        return True
    
    @classmethod 
    def read_from_a_stream(cls, stream:Union[dict,str]):
        if isinstance(stream,str):
            d = {}
            d[stream] = 0 # $ gets latest messages
            stream = d
            
        result = cls.redis.xread(stream, 5000)
        
        if result:
            data = result[0][1][-20:]
            return [RedisStreamMessage(i[0],i[1]) for i in data]
        return []
    
    @classmethod
    def delete_from_stream(cls, stream_key):
        s1 = cls.redis.xread( streams={stream_key:0} )

        for streams in s1:
            stream_name, messages = streams
            # del all ids from the message list
            [ cls.redis.xdel( stream_name, i[0] ) for i in messages ]
            
    
@dataclass
class RedisStreamMessage:
    _id: bytes      = field(repr=False)
    _content: bytes = field(repr=False)
    
    id:      Union[str, None]  = None
    content: Union[dict, None] = None
    
    def __post_init__(self):
        self.id = self._id.decode()
        self.content = {k.decode(): v.decode() for k,v in self._content.items()}