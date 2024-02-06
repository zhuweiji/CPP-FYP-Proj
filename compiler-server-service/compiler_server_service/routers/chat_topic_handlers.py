import logging
from dataclasses import dataclass

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.chat_topic_dao import ChatTopicData
from compiler_server_service.utilities import safe_get

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/chat-topics'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['ChatTopics'],
)

class POST_Create_Chat_Topic(BaseModel):
    title: str

@router.post('/create', status_code=201)
def create_chat_topic(request: Request, data: POST_Create_Chat_Topic):
    found_topic = ChatTopicData.find_by_title(data.title)
    if found_topic:
        raise HTTPException(status_code=409, detail='chat topic already exists')
    
    new_topic = ChatTopicData(title=data.title).create()
    if not new_topic: 
        raise HTTPException(status_code=500, detail='error on chat topic creation')

    return {'chat_topic_id': new_topic.id, 'title':new_topic.title}

@router.get('/', status_code=200)
def get_all_chat_topics(request: Request):
    topics = ChatTopicData.find_all()
    
    # Convert Cursor object to a list
    topicsList = [topic for topic in topics]

    return {
        'topics': topicsList
    }