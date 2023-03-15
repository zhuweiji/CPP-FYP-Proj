import json
import logging
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import List, Optional, Tuple, Union

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.tutorial_dao import TopicData, TutorialDAO
from compiler_server_service.services.user_dao import (
    CompletedTutorial__OnlyId,
    UserData,
)
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/tutorials'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['Tutorials']
)

@router.get('/tutorial')
async def get_tutorial_detail(topicId:int, tutorialId: int, user_id:Optional[str]=None):
    """returns relevant information about the tutorial"""
    
    @dataclass 
    class Result(BasicResponse):
        default_code:                    Union[str, dict] = ''
        previous_tutorial_topicid_tutid: Tuple[int, int] = (None, None)
        next_tutorial_topicid_tutid    : Tuple[int, int ] = (None, None)
        diagram:                         str = ''
        instruction_notebook_name:       str = ''
        no_tutorial                     : bool = False
        
    result = Result()
    
    tutorial = TutorialDAO.find_tutorial(topicId=topicId, tutorialId=tutorialId)
    
    if not tutorial: 
        result.errors = 'tutorial not found'
        raise HTTPException(status_code=404)
    
    result.default_code = tutorial.default_code
    result.no_tutorial = tutorial.no_tutorial
    result.instruction_notebook_name = tutorial.tutorial_instructions
    
    previous_tutorial = TutorialDAO.get_previous_tutorial_of_tutorial(topicId=topicId, tutorialId=tutorialId)
    if previous_tutorial:
        result.previous_tutorial_topicid_tutid = (TutorialDAO.get_topicId_of_tutorial(previous_tutorial), previous_tutorial.id)
    
    next_tutorial = TutorialDAO.get_next_tutorial_of_tutorial(topicId=topicId, tutorialId=tutorialId)
    if next_tutorial:
        result.next_tutorial_topicid_tutid = (TutorialDAO.get_topicId_of_tutorial(next_tutorial), next_tutorial.id)
    
    return result

@router.get('/tutorials')
async def get_tutorials(user_id:Optional[str]=None):
    # TutorialDataLoader.topic_data_list
    
    @dataclass 
    class Result(BasicResponse):
        tutorials_completed: List[CompletedTutorial__OnlyId] = field(default_factory=lambda: [])
        data: list = field(default_factory=lambda: [])
        
    
    result = Result()
    result.data = TutorialDAO.topic_data_list
    
    if user_id: 
        if user := UserData.find_by_id(user_id):
            result.tutorials_completed = user.tutorials_completed
    
    return result

class POST__Mark_Tutorial_Completed(POST_BODY):
    topicId:int
    tutorialId: int

@router.post('/mark_tutorial', status_code=status.HTTP_200_OK)     
async def mark_tutorial_completed(request: Request, response: Response, data: POST__Mark_Tutorial_Completed):
    result = BasicResponse()
    
    if data.user_id:
        if not (user := UserData.find_by_id(data.user_id)):
            log.warning(f'could not find userid for user who completed tutorial data {data.user_id}')
            response.status_code = status.HTTP_404_NOT_FOUND
            return result
        
        add_tutorial_result = user.add_completed_tutorial(CompletedTutorial__OnlyId(topic_id=data.topicId, tutorial_id=data.tutorialId))
        log.info(add_tutorial_result)
        if add_tutorial_result:
            response.status_code = status.HTTP_201_CREATED
        else:
            raise HTTPException(status_code=500, detail= "Could not save the user's completed tutorial to db")
        
    return result