import json
import logging
from dataclasses import dataclass
from pathlib import Path

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.notes_dao import NotesData
from compiler_server_service.utilities import safe_get
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/notes'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['Notes'],
)


class POST_Create_Notes(BaseModel):
    title: str
    description: str
    link: str
    file: str

@router.post('/create', status_code=201)
def create_notes(request: Request, data: POST_Create_Notes):    
    new_notes = NotesData(
        title=data.title, 
        description=data.description,
        link=data.link,
        file=data.file
    ).create()

    if not new_notes: 
        raise HTTPException(status_code=500, detail='error on FAQ creation')
    return {'notes_id': new_notes.id, 'title': new_notes.title}

@router.get('/', status_code=200)
def get_all_notes(request: Request):
    notes = NotesData.find_all()
    
    # Convert Cursor object to a list
    notesList = [note for note in notes]

    return {
        'notes': notesList
    }