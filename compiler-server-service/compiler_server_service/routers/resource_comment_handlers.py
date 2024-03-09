import logging

from compiler_server_service.services.resource_dao import ResourceData
from compiler_server_service.services.user_dao import UserData
from compiler_server_service.services.resource_rating_dao import ResourceRatingData
from compiler_server_service.services.notes_dao import NotesData
from compiler_server_service.services.exam_paper_dao import ExamPaperData
from compiler_server_service.services.exam_solution_dao import ExamSolutionData
from compiler_server_service.services.video_resource_dao import VideoResourceData
from compiler_server_service.services.db_dao import DB_DAO
from compiler_server_service.services.resource_comment_dao import ResourceCommentData
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

logging.basicConfig(
    format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/resource-comments'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['ResourceComments'],
)


class POST__Create_Comment(BaseModel):
    user_id: str
    resource_id: str
    text: str
    resource_type: str  # notes, exam_paper, exam_solution, video_resource


@router.post('/', status_code=201)
def create_comment(request: Request, data: POST__Create_Comment):
    # check valid user id
    found_user = UserData.find_by_id(data.user_id)
    if not found_user:
        raise HTTPException(status_code=404, detail='user not found')
    user_name = found_user.name

    # check valid resource id
    if data.resource_type == 'notes':
        found_resource = NotesData.find_by_id(data.resource_id)
        if not found_resource:
            raise HTTPException(status_code=404, detail='resource not found')
    elif data.resource_type == 'exam_paper':
        found_resource = ExamPaperData.find_by_id(data.resource_id)
        if not found_resource:
            raise HTTPException(status_code=404, detail='resource not found')
    elif data.resource_type == 'exam_solution':
        found_resource = ExamSolutionData.find_by_id(data.resource_id)
        if not found_resource:
            raise HTTPException(status_code=404, detail='resource not found')
    elif data.resource_type == 'video_resource':
        found_resource = VideoResourceData.find_by_id(data.resource_id)
        if not found_resource:
            raise HTTPException(status_code=404, detail='resource not found')
    else:
        raise HTTPException(status_code=404, detail='Invalid resource type')

    new_comment = ResourceCommentData(
        user_id=data.user_id,
        user_name=user_name,
        resource_id=data.resource_id,
        text=data.text,
        resource_type=data.resource_type
    ).create()

    if not new_comment:
        raise HTTPException(
            status_code=500, detail='error on comment creation')

    return {'commentId': new_comment.id,
            'userName': new_comment.user_name,
            'text': new_comment.text,
            'timeStamp': new_comment.time_stamp}


class GET__Get_Comments_By_Resource_Id(BaseModel):
    resource_id: str
    resource_type: str


@router.get('/', status_code=200)
def get_comments_by_resource_id(resource_id: str = '', resource_type: str = ''):
    if resource_id == '' or resource_type == '':
        raise HTTPException(status_code=404, detail='Missing parameters!')

    # check valid resource id
    if resource_type == 'notes':
        found_resource = NotesData.find_by_id(resource_id)
        if not found_resource:
            raise HTTPException(status_code=404, detail='resource not found')
    elif resource_type == 'exam_paper':
        found_resource = ExamPaperData.find_by_id(resource_id)
        if not found_resource:
            raise HTTPException(status_code=404, detail='resource not found')
    elif resource_type == 'exam_solution':
        found_resource = ExamSolutionData.find_by_id(resource_id)
        if not found_resource:
            raise HTTPException(status_code=404, detail='resource not found')
    elif resource_type == 'video_resource':
        found_resource = VideoResourceData.find_by_id(resource_id)
        if not found_resource:
            raise HTTPException(status_code=404, detail='resource not found')
    else:
        raise HTTPException(status_code=404, detail='Invalid resource type')

    comments = ResourceCommentData.find_all_by_resource_id(resource_id)

    # Convert Cursor object to a list
    comments_list = [comment for comment in comments]

    return {
        'resource': found_resource,
        'comments': comments_list
    }
