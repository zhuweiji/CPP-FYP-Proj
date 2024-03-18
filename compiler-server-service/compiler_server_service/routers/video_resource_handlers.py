import json
import logging
from dataclasses import dataclass
from pathlib import Path

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.video_resource_dao import VideoResourceData
from compiler_server_service.services.db_dao import DB_DAO
from compiler_server_service.services.resource_rating_dao import ResourceRatingData
from compiler_server_service.services.resource_comment_dao import ResourceCommentData
from compiler_server_service.services.user_dao import UserData
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(
    format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/video-resources'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['Video-resources'],
)


class DELETE_Delete_Video_Resource(BaseModel):
    user_id: str


@router.delete('/{id}', status_code=200)
def delete_video_resource_by_id(request: Request, id: str, data: DELETE_Delete_Video_Resource):
    found_user = UserData.find_by_id(data.user_id)
    if not found_user:
        raise HTTPException(
            status_code=404, detail='user ID does not exist')

    if found_user.privilege != 'admin':
        raise HTTPException(
            status_code=403, detail='user not allowed to delete resource')

    found_resource = VideoResourceData.find_by_id(id)

    if not found_resource:
        raise HTTPException(
            status_code=404, detail='Video resource ID does not exist')

    client = DB_DAO.db_client
    # start DB session
    try:
        with client.start_session() as session:
            with session.start_transaction():
                deleted_count = VideoResourceData.remove_by_id(
                    id, session=session)
                if deleted_count == 0:
                    raise HTTPException(
                        status_code=500, detail='Unknown error occurred')

                # remove corresponding ratings
                deleted_ratings_count = ResourceRatingData.delete_ratings_by_resource_id(
                    id, session=session)

                if found_resource.rating_count != deleted_ratings_count:
                    log.warning('Deleted ' + str(deleted_ratings_count) +
                                ' ratings but ' + str(found_resource.rating_count) + ' existed')

                # remove corresponding comments
                deleted_comments_count = ResourceCommentData.deleted_comments_by_resource_id(
                    id, session=session)

    except Exception as e:
        raise e

    return {
        'detail': 'Video resource successfully deleted',
        'id': id,
        'ratingsCount': deleted_ratings_count,
        'commentsCount': deleted_comments_count
    }


@router.post('/create', status_code=201)
def create_video_resource(title: str = Form(...), link: str = Form(...),
                          description: str = Form(...)):

    new_video = VideoResourceData(
        title=title,
        description=description,
        link=link,
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
        'videos': videosList
    }
