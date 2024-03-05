import json
import logging
from dataclasses import dataclass
from pathlib import Path

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.exam_paper_dao import ExamPaperData
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/exam-papers'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['ExamPapers'],
)


class POST_Create_Exam_Paper(BaseModel):
    title: str
    link: str
    file: str

@router.post('/create', status_code=201)
def create_exam_paper(request: Request, data: POST_Create_Exam_Paper):    
    new_exam_paper = ExamPaperData(
        title=data.title, 
        link=data.link,
        file=data.file
    ).create()

    if not new_exam_paper: 
        raise HTTPException(status_code=500, detail='error on object creation')
    return {'exam_paper_id': new_exam_paper.id, 'title': new_exam_paper.title}

@router.get('/', status_code=200)
def get_all_notes(request: Request):
    exam_papers = ExamPaperData.find_all()
    
    # Convert Cursor object to a list
    exam_papers_list = [exam_paper for exam_paper in exam_papers]

    return {
        'exam_papers': exam_papers_list
    }