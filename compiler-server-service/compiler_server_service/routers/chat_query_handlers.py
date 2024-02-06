import logging
from dataclasses import dataclass
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.chat_topic_dao import ChatTopicData
from compiler_server_service.services.chat_query_dao import ChatQueryData
from compiler_server_service.utilities import safe_get


logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/chat-queries'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['ChatQueries'],
)


class POST_Create_Chat_Query(BaseModel):
    question: str
    answer: str
    chat_topic: str # chat_topic id

@router.post('/create', status_code=201)
def create_chat_query(request: Request, data: POST_Create_Chat_Query):
    found_topic = ChatTopicData.find_by_id(data.chat_topic)
    if not found_topic:
        raise HTTPException(status_code=404, detail='chat topic ID does not exist')
    
    new_query = ChatQueryData(question=data.question,
                              answer=data.answer,
                              chat_topic=data.chat_topic).create()
        
    
    if not new_query: 
        raise HTTPException(status_code=500, detail='error on chat query creation')
    
    return new_query


class GET_Get_Chat_Queries_By_Chat_Topic(BaseModel):
    topic: str

@router.get('/topic')
def get_chat_queries(request: Request, data: GET_Get_Chat_Queries_By_Chat_Topic, status_code=200):
    # Check if the topic exists
    found_topic = ChatTopicData.find_by_title(data.topic)
    if not found_topic:
        raise HTTPException(status_code=404, detail='topic does not exist')

    queries = ChatQueryData.find_by_chat_topic_id(found_topic.id)
    
    # Convert Cursor object to a list
    queriesList = [query for query in queries]

    return {
        'queries': queriesList
    }


@router.get('/{topic_id}')
def get_chat_queries(request: Request, topic_id, status_code=200):
    # Check if the quiz ID is valid
    found_topic = ChatTopicData.find_by_id(topic_id)
    if not found_topic:
        raise HTTPException(status_code=404, detail='topic does not exist')

    queries = ChatQueryData.find_by_chat_topic_id(topic_id)
    
    # Convert Cursor object to a list
    queriesList = [query for query in queries]

    return {
        'queries': queriesList
    }