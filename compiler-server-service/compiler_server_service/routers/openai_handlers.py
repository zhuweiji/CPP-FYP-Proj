import logging

from compiler_server_service.services.notebook_dao import NotebookDAO
from compiler_server_service.services.open_api_dao import evaluate_code, generate_prompt

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel

ROUTE_PREFIX = '/terminator'

router = APIRouter(
    prefix=ROUTE_PREFIX,
)

@router.get('/generate')
async def generate_prompt_handler():
    prompt = await generate_prompt()
    return BasicResponse(message=prompt)


class POST__Evaluate_Code(POST_BODY):
    all_code: dict

@router.post('/evalute')
@limiterobj.limit('10/minute')
async def evaluate_code_handler(request: Request, data: POST__Evaluate_Code):
    join_filenames_and_code = lambda d: '\n'.join([f'{filename}\n---------\n{code}' for filename,code in d.items()])
    joined_code = join_filenames_and_code(data)
    result = evaluate_code(joined_code)
    return result