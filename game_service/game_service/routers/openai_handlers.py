import logging
import re
from dataclasses import dataclass

from game_service.routers.templates import POST_BODY, BasicResponse
from game_service.services.open_api_dao import evaluate_code, generate_prompt

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel

from game_service.services.limiter.rate_limiter import limiterobj

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
    prompt: str

@dataclass
class OpenAPIEvaluateResponse(BasicResponse):
    score: int = 0

@router.post('/evalute')
@limiterobj.limit('2/minute')
async def evaluate_code_handler(request: Request, data: POST__Evaluate_Code):
    filenames_to_code = data.all_code
    prompt            = data.prompt
    join_filenames_and_code = lambda d: '\n'.join([f'filename: {filename}\ncode:\n---------\n{code}' for filename,code in d.items()])
    joined_code = join_filenames_and_code(filenames_to_code)
    
    result = await evaluate_code(joined_code, prompt)
    
    search  =  re.search(r'score:\s*(\d+)\/10')
    try:
        score = int(search.group(1)) if search is not None else 0
    except ValueError:
        score = 0
    return OpenAPIEvaluateResponse(message=result, score=score)