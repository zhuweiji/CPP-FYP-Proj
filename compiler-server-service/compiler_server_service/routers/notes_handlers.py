import json
import logging
import os
from dataclasses import dataclass
from pathlib import Path

import uuid
from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.notes_dao import NotesData
from compiler_server_service.services.db_dao import DB_DAO
from compiler_server_service.services.resource_rating_dao import ResourceRatingData
from compiler_server_service.services.resource_comment_dao import ResourceCommentData
from compiler_server_service.services.user_dao import UserData
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request, Form, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(
    format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/notes'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['Notes'],
)


class DELETE_Delete_Notes(BaseModel):
    user_id: str


@router.delete('/{id}', status_code=200)
def delete_notes_by_id(request: Request, id: str, data: DELETE_Delete_Notes):
    found_user = UserData.find_by_id(data.user_id)
    if not found_user:
        raise HTTPException(
            status_code=404, detail='user ID does not exist')

    if found_user.privilege != 'admin':
        raise HTTPException(
            status_code=403, detail='user not allowed to delete resource')

    found_notes = NotesData.find_by_id(id)

    if not found_notes:
        raise HTTPException(
            status_code=404, detail='notes ID does not exist')

    client = DB_DAO.db_client
    # start DB session
    try:
        with client.start_session() as session:
            with session.start_transaction():
                deleted_count = NotesData.remove_by_id(id, session=session)
                if deleted_count == 0:
                    raise HTTPException(
                        status_code=500, detail='Unknown error occurred')

                # remove corresponding ratings
                deleted_ratings_count = ResourceRatingData.delete_ratings_by_resource_id(
                    id, session=session)

                if found_notes.rating_count != deleted_ratings_count:
                    log.warning('Deleted ' + str(deleted_ratings_count) +
                                ' ratings but ' + str(found_notes.rating_count) + ' existed')

                # remove corresponding comments
                deleted_comments_count = ResourceCommentData.deleted_comments_by_resource_id(
                    id, session=session)

                # remove corresponding file if it exists
                if found_notes.file:
                    if os.path.exists(found_notes.file):
                        os.remove(found_notes.file)
                    else:
                        log.warning(
                            'Could not find the file to delete (' + found_notes.file + ')')
    except Exception as e:
        raise e

    return {
        'detail': 'Notes successfully deleted',
        'id': id,
        'ratingsCount': deleted_ratings_count,
        'commentsCount': deleted_comments_count
    }


@router.post('/create', status_code=201)
async def create_notes(title: str = Form(...), description: str = Form(...),
                       link: str = Form(...), file: UploadFile = None):

    if file:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=429, detail='Invalid file type!')
        try:
            contents = await file.read()

            folder_path = "./uploads"
            os.makedirs(folder_path, exist_ok=True)

            new_file_name = str(uuid.uuid4()) + file.filename
            file_path = os.path.join(folder_path, new_file_name)
            with open(file_path, "wb") as output_file:
                output_file.write(contents)
        except:
            raise HTTPException(status_code=500, detail='error on file saving')

    new_notes = NotesData(
        title=title,
        description=description,
        link=link if link else "",
        file="uploads/" + new_file_name if file else ""
    ).create()
    log.warning("test2")
    if not new_notes:
        raise HTTPException(status_code=500, detail='error on FAQ creation')
    return {'notes_id': new_notes.id, 'title': new_notes.title, 'file': new_notes.file}


@router.get('/', status_code=200)
def get_all_notes(request: Request):
    notes = NotesData.find_all()

    # Convert Cursor object to a list
    notesList = [note for note in notes]

    return {
        'notes': notesList
    }
