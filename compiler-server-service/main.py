from pathlib import Path
from src.routers import cpp_handlers

import logging

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


from fastapi import FastAPI



app = FastAPI()

app.include_router(cpp_handlers.router)






    
    


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

# inject = "hello world!"

# code = """TEST_CASE("1"){
#     SUBCASE("Complex Number class should be defined")
#     {
#         ComplexNumber obj;
#     }
# }
# """
# log.info(
#     CPPCompiler.inject_code_into_testcase(injectable_code=inject,testcase_name='1', testfile_code=code)
# )


