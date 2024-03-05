import json
import logging
from dataclasses import dataclass
from pathlib import Path

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.video_resource_dao import VideoResourceData
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/video-resources'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['Video-resources'],
)


class POST_Create_Video_Resource(BaseModel):
    title: str
    description: str
    link: str

@router.post('/create', status_code=201)
def create_video_resource(request: Request, data: POST_Create_Video_Resource):    
    new_video = VideoResourceData(
        title=data.title, 
        description=data.description,
        link=data.link,
    ).create()

    if not new_video: 
        raise HTTPException(status_code=500, detail='error on Video creation')
    return {'video_resource_id': new_video.id, 'title': new_video.title}

@router.get('/', status_code=200)
def get_all_video_resources(request: Request):
    videos = VideoResourceData.find_all()
    
    # Convert Cursor object to a list
    videosList = [video for video in videos]

    return {
        'video_resources': videosList
    }