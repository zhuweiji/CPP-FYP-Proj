import logging
import os
import platform
import subprocess
import tempfile
from pathlib import Path
from typing import Iterable, List, Union

from compiler_server_service.cpp_compiler.process_results import (
    CodeExecutionResult,
    CompilationResult,
)
from compiler_server_service.utilities import *

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


class ProcessWrapper:
    is_windows = platform.system() == 'Windows'
    process_timeout_seconds = int(os.getenv('PROCESS_RUN_TIMEOUT_SECONDS', 15))
    
    @classmethod
    def shell_run__split_text(cls, str_command:str):
        """Run a string as a command by splitting the string on whitespace
        e.g. shell_run__split_text('ls -la)"""
        commands = str_command.split(' ')
        command = commands[0]
        args = commands[1:]
        return cls.shell_run(command, *args)
    
    @classmethod
    def shell_run(cls, command, *args):
        """Create a process to run some command """
        
        # catch types of exceptions here and feed Enums to ProcessResult for their input
        return subprocess.run([f"{command}", *args], capture_output=True, timeout=cls.process_timeout_seconds)
    
    @classmethod
    def give_executable_permissions(cls, filepath: Path):
        """Only to be used in linux machines"""
        return cls.shell_run('chmod', '+x', filepath)
    
    @classmethod
    def check_gpp_available(cls):
        compile_result = CompilationResult(cls.shell_run('g++'))
        return 'fatal error: no input files' in compile_result.stderr
            



class CPP_Compiler:
    """ Class should implement the following
    1. ability to run a cpp file from cpp code in text  
        1 write code into a temporary file that is removed after use ✔️
            we do this by creating a temp dir that the temp file will reside in ✔️
        xx since we only need the execution output, we can assume that we will always compile and run a file 
        3 write to the temp file ✔️
        4 compile the temp file using a c++ compiler ✔️
        5 run the output ✔️
        6 get the results ✔️
        7 interpret the results 
            a. the following questions should be answerable
                did it compile?
                    if not, then what are the errors?
                did it run?
                    if not, then what are the errors?
                what is the output of the program
    
    2. be able to run pre-written unit tests on the code
                
    """
    @classmethod
    def write_compile_run(cls, code:str, other_files:List[Union[str, Path]]=(), add_custom_headers:bool=False):
        with tempfile.TemporaryDirectory(dir=USER_TEMP_FILES_DIR_PATH) as tmp_dir_path:
            result = cls.write_and_compile(code=code, other_files=other_files, temp_dir_path=tmp_dir_path, executable_filepath='output.exe', add_custom_headers=add_custom_headers)
            if not result.success: return result
            return CPP_Compiler.run_cpp_executable(Path(tmp_dir_path)/"output.exe")
    
    @classmethod
    def write_and_compile(cls, code: Union[str, bytes], temp_dir_path, other_files:List[Union[str, Path]]=(),
                          executable_filepath:Union[Path,str]='output.exe', add_custom_headers:bool=False):
        """Writes some C++ code into a temporary file, then compiles and runs it
        Can include other files to be compiled together with the C++ code as well"""
        
        if isinstance(code, str): code = code.encode('utf-8')
        if not isinstance(other_files, Iterable): other_files = (other_files)
        compile_function = cls.compile_files if not add_custom_headers else cls.compile_files_with_custom_headers
        
        with tempfile.NamedTemporaryFile(suffix='.cpp', dir=temp_dir_path, delete=False) as temp_file:
            temp_file.write(code)
        
        executable_filepath = Path(temp_dir_path) / executable_filepath
        
        compile_result = compile_function(temp_file.name, *other_files, out_filepath=executable_filepath) 
        
        return compile_result
    
    
    @classmethod
    def run_cpp_executable(cls, filepath:Union[str, Path], *args):
        """Runs some command or executable
        returns a CodeExecutionObject 
        This function is synchronous and blocking"""
        return CodeExecutionResult(ProcessWrapper.shell_run(filepath, *args))
    
    @classmethod
    def compile_files_with_custom_headers(cls, *files_to_be_compiled, out_filepath):
        return cls.compile_files(*files_to_be_compiled, '-I', CPP_HEADER_FILES_SOURCE_DIR, out_filepath=out_filepath)
         
    @classmethod
    def compile_files(cls, *files_to_be_compiled, out_filepath):
        """Compiles one or more C++ files together into a single binary"""
        # g++ tests-main.o car.cpp  test.cpp -o test; ./test -r compact
        
        # convert any non-str objects (Path etc.) to str so they can be run
        if isinstance(files_to_be_compiled, tuple):
            files_to_be_compiled = [str(file) for file in files_to_be_compiled]
        else:
            files_to_be_compiled = str(files_to_be_compiled) 
        
        
        return CompilationResult(
            ProcessWrapper.shell_run('g++', *files_to_be_compiled, '-o', out_filepath)
            )
        
    @classmethod
    def compile_code(cls, code, output_dir=None):
        raise NotImplementedError
        # the various output.exe's should be in a directory named by the user's id
        output_dir = output_dir or USER_TEMP_FILES_DIR_PATH / 'output.exe'
        command = ["echo", code, "|", "g++", "-xc++", "-", "-o", output_dir]
        
        return CompilationResult(ProcessWrapper.shell_run(*command))
    


#g++ cheatsheets
# https://www.cs.bu.edu/fac/gkollios/cs113/Usingg++.html
# https://bytes.usc.edu/cs104/wiki/gcc/