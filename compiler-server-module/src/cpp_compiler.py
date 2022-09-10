from enum import Enum
import re
import subprocess
from src.utilities import *

from subprocess import Popen
from pathlib import Path
import tempfile
import logging

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


MODULE_ROOT = Path(__file__).parents[1] 
PROJECT_ROOT = MODULE_ROOT.parent

class CPPCompiler:
    CPP_MODULE_DIR = PROJECT_ROOT/'simple-cpp-module'
    
    @classmethod
    def build_and_run(cls, code: str):
        log.debug(f'calling cpp code {code}')
        
        # improve the docs when possible
        #
        with tempfile.TemporaryDirectory(dir=cls.CPP_MODULE_DIR/'src') as tmp_dir_path:
            with tempfile.NamedTemporaryFile(suffix='.cpp', dir=tmp_dir_path, delete=False) as tmp:
                code = cls.ammend_imports_with_directory(code, dirname=r'../')
                tmp.write(bytes(code, encoding='utf-8'))
                
                log.debug(f"Creating new temp code file: {tmp.name}")
                exename = tmp.name.replace('.cpp', '.exe')

            try:
                # TODO: change the file compile to include the tests-main file and the relevant test file
                # g++ tests-main.o car.cpp  test.cpp -o test; ./test -r compact
                # to refactor, can extract code preprocessing (ammend imports), compiling and running,
                # as long as the tempdir and tempfile can still exist even if the parent function of a context manager is returned from
                result = cls.compile_file(tmp.name, exename)
                if not result.success: return result
                if not Path(exename).is_file(): raise FileNotFoundError("Compiled executable was not created")
                
                return cls.run_executable(exename)
            except Exception as E:
                log.error(E)
                
                
    @classmethod
    def compile_file(cls, filepath, outpath):
        with Popen(f'g++ {filepath} -o {outpath}', shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE) as p:
            return CompilationResult(p)
        
    @classmethod
    def run_executable(cls, filepath):
        with Popen(f"{filepath}", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE) as p:
            return CodeExecutionResult(p)
        
    @classmethod
    def ammend_imports_with_directory(cls, code, dirname):
        USER_IMPORT_REGEX = r'(#include\s+)"(.+[.cpp|.h|.hpp])"'
        STDLIB_IMPORT_REGEX = r"#include\s+<.+>"
        
        result = ""
        for line in code.split('\n'):
            if re.findall(STDLIB_IMPORT_REGEX, line, flags=re.IGNORECASE):
                pass
            elif re.findall(USER_IMPORT_REGEX, line):
                line = re.sub(USER_IMPORT_REGEX, rf'\1"{dirname}/\2"', line)
            result += '\n' + line
        return result
            
                
class ProcessResult:
    def __init__(self, process_handle: Popen) -> None:
        self.p = process_handle
        self.stderr, self.stdout = None, None
        self.capture_stdout(self.p)
        self.capture_stderr(self.p)
        return self
    
    
    def capture_stdout(self, process_handle):
        self.stdout = self.attempt_decode(process_handle.stdout.read())
    
    def capture_stderr(self, process_handle): 
        self.stderr = self.attempt_decode(process_handle.stderr.read())
        
    @property
    def success(self):
        return not self.stderr
    
    def __str__(self) -> str:
        additional_info = f"Success!" if self.success else f"Failure!"
        return f"{self.__class__.__name__}:{additional_info}\nout > {self.stdout[:300]}\nerr > {self.stderr[:300]}"
    
    @staticmethod
    def attempt_decode(value): 
        try: return value.decode()
        except Exception as E: log.info(f"tried to decode value but failed,\n{E}"); return value
        

class CompilationErrorTypes(Enum):
    UNKNOWN      = 0
    NO_WINMAIN   = -1
    IMPORT_ERROR = 1
    NOT_DEFINED  = 2


class CompilationResult(ProcessResult):
    def __init__(self, process_handle: Popen) -> None:
        super().__init__(process_handle)
        
    def determine_failure_cause(self):
        error_reason_dict = {
            CompilationErrorTypes.IMPORT_ERROR: self.failed_because_import_error,
            CompilationErrorTypes.NOT_DEFINED : self.failed_because_not_defined,
            CompilationErrorTypes.NO_WINMAIN  : self.failed_because_no_winmain,
        }
        
        if self.success: return None
        
        for error_reason, checking_func in error_reason_dict.items():
            if checking_func(): return error_reason
        return CompilationErrorTypes.UNKNOWN
    
    def failed_because_import_error(self):
        return 'no such file or directory' in self.stderr.lower()
    
    def failed_because_not_defined(self):
        return 'not declared in this scope' in self.stderr.lower()
    
    def failed_because_no_winmain(self):
        return "undefined reference to `WinMain'".lower() in self.stderr.lower()
        
    def __str__(self) -> str:
        failure_reason = self.determine_failure_cause()
        error_msg = super().__str__()
        if not self.success: error_msg = f"{failure_reason}  {error_msg}"
        return error_msg
    # could override success property of parent to include more compile specific checking of error (some errors logged to stdout might not be true errors)        

class CodeExecutionResult(ProcessResult):
    def __init__(self, process_handle: Popen) -> None:
        super().__init__(process_handle)
    

    