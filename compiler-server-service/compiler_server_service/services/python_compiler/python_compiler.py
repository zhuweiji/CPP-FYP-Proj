import logging
from pathlib import Path
from typing import List, Union

from compiler_server_service.services.cpp_compiler.cpp_compiler_revised import (
    LogicalCodeFile,
    ProcessWrapper,
)
from compiler_server_service.services.cpp_compiler.process_results import (
    CodeExecutionResult,
)

log = logging.getLogger(__name__)

class Python_Runner:
    """Functionality similar to CPP Compiler -- runs python code and returns the result"""
    
    @classmethod
    def run_code(cls, all_code:Union[str, LogicalCodeFile], other_files:List[Union[str, Path]]=(), *args):
        if isinstance(all_code,str): all_code = LogicalCodeFile(code=all_code, filename=None)
        elif isinstance(all_code, LogicalCodeFile): pass
        else: raise ValueError(type(all_code))
        
        return cls._run_with_python_interpreter(all_code, *args)
        
    @classmethod    
    def _run_with_python_interpreter(cls, code: LogicalCodeFile, *args):
        return CodeExecutionResult(
            ProcessWrapper.shell_run('python3', '-c', code.code)
            )
        