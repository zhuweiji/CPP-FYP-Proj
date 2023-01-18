import json
import logging
from dataclasses import dataclass
from pathlib import Path

from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.tutorial_dataloader import (
    TopicData,
    TutorialDataLoader,
)
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/tutorials'

router = APIRouter(
    prefix=ROUTE_PREFIX
)


@router.get('/')
def root(request: Request):
    return {'message': "we're up"}

@router.get('/leftpane_instructions')
def get_leftpane_instructions(topicId:int, tutorialId: int):
    return TutorialDataLoader.find_tutorial(topicId=topicId, tutorialId=tutorialId).leftPaneInstructions or "Sorry! No instructions found for this tutorial"

@router.get('/tutorial')
def get_tutorial_information(topicId:int, tutorialId: int):
    """returns relevant information about the tutorial"""
    
    @dataclass 
    class Response:
        leftpane_instructions:           str = ''
        previous_tutorial_topicid_tutid: tuple[int, int] = (None, None)
        next_tutorial_topicid_tutid    : tuple[int, int ] = (None, None)
        errors:                          str = ''
        message:                         str = ''
        
    response = Response()
    
    tutorial = TutorialDataLoader.find_tutorial(topicId=topicId, tutorialId=tutorialId)
    
    if not tutorial: 
        response.errors = 'tutorial not found'
        return JSONResponse(status_code=404, content=response)
        
    response.leftpane_instructions = tutorial.leftPaneInstructions or "Sorry! No instructions found for this tutorial"
    
    previous_tutorial = TutorialDataLoader.get_previous_tutorial_of_tutorial(topicId=topicId, tutorialId=tutorialId)
    if previous_tutorial:
        response.previous_tutorial_topicid_tutid = (TutorialDataLoader.get_topicId_of_tutorial(previous_tutorial), previous_tutorial.id)
    
    next_tutorial = TutorialDataLoader.get_next_tutorial_of_tutorial(topicId=topicId, tutorialId=tutorialId)
    if next_tutorial:
        response.next_tutorial_topicid_tutid = (TutorialDataLoader.get_topicId_of_tutorial(next_tutorial), next_tutorial.id)
        
    return response
