import json
import logging
from dataclasses import dataclass
from pathlib import Path

from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.tutorial_dataloader import (
    TopicData,
    TutorialDataLoader,
)
from compiler_server_service.services.user_dao import UserData
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/users'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['Users'],
)


class POST__Login(BaseModel):
    username: str    

@router.post('/login')
def login(request: Request, data: POST__Login):
    try:
        log.info(UserData.find_by_name(data.username))
        return {}
    except Exception:
        log.exception('error handled while handling login request')
        return HTTPException(status_code=500, detail='internal server error')


@router.post('/create')
def create_user(request: Request, data: POST__Login):
    try:
        raise NotImplementedError
        return {}
    except Exception:
        log.exception('error handled while handling login request')
        return HTTPException(status_code=500, detail='internal server error')