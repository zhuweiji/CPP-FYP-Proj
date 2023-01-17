import logging

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from compiler_server_service.limiter.rate_limiter import limiterobj

ROUTE_PREFIX = '/tutorials'

router = APIRouter(
    prefix=ROUTE_PREFIX
)


@router.get('/')
def root(request: Request):
    return {'message': "we're up"}


@router.get('/leftpane_instructions')
def get_leftpane_instructions(tutorialId: int):
    return """Hello!\n\nWelcome to Comprehend C++\n\nIn this section we will try to create log hello world into the console."""