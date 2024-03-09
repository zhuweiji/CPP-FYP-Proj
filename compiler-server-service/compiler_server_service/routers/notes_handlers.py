import json
import logging
import os
from dataclasses import dataclass
from pathlib import Path

import uuid
from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.notes_dao import NotesData
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request, Form, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/notes'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['Notes'],
)

@router.post('/create', status_code=201)
async def create_notes(title: str = Form(...), description: str = Form(...),
                       link: str = Form(...), file: UploadFile = None):   

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