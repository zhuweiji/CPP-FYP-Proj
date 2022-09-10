from src.cpp_compiler import CPPCompiler, CompilationResult, CodeExecutionResult

import logging

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


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
    
    
fail_file = r"C:\Users\zhuwe\OneDrive\Desktop\VS_Code_Environment\fyp\simple-cpp-module\src\fail.cpp"
with open(fail_file, 'r') as f:
    code = f.read()
    result = CPPCompiler.build_and_run(code)
    log.info(result)
    