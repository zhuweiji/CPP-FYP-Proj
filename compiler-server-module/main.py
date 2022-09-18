from pathlib import Path
from src.cpp_compiler import CPPCompiler, CompilationResult, CodeExecutionResult
from src.doctest_output_parser import DoctestOutputParser

import logging

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

CPP_SRC_DIR = Path(__file__).parents[1] / 'simple-cpp-module' / 'src'
TEST_SOURCES_DIR = CPP_SRC_DIR / 'tests_for_students'



# code = """
# class ComplexNumber{
#     int realValue;
#     int complexValue;
# };
# """
# result = CPPCompiler.run_tests(code=code,
#                                test_file=TEST_SOURCES_DIR / 'module_1' / 'test_complex_number__create.cpp',
#                                testcases='1')

# log.info(result)
# log.info('_'*50)
# DoctestOutputParser.parse(result)


# ================================
# test code injection

inject = "hello world!"

code = """TEST_CASE("1"){
    SUBCASE("Complex Number class should be defined")
    {
        ComplexNumber obj;
    }
}
"""
log.info(
    CPPCompiler.inject_code_into_testcase(injectable_code=inject,testcase_name='1', testfile_code=code)
)

# from fastapi import FastAPI
# from pydantic import BaseModel

# app = FastAPI()

# class CPPCode(BaseModel):
#     code: str

# @app.get('/')
# def root():
#     return {'message':'hello world!'}

# @app.post('/compile_and_run')
# def cpp_code_handler(CPPCode):
#     # CPPCompiler.check_code()
#     # lint using https://github.com/cpplint/cpplint
    
#     output = CPPCompiler.build_and_run(CPPCode.code)
#     # TestResultHandler.handle_result(output)
    
#     # TODO probably should decode output
#     return {'result':output}
    
    
    
