import logging

from compiler_server_service.routers.templates import POST_BODY, BasicResponse
from compiler_server_service.services.cpp_compiler.cpp_compiler_revised import (
    CPP_Compiler,
    LogicalCodeFile,
)
from compiler_server_service.services.grader import Grader
from compiler_server_service.services.tutorial_dao import TutorialDataNotFound
from compiler_server_service.services.user_dao import (
    CompletedTutorial__OnlyId,
    UserData,
)
from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from compiler_server_service.services.limiter.rate_limiter import limiterobj

ROUTE_PREFIX = '/cpp'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['Compiler Service'],
)

def create_file_to_null_stdcin():
    """Creates a CPP file that sets std::cin to null, otherwise the process will hang until timeout waiting for input from cin"""
    code = """
#include <iostream>
    
    struct myStruct
{
    myStruct() { std::cin.rdbuf(nullptr); }
};

namespace
{
    // Put in anonymous namespace, because this variable should not be accessed
    // from other translation units
    myStruct myStructVariable;
}"""
    return LogicalCodeFile(code=code)
    

def parse_incoming_codegroup(code_data: dict):
    try:
        all_code = [LogicalCodeFile(filename=k, code=v) for k,v in code_data.items()]
        all_code.append(create_file_to_null_stdcin())
        return all_code
        
    except Exception as E:
        log.exception('error trying to parse incoming code for compiling')
        raise HTTPException(status_code=400, detail=str(E))



@router.get('/')
def compiler_status(request: Request):
    return BasicResponse(message="we're up!")


class POST__Compile_Run_Multiple(BaseModel):
    all_code: dict

@router.post('/compile_and_run')
@limiterobj.limit('10/minute')
def handle_compile_and_run_multiple(request: Request, data: POST__Compile_Run_Multiple):
    all_code = parse_incoming_codegroup(data.all_code)
    compile_result = CPP_Compiler.write_compile_run(all_code=all_code)

    return BasicResponse(message=compile_result.full_str())


class POST__Compile_Run(BaseModel):
    all_code: dict
    user_id: str
    
@router.post('/compile_and_run_noerr')
@limiterobj.limit('10/minute')
def handle_compile_and_run(request: Request, data: POST__Compile_Run):
    all_code = parse_incoming_codegroup(data.all_code)
    compile_result = CPP_Compiler.write_compile_run(all_code=all_code, werrrors=False)

    return BasicResponse(message=compile_result.full_str())


class POST__Compile_Grade(POST_BODY):
    topicId:int
    tutorialId: int
    all_code: dict

@router.post('/grade_code', status_code=status.HTTP_200_OK)
@limiterobj.limit('10/minute')
def handle_compile_and_grade(request: Request, response: Response, data: POST__Compile_Grade):
    """Grades a user's code - 
        1. Checks console output if the user's code against provided model output
        2. Runs code against provided doctests to check 
    Returns 200 as default
    201 if user is provided and code is correct - user has the completed tutorial added to db
    
    """
    result = BasicResponse()
    
    try:
        all_code = parse_incoming_codegroup(data.all_code)
        
        console_check_output = Grader.check_console_output(topicId=data.topicId, tutorialId=data.tutorialId, code=all_code)
        if console_check_output is not True:
            result.message = console_check_output
            return result

        doctest_output = Grader.check_doctest(topicId=data.topicId, tutorialId=data.tutorialId, code=all_code)
        if doctest_output is not True: 
            result.message = doctest_output
        else:
            result.message = 'Correct!'
            if data.user_id:
                if not (user := UserData.find_by_id(data.user_id)):
                    response.status_code = status.HTTP_201_CREATED
                    return result
                
                add_tutorial_result = user.add_completed_tutorial(CompletedTutorial__OnlyId(topic_id=data.topicId, tutorial_id=data.tutorialId))
                if add_tutorial_result:
                    response.status_code = status.HTTP_201_CREATED
                else:
                    raise HTTPException(status_code=500, detail= "Could not save the user's completed tutorial to db")
                    
        return result
    
    except TutorialDataNotFound:
        log.exception("")
        result.message = 'Our tests have not been written for this tutorial yet! Check back again later 🥰'
        return result
        
    


# @router.post('/run_test')
# def cpp_code_handler(cpp_code: POST_BODY__CPP_CODE):
#     # CPPCompiler.check_code()
#     # lint using https://github.com/cpplint/cpplint
    
#     output = CPPCompiler.run_tests(cpp_code.code)
#     # TestResultHandler.handle_result(output)
    
#     # TODO probably should decode output
#     return {'result':output}

