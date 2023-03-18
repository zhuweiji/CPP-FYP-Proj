from __future__ import annotations

import logging
from enum import Enum
from subprocess import CompletedProcess, Popen
from typing import Any, Union

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


class CompilationErrorTypes(Enum):
    """List of compilation errors resulting from G++ compilation of C++ code"""
    UNKNOWN      = 0
    NO_WINMAIN   = -1
    FILE_NOT_FOUND_ERROR = 1
    NOT_DEFINED  = 2
    NO_SEMICOLON = 3


class ProcessResult:
    """Captures the result of a process that was run and provides a check if the intended operation was successful or not
    Acts as a thin wrapper around subprocess.CompletedProcess
    """
    def __init__(self, process_handle: CompletedProcess):
        self.p = process_handle
        
        self.stderr, self.stdout = None, None
        self.capture_stdout(self.p)
        self.capture_stderr(self.p)
    
    
    def capture_stdout(self, process_handle):
        self.stdout = self.attempt_decode(process_handle.stdout)
    
    def capture_stderr(self, process_handle): 
        self.stderr = self.attempt_decode(process_handle.stderr)
        
    @property
    def success(self):
        return not self.stderr and self.p.returncode in [0,1]
    
    def __str__(self) -> str:
        additional_info = f"Success!" if self.success else f"Failure!"
        stdout_val = self.stdout if self.stdout else ""
        stderr_val = self.stderr if self.stderr else ""
        return f"{self.__class__.__name__}:{additional_info}\nout > {stdout_val[:300]}\nerr > {stderr_val[:300]}"
    
    def __repr__(self) -> str:
        return self.__str__()
    
    def full_str(self) -> str:
        additional_info = f"Success!" if self.success else f"Failure!"
        return f"{self.__class__.__name__}:{additional_info}\nout > {self.stdout}\nerr > {self.stderr}"
    
    @staticmethod
    def attempt_decode(value) -> Union[str, bytes, None]:   
        """Convert byte values to to string"""
        try: return value.decode()
        except Exception: log.exception(f"tried to decode value but failed"); return value
        
    # @staticmethod
    # def custom_create():
        



class CompilationResult(ProcessResult):
    """Result of the compilation of some C++ code, identifying common error types for a compilation failure"""
    def __init__(self, process_handle: CompletedProcess, compiled_directory:str='') -> None:
        super().__init__(process_handle)
        self.compiled_directory = compiled_directory
        
    def determine_failure_cause(self):
        error_reason_dict = {
            CompilationErrorTypes.FILE_NOT_FOUND_ERROR: self.failed_because_file_not_found_error,
            CompilationErrorTypes.NOT_DEFINED : self.failed_because_not_defined,
            CompilationErrorTypes.NO_WINMAIN  : self.failed_because_no_winmain,
            CompilationErrorTypes.NO_SEMICOLON: self.failed_because_no_semicolon,
        }
        
        if self.success: return None
        
        for error_reason, checking_func in error_reason_dict.items():
            if checking_func(): return error_reason
        return CompilationErrorTypes.UNKNOWN
    
    def failed_because_no_semicolon(self):
        stderr_val = self.stderr if self.stderr else ""
        if isinstance(stderr_val, bytes): stderr_val = stderr_val.decode()
        return "expected ';' before" in stderr_val.lower()
    
    def failed_because_file_not_found_error(self):
        stderr_val = self.stderr if self.stderr else ""
        if isinstance(stderr_val, bytes): stderr_val = stderr_val.decode()
        return 'no such file or directory' in stderr_val.lower()
    
    def failed_because_not_defined(self):
        stderr_val = self.stderr if self.stderr else ""
        if isinstance(stderr_val, bytes): stderr_val = stderr_val.decode()
        return 'not declared in this scope' in stderr_val.lower()
    
    def failed_because_no_winmain(self):
        stderr_val = self.stderr if self.stderr else ""
        if isinstance(stderr_val, bytes): stderr_val = stderr_val.decode()
        return "undefined reference to `WinMain'".lower() in stderr_val.lower()
        
    def __str__(self) -> str:
        failure_reason = self.determine_failure_cause()
        output = str(super())
        
        # strip filepaths from the compiler output for conciseness
        output = output.replace(str(self.compiled_directory) + '\\', '')
        
        if not self.success: output = f"{failure_reason}\n\n{output}"
        return output
    
    def full_str(self) -> str:
        failure_reason = self.determine_failure_cause()
        output = super().full_str()
        
        # strip filepaths from the compiler output for conciseness
        output = output.replace(str(self.compiled_directory) + '\\', '')
        
        if not self.success: output = f"{failure_reason}\n\n{output}"
        return output
    
    def __bool__(self) -> bool:
        return self.success
    # could override success property of parent to include more compile specific checking of error (some errors logged to stdout might not be true errors)        


class CodeExecutionResult(ProcessResult):
    """Result of the execution of some compiled C++ code"""
    def __init__(self, process_handle: CompletedProcess) -> None:
        super().__init__(process_handle)
        



    

    
