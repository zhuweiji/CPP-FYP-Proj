import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import List

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.tutorial_dao import TopicData, TutorialDAO
from compiler_server_service.services.quiz_question_dao import QuizQuestionData
from compiler_server_service.services.quiz_dao import QuizData
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/quiz-questions'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['QuizQuestions'],
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
            


class POST_Create_Quiz_Question(BaseModel):
    title: str
    options: List[str]
    solution: List[int] # list of indices (0-based) corresponding to options
    score: int
    questionType: str # radio or checkbox
    image: str # URL or path
    quiz: str # quiz id

@router.post('/create', status_code=201)
def create_quiz(request: Request, data: POST_Create_Quiz_Question):
    found_quiz = QuizData.find_by_id(data.quiz)
    if not found_quiz:
        raise HTTPException(status_code=404, detail='quiz ID does not exist')
    
    new_question = QuizQuestionData(title=data.title, 
                                    options=data.options, 
                                    solution=data.solution,
                                    score=data.score,
                                    questionType=data.questionType,
                                    image=data.image,
                                    quiz=data.quiz).create()
    if not new_question: raise HTTPException(status_code=500, detail='error on quiz question creation')
    log.info("success!!!") # TODO: remove when done
    return new_question
    # return {'quiz_id': new_question.id, 'title':new_question.title, 'questions': new_question.questions}


@router.get('/{quiz_id}')
def get_quiz_questions(request: Request, quiz_id, status_code=200):
    # Check if the quiz ID is valid
    found_quiz = QuizData.find_by_id(quiz_id)
    if not found_quiz:
        raise HTTPException(status_code=404, detail='quiz ID does not exist')

    questions = QuizQuestionData.find_by_quiz_id(quiz_id)
    
    # Convert Cursor object to a list
    questionsList = [qn for qn in questions]

    log.info("success!!!") # TODO: remove when done
    return {
        'questions': questionsList
    }