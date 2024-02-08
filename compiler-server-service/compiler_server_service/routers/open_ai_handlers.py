import logging
import re
from dataclasses import dataclass

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.open_ai_dao import generate_prompt

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel

ROUTE_PREFIX = '/chatbot'

router = APIRouter(
    prefix=ROUTE_PREFIX,
)


class GET_Generate_Response(BaseModel):
    user_prompt: str
    is_first_prompt: bool

@router.post('/generate')
@limiterobj.limit('2/minute')
async def generate_prompt_handler(request: Request, data: GET_Generate_Response):
    # prompt = "testing"
    try:
        prompt = await generate_prompt(data.user_prompt, data.is_first_prompt)
    except HTTPException as err:
        raise err 
    except Exception as err:
        log.warning("Unknown error: " + str(err))
        raise err
    
    return {
        'answer': prompt
    }


# class POST__Evaluate_Code(POST_BODY):
#     all_code: dict
#     prompt: str

# @dataclass
# class OpenAPIEvaluateResponse(BasicResponse):
#     score: int = 0

# @router.post('/evalute')
# @limiterobj.limit('2/minute')
# async def evaluate_code_handler(request: Request, data: POST__Evaluate_Code):
#     filenames_to_code = data.all_code
#     prompt            = data.prompt
#     join_filenames_and_code = lambda d: '\n'.join([f'filename: {filename}\ncode:\n---------\n{code}' for filename,code in d.items()])
#     joined_code = join_filenames_and_code(filenames_to_code)
    
#     result = await evaluate_code(joined_code, prompt)
    
#     s  =  re.search(r'score:\s*(\d+)\/10', result)
#     try:
#         score = int(s.group(1)) if s is not None else 0
#     except ValueError:
#         score = 0
#     return OpenAPIEvaluateResponse(message=result, score=score)