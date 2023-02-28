import json
import logging
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Optional, Union

from compiler_server_service.routers.templates import BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.tutorial_dao import TopicData, TutorialDAO
from compiler_server_service.services.user_dao import (
    CompletedTutorial__OnlyId,
    UserData,
)
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request
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
def get_tutorial_detail(topicId:int, tutorialId: int, user_id:Optional[str]=None):
    """returns relevant information about the tutorial"""
    
    @dataclass 
    class Result(BasicResponse):
        default_code:                    Union[str, dict] = ''
        previous_tutorial_topicid_tutid: tuple[int, int] = (None, None)
        next_tutorial_topicid_tutid    : tuple[int, int ] = (None, None)
        diagram:                         str = ''
        instruction_notebook_name:       str = ''
        no_tutorial                     : bool = False
        
        
    result = Result()
    
    tutorial = TutorialDAO.find_tutorial(topicId=topicId, tutorialId=tutorialId)
    
    if not tutorial: 
        result.errors = 'tutorial not found'
        raise HTTPException(status_code=404, detail=result)
    
    result.no_tutorial = tutorial.no_tutorial
    result.instruction_notebook_name = tutorial.tutorial_instructions
    result.default_code = tutorial.default_code
    
    previous_tutorial = TutorialDAO.get_previous_tutorial_of_tutorial(topicId=topicId, tutorialId=tutorialId)
    if previous_tutorial:
        result.previous_tutorial_topicid_tutid = (TutorialDAO.get_topicId_of_tutorial(previous_tutorial), previous_tutorial.id)
    
    next_tutorial = TutorialDAO.get_next_tutorial_of_tutorial(topicId=topicId, tutorialId=tutorialId)
    if next_tutorial:
        result.next_tutorial_topicid_tutid = (TutorialDAO.get_topicId_of_tutorial(next_tutorial), next_tutorial.id)
    
    return result

@router.get('/tutorials')
def get_tutorials(user_id:Optional[str]=None):
    # TutorialDataLoader.topic_data_list
    
    @dataclass 
    class Result(BasicResponse):
        data               : list = field(default_factory=lambda: TutorialDAO.topic_data_list)
        tutorials_completed: list[CompletedTutorial__OnlyId] = field(default_factory=lambda: [])
    
    log.info(TutorialDAO.topic_data_list)
    result = Result()
    
    log.info(result)    
    
    if user_id: 
        if user := UserData.find_by_id(user_id):
            result.tutorials_completed = user.tutorials_completed
    
    return result
        