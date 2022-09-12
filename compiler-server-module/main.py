from pathlib import Path
from src.cpp_compiler import CPPCompiler, CompilationResult, CodeExecutionResult

import logging

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

CPP_SRC_DIR = Path(__file__).parents[1] / 'simple-cpp-module' / 'src'
TEST_SOURCES_DIR = CPP_SRC_DIR / 'py_unittest_src'



# result = CPPCompiler.build_and_run(
#     """
#             #include <iostream>

#             class Truck{
#             public:
#                 int acceleration = 0;
#                 Truck(int initial_acceleration){
#                     acceleration = initial_acceleration;
#                 };

#                 void accelerate(){
#                     acceleration ++;
#                 };
#             };
#             """, test_file= TEST_SOURCES_DIR/'testcases_for_truck.cpp')

# log.info(result)

import subprocess

helloworld_file = r"G:\projects\CPP-FYP-Proj\simple-cpp-module\src\py_unittest_src\hello_world.cpp"
helloworld_exe = helloworld_file.replace('.cpp', '.exe')

testfile = r"G:\projects\CPP-FYP-Proj\simple-cpp-module\src\py_unittest_src\testcases_for_truck.cpp"
testcode = r"G:\projects\CPP-FYP-Proj\simple-cpp-module\src\py_unittest_src\truck_for_test.cpp"
# test_exe = testfile.replace('testcases_for_truck.cpp', 'testcases_for_truck.exe')
test_exe = r'\\wsl$\Ubuntu\home\weiji\cpp_fyp\test.exe'
# testoutput = testfile.replace('testcases_for_truck.cpp', 'testresult')


# print(CPPCompiler.compile_file(helloworld_file, outpath=helloworld_exe))
# print(CPPCompiler.run_executable(helloworld_exe))
# print()
# print(CPPCompiler.compile_file(testfile,testcode, outpath=test_exe))
# print(CPPCompiler.run_wsl_executable(test_exe))

# log.info(
#     subprocess.run(["wsl", "chmod", "+x", "~/cpp_fyp/test.exe"], capture_output=True)
# )

log.info(
    subprocess.run(["powershell.exe", r"\\wsl$\Ubuntu\home\weiji\cpp_fyp\test.exe"], capture_output=True)
)
# print(
#     CPPCompiler.run_wsl("ls")
# )

# log.info(original_exe + f" -o {original_exe_output}")
# print(CPPCompiler.run_executable(original_exe + f" -o {original_exe_output}"))



# print(
    # CPPCompiler.run_executable(command)
# )


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
    
    
    
