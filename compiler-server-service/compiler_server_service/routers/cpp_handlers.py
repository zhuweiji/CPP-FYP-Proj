import logging

from compiler_server_service.services.cpp_compiler.cpp_compiler_revised import (
    CPP_Compiler,
)
from compiler_server_service.services.grader import Grader
from compiler_server_service.services.tutorial_dataloader import TutorialDataNotFound
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from compiler_server_service.services.limiter.rate_limiter import limiterobj

ROUTE_PREFIX = '/cpp'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['Compiler Service'],
)


@router.get('/')
def compiler_status(request: Request):
    return {'message': "we're up"}


class POST__Compile_Run(BaseModel):
    code: str

@router.post('/compile_and_run')
@limiterobj.limit('10/minute')
def handle_compile_and_run(request: Request, data: POST__Compile_Run):
    try:
        log.info(f"COMPILING... :\n{data.code}")
        compile_result = CPP_Compiler.write_compile_run(data.code)
    
        return {'result': compile_result.full_str()}
    
    except Exception:
        log.exception('')
        return HTTPException(status_code=500, detail='internal server error')
    

class POST__Compile_Grade(BaseModel):
    code: str
    topicId:int
    tutorialId: int


@router.post('/grade_code')
@limiterobj.limit('10/minute')
def handle_compile_and_grade(request: Request, data: POST__Compile_Grade):
    """Grades a user's code - 
        1. Checks console output if the user's code against provided model output
        2. Runs code against provided doctests to check 
    """
    result = {'result': False}
    
    try:
        log.info(f"GRADING... :\n{data.code}")
        
        console_check_output = Grader.check_console_output(topicId=data.topicId, tutorialId=data.tutorialId, code=data.code)
        if console_check_output is not True:
            result['result'] = console_check_output
            return result

        doctest_output = Grader.check_doctest(topicId=data.topicId, tutorialId=data.tutorialId, code=data.code)
        if doctest_output is not True: 
            result['result'] = doctest_output
        else:
            result['result'] = 'Correct!'
        
        return result
    
    except TutorialDataNotFound as not_found_error:
        log.exception("")
        result['result'] = 'Our tests have not been written for this tutorial yet! Check back again later 🥰'
        return result
        
    except Exception:
        log.exception("")
        return HTTPException(status_code=500, detail='internal server error')
    
    


# @router.post('/run_test')
# def cpp_code_handler(cpp_code: POST_BODY__CPP_CODE):
#     # CPPCompiler.check_code()
#     # lint using https://github.com/cpplint/cpplint
    
#     output = CPPCompiler.run_tests(cpp_code.code)
#     # TestResultHandler.handle_result(output)
    
#     # TODO probably should decode output
#     return {'result':output}

