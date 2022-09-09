from concurrent.futures import process
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
        
        with tempfile.TemporaryDirectory(dir=cls.CPP_MODULE_DIR/'src') as tmpdirname:
            with tempfile.NamedTemporaryFile(suffix='.cpp', dir=tmpdirname, delete=False) as tmp:
                cls.ammend_imports_with_directory(code, dirname=tmpdirname)
                tmp.write(bytes(code, encoding='utf-8'))
                log.info(f"creating new file: {tmp.name}")
                exename = tmp.name.replace('.cpp', '.exe')
        
            try:
                result = cls.compile_file(tmp.name, exename)
                if not result.success: return result
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
        raise NotImplementedError
        
        # import_regex = r'#import "(.*)"'
        
        # log.info(repr(code))
        # result = ""
        # for line in code.split('\n'):
        #     log.info(line)
        #     match = re.search(import_regex, line, flags=re.IGNORECASE)
        #     if match:
        #         log.info(match.group(1))
        #         re.sub(match.group(1), f"{dirname}\{match.group(1)}")
                
        
            
        
    
    
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
        is_success_message = "Success" if self.success else "Failure"
        return f"{self.__class__.__name__}: {is_success_message}"
    
    @staticmethod
    def attempt_decode(value): 
        try: return value.decode()
        except Exception as E: log.info(f"tried to decode value but failed,\n{E}"); return value
        

class CompilationErrorTypes(Enum):
    UNKNOWN      = 0
    IMPORT_ERROR = 1
    NOT_DEFINED = 2


class CompilationResult(ProcessResult):
    def __init__(self, process_handle: Popen) -> None:
        super().__init__(process_handle)
        
    def determine_failure_cause(self):
        error_reason_dict = {
            CompilationErrorTypes.IMPORT_ERROR: self.failed_because_import_error,
            CompilationErrorTypes.NOT_DEFINED : self.failed_because_not_defined,
        }
        
        if not self.stderr: return False
        
        for error_reason, checking_func in error_reason_dict.items():
            if checking_func(): return error_reason
        return CompilationErrorTypes.UNKNOWN
    
    def failed_because_import_error(self):
        return 'no such file or directory' in self.stderr.lower()
    
    def failed_because_not_defined(self):
        return 'not declared in this scope' in self.stderr.lower()
        
        
        
    # could override success property of parent to include more compile specific checking of error (some errors logged to stdout might not be true errors)        

class CodeExecutionResult(ProcessResult):
    def __init__(self, process_handle: Popen) -> None:
        super().__init__(process_handle)
    

    