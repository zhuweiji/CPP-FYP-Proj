import logging

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from pathlib import Path

from compiler_server_service.routers import cpp_handlers, tutorial_handlers
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

app = FastAPI()

app.state.limiter = limiterobj
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
app.include_router(cpp_handlers.router)
app.include_router(tutorial_handlers.router)


origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8080",
    "https://cpp-fyp-proj.vercel.app",
    "https://p01--compiler-server--m98yzdkgzrwc.code.run/",
    "https://p01--compiler-server--m98yzdkgzrwc.code.run/cpp/"

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


