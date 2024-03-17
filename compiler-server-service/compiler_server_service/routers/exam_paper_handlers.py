import json
import logging
import os
from dataclasses import dataclass
from pathlib import Path

import uuid
from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.exam_paper_dao import ExamPaperData
from compiler_server_service.services.db_dao import DB_DAO
from compiler_server_service.services.resource_rating_dao import ResourceRatingData
from compiler_server_service.services.resource_comment_dao import ResourceCommentData
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request, Form, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(
    format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/exam-papers'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['ExamPapers'],
)


@router.delete('/{id}', status_code=200)
def delete_exam_paper_by_id(request: Request, id: str):
    found_resource = ExamPaperData.find_by_id(id)

    if not found_resource:
        raise HTTPException(
            status_code=404, detail='Exam paper ID does not exist')

    client = DB_DAO.db_client
    # start DB session
    try:
        with client.start_session() as session:
            with session.start_transaction():
                deleted_count = ExamPaperData.remove_by_id(id)
                if deleted_count == 0:
                    raise HTTPException(
                        status_code=500, detail='Unknown error occurred')

                # remove corresponding ratings
                deleted_ratings_count = ResourceRatingData.delete_ratings_by_resource_id(
                    id)

                if found_resource.rating_count != deleted_ratings_count:
                    log.warning('Deleted ' + str(deleted_ratings_count) +
                                ' ratings but ' + str(found_resource.rating_count) + ' existed')

                # remove corresponding comments
                deleted_comments_count = ResourceCommentData.deleted_comments_by_resource_id(
                    id)

                # remove corresponding file
                if os.path.exists(found_resource.file):
                    os.remove(found_resource.file)
                else:
                    log.warning(
                        'Could not find the file to delete (' + found_resource.file + ')')

    except Exception as e:
        raise e

    return {
        'detail': 'Exam paper successfully deteled',
        'id': id,
        'ratingsCount': deleted_ratings_count,
        'commentsCount': deleted_comments_count
    }


@router.post('/create', status_code=201)
async def create_exam_paper(title: str = Form(...), link: str = None,
                            file: UploadFile = None):

    if file:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=500, detail='Invalid file type!')
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

    new_exam_paper = ExamPaperData(
        title=title,
        link=link if link else '',
        file='uploads/' + new_file_name if file else ''
    ).create()

    if not new_exam_paper:
        raise HTTPException(status_code=500, detail='error on object creation')
    return {'exam_paper_id': new_exam_paper.id, 'title': new_exam_paper.title, 'file': new_exam_paper.file}


@router.get('/', status_code=200)
def get_all_notes(request: Request):
    exam_papers = ExamPaperData.find_all()

    # Convert Cursor object to a list
    exam_papers_list = [exam_paper for exam_paper in exam_papers]

    return {
        'examPapers': exam_papers_list
    }
