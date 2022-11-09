from pathlib import Path
from compiler_server_service.routers import cpp_handlers


import logging

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

app.include_router(cpp_handlers.router)

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
def root():
    return {'message': "we're up!"}




    
    


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


