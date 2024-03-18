import json
import logging
import os
from dataclasses import dataclass

import uuid
from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.quiz_dao import QuizData
from compiler_server_service.services.quiz_question_dao import QuizQuestionData
from compiler_server_service.services.db_dao import DB_DAO
from compiler_server_service.services.user_dao import UserData
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


class DELETE_Delete_Quiz(BaseModel):
    user_id: str


@router.delete('/{id}', status_code=200)
def delete_quiz_by_id(request: Request, id: str, data: DELETE_Delete_Quiz):
    found_user = UserData.find_by_id(data.user_id)
    if not found_user:
        raise HTTPException(
            status_code=404, detail='user ID does not exist')

    if found_user.privilege != 'admin':
        raise HTTPException(
            status_code=403, detail='user not allowed to delete resource')

    found_notes = QuizData.find_by_id(id)

    if not found_notes:
        raise HTTPException(
            status_code=404, detail='Quiz ID does not exist')

    client = DB_DAO.db_client
    # start DB session
    try:
        with client.start_session() as session:
            with session.start_transaction():
                deleted_count = QuizData.remove_by_id(id, session=session)
                if deleted_count == 0:
                    raise HTTPException(
                        status_code=500, detail='Unknown error occurred')

                # remove corresponding questions
                result = QuizQuestionData.delete_questions_by_quiz_id(
                    id, session=session)

                # Convert Cursor object to a list
                questionsList = [qn for qn in result['questions']]
                log.info('questions: ' + str(questionsList))

                if result['count'] != len(questionsList):
                    log.warning('Deleted ' + str(result['count']) +
                                ' questions but ' + str(len(questionsList)) + ' existed')

                # remove corresponding images if they exist
                for qn in questionsList:
                    if qn['image']:
                        if os.path.exists(qn['image']):
                            os.remove(qn['image'])
                        else:
                            log.warning(
                                'Could not find the image to delete (' + qn['image'] + ')')
    except Exception as e:
        raise e

    return {
        'detail': 'Quiz successfully deleted',
        'id': id,
        'Questions Count': result['count']
    }


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
    questions_data: str = Form(...)
):
    if file_list:
        log.info('num files: ' + str(len(file_list)))
        for userFile in file_list:
            log.info(userFile.filename + ' ' + userFile.content_type)
    else:
        log.info('none!')

    data = json.loads(questions_data)

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
                new_quiz = QuizData(title=title).create(session=session)
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
                        folder_path = "./uploads/images"
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
                        image="uploads/images/" +
                        new_file_name if question['hasFile'] else "",
                        quiz=new_quiz.id).create(session=session)
                    if not new_question:
                        raise HTTPException(
                            status_code=500, detail='error on quiz question creation')
                    log.info("success!!!")  # TODO: remove when done
                    pass
                pass
    except Exception as e:
        raise e

    return {
        'detail': 'Success!'
    }


@router.get('/', status_code=200)
def get_all_quizzes(request: Request):
    quizzes = QuizData.find_all()

    # Convert Cursor object to a list
    quizzesList = [quiz for quiz in quizzes]

    return {
        'quizzes': quizzesList
    }
