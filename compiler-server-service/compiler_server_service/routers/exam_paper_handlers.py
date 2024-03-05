import json
import logging
import os
from dataclasses import dataclass
from pathlib import Path

import uuid
from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.exam_paper_dao import ExamPaperData
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request, Form, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/exam-papers'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['ExamPapers'],
)


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