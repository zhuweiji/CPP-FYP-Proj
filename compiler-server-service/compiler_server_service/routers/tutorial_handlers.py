import json
import logging
from pathlib import Path

from compiler_server_service.limiter.rate_limiter import limiterobj
from compiler_server_service.utilities import TUTORIAL_DATA_FILE_PATH, safe_get
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/tutorials'

router = APIRouter(
    prefix=ROUTE_PREFIX
)



with open(TUTORIAL_DATA_FILE_PATH) as f:
    all_tutorials_data = json.load(f)
    
    

log.info(all_tutorials_data)

@router.get('/')
def root(request: Request):
    return {'message': "we're up"}


@router.get('/leftpane_instructions')
def get_leftpane_instructions(tutorialId: int):
    if not (tutorial_data := safe_get(all_tutorials_data, f"tutorial {tutorialId}")): return "No data available for this tutorial"
    return safe_get(tutorial_data, "leftPaneInstructions")