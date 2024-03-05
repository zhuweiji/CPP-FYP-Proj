import json
import logging
from dataclasses import dataclass
from pathlib import Path

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.exam_solution_dao import ExamSolutionData
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/exam-solutions'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['ExamSolutions'],
)


class POST_Create_Exam_Solution(BaseModel):
    title: str
    link: str
    file: str

@router.post('/create', status_code=201)
def create_exam_paper(request: Request, data: POST_Create_Exam_Solution):    
    new_exam_solution = ExamSolutionData(
        title=data.title, 
        link=data.link,
        file=data.file
    ).create()

    if not new_exam_solution: 
        raise HTTPException(status_code=500, detail='error on object creation')
    return {'exam_solution_id': new_exam_solution.id, 'title': new_exam_solution.title}

@router.get('/', status_code=200)
def get_all_notes(request: Request):
    exam_solutions = ExamSolutionData.find_all()
    
    # Convert Cursor object to a list
    exam_solutions_list = [exam_solution for exam_solution in exam_solutions]

    return {
        'exam_solutions': exam_solutions_list
    }