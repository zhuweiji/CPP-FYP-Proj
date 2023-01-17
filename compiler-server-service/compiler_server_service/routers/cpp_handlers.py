import logging

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from compiler_server_service.cpp_compiler.cpp_compiler_revised import CPP_Compiler
from compiler_server_service.limiter.rate_limiter import limiterobj

ROUTE_PREFIX = '/cpp'

router = APIRouter(
    prefix=ROUTE_PREFIX
)



class POST_BODY__CPP_CODE(BaseModel):
    code: str


@router.get('/')
def root(request: Request):
    return {'message': "we're up"}


@router.post('/compile_and_run')
@limiterobj.limit('10/minute')
def handle_compile_and_run(request: Request, data: POST_BODY__CPP_CODE):
    try:
        log.info(data.code)
        compile_result = CPP_Compiler.write_compile_run(data.code)
    
        return {'result': compile_result.full_str()}
    
    except Exception as E:
        log.exception(E)
        return HTTPException(status_code=500, detail='internal server error')
    
    


# @router.post('/run_test')
# def cpp_code_handler(cpp_code: POST_BODY__CPP_CODE):
#     # CPPCompiler.check_code()
#     # lint using https://github.com/cpplint/cpplint
    
#     output = CPPCompiler.run_tests(cpp_code.code)
#     # TestResultHandler.handle_result(output)
    
#     # TODO probably should decode output
#     return {'result':output}

