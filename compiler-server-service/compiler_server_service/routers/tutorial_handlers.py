import json
import logging
from pathlib import Path

from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.tutorial_dataloader import TutorialDataLoader
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request
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
