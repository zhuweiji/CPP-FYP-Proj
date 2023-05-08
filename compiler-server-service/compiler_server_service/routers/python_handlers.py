import logging

from compiler_server_service.routers.templates import BasicResponse
from compiler_server_service.services.cpp_compiler.cpp_compiler_revised import (
    LogicalCodeFile,
)
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from compiler_server_service.services.python_compiler.python_compiler import (
    Python_Runner,
)
from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel

log = logging.getLogger(__name__)

ROUTE_PREFIX = '/py'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['Python Service'],
)

@router.get('/')
async def heartbeat(request: Request):
    return BasicResponse(message="we're up!")

def parse_incoming_codegroup(code_data: dict):
    try:
        all_code = [LogicalCodeFile(filename=k, code=v) for k,v in code_data.items()]
        if len(all_code) > 1: raise ValueError
        all_code = all_code[0]
        return all_code
        
    except Exception as E:
        log.exception('error trying to parse incoming python code for compiling')
        raise HTTPException(status_code=400, detail=str(E))


class POST__Compile_Run_Multiple(BaseModel):
    all_code: dict

@router.post('/run')
@limiterobj.limit('10/minute')
async def handle_run(request: Request, data: POST__Compile_Run_Multiple):
    all_code = parse_incoming_codegroup(data.all_code)
    compile_result = Python_Runner.run_code(all_code=all_code)

    return BasicResponse(message=compile_result.full_str())