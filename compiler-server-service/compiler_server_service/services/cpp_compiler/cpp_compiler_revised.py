import logging
import os
import platform
import subprocess
import tempfile
from dataclasses import dataclass, field
from msilib import type_binary
from pathlib import Path
from typing import Iterable, List, Union

from compiler_server_service.services.cpp_compiler.process_results import (
    CodeExecutionResult,
    CompilationResult,
)
from compiler_server_service.utilities import *

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


# should probably be renamed
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
          
            
@dataclass
class LogicalCodeFile:
    code: str
    filename: str = None
    code_bytes: bytes = field(init=False, repr=False, default=None)
    
    @property
    def code(self) -> str:
        return self.code_bytes.decode('utf-8')
    
    @code.setter
    def code(self, v: Union[str, bytes]):
        if isinstance(v, str):
            v = v.encode('utf-8')
        self.code_bytes = v

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
    def write_compile_run(cls, all_code:Union[str, LogicalCodeFile, list[LogicalCodeFile]], other_files:List[Union[str, Path]]=(), add_custom_headers:bool=False, werrrors=True):
        """takes some code, creates a temporary directory to store the compilation output in and tries to run it"""
        if isinstance(all_code,str): all_code = [LogicalCodeFile(code=all_code, filename=None)]
        elif isinstance(all_code, LogicalCodeFile): all_code = [all_code]
        elif isinstance(all_code, list): 
            if all(isinstance(a, LogicalCodeFile) for a in all_code): pass
            elif all(isinstance(a, str) for a in all_code): [LogicalCodeFile(code=i, filename=None) for i in all_code]
        
        else: raise ValueError(type(all_code))
        
        with tempfile.TemporaryDirectory(dir=USER_TEMP_FILES_DIR_PATH) as tmp_dir_path:
            result = cls.write_and_compile(code_files=all_code, other_files=other_files, temp_dir_path=tmp_dir_path, executable_filepath='output.exe', add_custom_headers=add_custom_headers, werrors=werrrors)
            if not result.success: return result
            return CPP_Compiler.run_cpp_executable(Path(tmp_dir_path)/"output.exe")
    
    @classmethod
    def write_and_compile(cls, code_files: Union[str, LogicalCodeFile, list[LogicalCodeFile]], temp_dir_path: str, other_files:List[Union[str, Path]]=(),
                          executable_filepath:Union[Path,str]='output.exe', add_custom_headers:bool=False, werrors=True):
        """Writes some C++ code into a temporary file, then compiles and runs it
        Can include other files to be compiled together with the C++ code as well"""
        
        if isinstance(code_files,str): code_files = [LogicalCodeFile(code=code_files, filename=None)]
        elif isinstance(code_files, LogicalCodeFile): code_files = [code_files]
        elif isinstance(code_files, list): 
            if all(isinstance(a, LogicalCodeFile) for a in code_files): pass
            elif all(isinstance(a, str) for a in code_files): [LogicalCodeFile(code=i, filename=None) for i in code_files]
        
        else: raise ValueError(type(code_files))
        
        if not isinstance(other_files, Iterable): other_files = (other_files)
        compile_function = cls.compile_files if not add_custom_headers else cls.compile_files_with_custom_headers
        
        temp_files = []
        
        for file in code_files:
            if file.filename:
                new_filepath = str(Path(temp_dir_path)/file.filename)
                with open(file=new_filepath, mode='w+') as f:
                    f.write(file.code)
                    temp_files.append(new_filepath)
            else:
                with tempfile.NamedTemporaryFile(suffix='.cpp', prefix=file.filename or '',  dir=temp_dir_path, delete=False) as temp_file:
                    temp_file.write(file.code_bytes)
                    temp_files.append(temp_file.name)
        
        executable_filepath = Path(temp_dir_path) / executable_filepath
        
        compile_result = compile_function(*temp_files, *other_files, out_filepath=executable_filepath, werrors=werrors) 
        
        return compile_result
    
    
    @classmethod
    def run_cpp_executable(cls, filepath:Union[str, Path], *args):
        """Runs some command or executable
        returns a CodeExecutionObject 
        This function is synchronous and blocking"""
        return CodeExecutionResult(ProcessWrapper.shell_run(filepath, *args))
    
    @classmethod
    def compile_files_with_custom_headers(cls, *files_to_be_compiled, out_filepath, werrors=True):
        return cls.compile_files(*files_to_be_compiled, '-I', CPP_HEADER_FILES_SOURCE_DIR, out_filepath=out_filepath, werrors=werrors)
         
    @classmethod
    def compile_files(cls, *files_to_be_compiled, out_filepath: Path, werrors=True):
        """Compiles one or more C++ files together into a single binary"""
        # g++ tests-main.o car.cpp  test.cpp -o test; ./test -r compact
        
        # convert any non-str objects (Path etc.) to str so they can be run
        if isinstance(files_to_be_compiled, tuple):
            files_to_be_compiled = [str(file) for file in files_to_be_compiled]
        else:
            files_to_be_compiled = str(files_to_be_compiled) 
            
        error_options = ['-Wall', '-Weffc++', '-Wextra' ,"-Wsign-conversion"] if werrors else []
        
        return CompilationResult(
            ProcessWrapper.shell_run('g++', *files_to_be_compiled, '-o', out_filepath, *error_options),
            compiled_directory=out_filepath.parent
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