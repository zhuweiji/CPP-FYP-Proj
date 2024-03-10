import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Annotated

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.tutorial_dao import TopicData, TutorialDAO
from compiler_server_service.services.quiz_dao import QuizData
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request, Form, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(
    format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/quizzes'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['Quizzes'],
)


# class POST__Login(BaseModel):
#     username: str

# @router.post('/login')
# def login(request: Request, data: POST__Login):
#     if found_user := UserData.find_by_name(data.username):
#         log.info(found_user)
#         return {'user_id': found_user.id, 'username': found_user.name}
#     else:
#         raise HTTPException(status_code=404, detail='user not found')


class POST_Create_Quiz(BaseModel):
    title: str


@router.post('/create', status_code=201)
def create_quiz(request: Request, data: POST_Create_Quiz):
    found_quiz = QuizData.find_by_title(data.title)
    if found_quiz:
        raise HTTPException(
            status_code=409, detail='quiz title already exists')

    new_quiz = QuizData(title=data.title).create()
    if not new_quiz:
        raise HTTPException(status_code=500, detail='error on quiz creation')
    return {'quiz_id': new_quiz.id, 'title': new_quiz.title, 'questions': new_quiz.questions}


@router.post('/create-whole', status_code=201)
def create_whole_quiz(
    file_list: list[UploadFile] = None,
    title: str = Form(...),
    question_title_list: str = Form(...),
    options_list: str = Form(...),
    question_type_list: str = Form(...),
    score_list: str = Form(...),
    solution_list: str = Form(...),
    has_file_list: str = Form(...),
):
    if file_list:
        log.info('num files: ' + str(len(file_list)))
    else:
        log.info('none!')
    return {
        'message': 'Success!'
    }
    # found_quiz = QuizData.find_by_title(data.title)
    # if found_quiz:
    #     raise HTTPException(
    #         status_code=409, detail='quiz title already exists')

    # new_quiz = QuizData(title=data.title).create()
    # if not new_quiz:
    #     raise HTTPException(status_code=500, detail='error on quiz creation')
    # return {'quiz_id': new_quiz.id, 'title': new_quiz.title, 'questions': new_quiz.questions}


@router.get('/', status_code=200)
def get_all_quizzes(request: Request):
    quizzes = QuizData.find_all()

    # Convert Cursor object to a list
    quizzesList = [quiz for quiz in quizzes]

    return {
        'quizzes': quizzesList
    }
