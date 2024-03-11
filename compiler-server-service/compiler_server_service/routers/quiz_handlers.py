import json
import logging
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Annotated

import uuid
from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.tutorial_dao import TopicData, TutorialDAO
from compiler_server_service.services.quiz_dao import QuizData
from compiler_server_service.services.quiz_question_dao import QuizQuestionData
from compiler_server_service.services.db_dao import DB_DAO
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
async def create_whole_quiz(
    file_list: list[UploadFile] = None,
    title: str = Form(...),
    questions_data: str = Form(...),
    # question_title_list: str = Form(...),
    # options_list: str = Form(...),
    # question_type_list: str = Form(...),
    # score_list: str = Form(...),
    # solution_list: str = Form(...),
    # has_file_list: str = Form(...),
):
    if file_list:
        log.info('num files: ' + str(len(file_list)))
        for userFile in file_list:
            log.info(userFile.filename + ' ' + userFile.content_type)
    else:
        log.info('none!')

    data = json.loads(questions_data)

    # question_titles = json.loads(question_title_list)
    # options = json.loads(options_list)
    # question_types = json.loads(question_type_list)
    # scores = json.loads(score_list)
    # solutions = json.loads(solution_list)
    # has_file = json.loads(has_file_list)

    client = DB_DAO.db_client
    # start DB session
    try:
        with client.start_session() as session:
            with session.start_transaction():
                # check that quiz title does npt exist
                found_quiz = QuizData.find_by_title(title)
                if found_quiz:
                    raise HTTPException(
                        status_code=409, detail='quiz title already exists')

                # create the quiz first
                new_quiz = QuizData(title=title).create()
                if not new_quiz:
                    raise HTTPException(
                        status_code=500, detail='error on quiz creation')

                file_idx = 0
                # create the questions
                for question in data:
                    if question['hasFile']:
                        file = file_list[file_idx]
                        if not file:
                            raise HTTPException(
                                status_code=429, detail='Missing expected file!')
                        if file.content_type != "image/png" and file.content_type != "image/jpg" and file.content_type != "image/jpeg":
                            raise HTTPException(
                                status_code=429, detail='Invalid file type!')

                        contents = await file.read()
                        folder_path = "./uploads"
                        os.makedirs(folder_path, exist_ok=True)

                        new_file_name = str(uuid.uuid4()) + file.filename
                        file_path = os.path.join(folder_path, new_file_name)
                        with open(file_path, "wb") as output_file:
                            output_file.write(contents)
                    new_question = QuizQuestionData(
                        title=question['title'],
                        options=question['options'],
                        solution=question['solution'],
                        score=int(question['score']),
                        questionType=question['questionType'],
                        image="uploads/" +
                        new_file_name if question['hasFile'] else "",
                        quiz=new_quiz.id).create()
                    if not new_question:
                        raise HTTPException(
                            status_code=500, detail='error on quiz question creation')
                    log.info("success!!!")  # TODO: remove when done
                    pass
                pass
    except Exception as e:
        raise e

    # log.info(title)
    # log.info(question_title_list)
    # log.info(options_list)
    # log.info(question_type_list)
    # log.info(score_list)
    # log.info(solution_list)
    # log.info(has_file_list)

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
