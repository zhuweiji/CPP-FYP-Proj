import logging

from compiler_server_service.services.notebook_dao import NotebookDAO

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel

ROUTE_PREFIX = '/notebooks'

router = APIRouter(
    prefix=ROUTE_PREFIX,
)


@router.get('/{notebook_id}')
def compiler_status(request: Request, notebook_id:str):
    log.info(notebook_id)
    notebook_name = notebook_id 
    notebook_data = NotebookDAO.get_notebook_by_name(notebook_name)
    
    if not notebook_data: raise HTTPException(status_code=404, detail='notebook not found')
    return BasicResponse(message=notebook_data)