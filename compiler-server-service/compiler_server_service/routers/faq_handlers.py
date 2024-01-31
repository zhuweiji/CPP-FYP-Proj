import json
import logging
from dataclasses import dataclass
from pathlib import Path

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.quiz_dao import QuizData
from compiler_server_service.services.faq_dao import FaqData
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/faqs'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['Faqs'],
)


class POST_Create_Faq(BaseModel):
    question: str
    answer: str

@router.post('/create', status_code=201)
def create_faq(request: Request, data: POST_Create_Faq):
    found_question = FaqData.find_by_question(data.question)
    if found_question:
        raise HTTPException(status_code=409, detail='FAQ already exists')
    
    new_faq = FaqData(question=data.question, answer=data.answer).create()
    if not new_faq: raise HTTPException(status_code=500, detail='error on FAQ creation')
    return {'faq_id': new_faq.id, 'question':new_faq.question, 'answer': new_faq.answer}

@router.get('/', status_code=200)
def get_all_faqs(request: Request):
    faqs = FaqData.find_all()
    
    # Convert Cursor object to a list
    faqsList = [faq for faq in faqs]

    return {
        'faqs': faqsList
    }