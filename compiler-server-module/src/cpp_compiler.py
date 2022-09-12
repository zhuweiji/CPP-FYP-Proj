from enum import Enum
import re
import subprocess
from src.utilities import *

from subprocess import CompletedProcess, Popen
from pathlib import Path
import tempfile
import logging

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


MODULE_ROOT = Path(__file__).parents[1] 
PROJECT_ROOT = MODULE_ROOT.parent

class CPPCompiler:
    CPP_MODULE_DIR = PROJECT_ROOT/'simple-cpp-module'
    CPP_SRC_FILEDIR = CPP_MODULE_DIR / 'src'
    CPP_TESTS_FOR_STUDENT_CODE = CPP_SRC_FILEDIR / 'tests_for_students'
    
    @classmethod
    def build_and_run(cls, code: str, test_file:Path=None, import_dir=None):
        log.debug(f'calling cpp code {code}')
        
        # improve the docs when possible
        
        if not import_dir: import_dir = r'..'
        
        with tempfile.TemporaryDirectory(dir=cls.CPP_SRC_FILEDIR) as tmp_dir_path:
            with tempfile.NamedTemporaryFile(suffix='.cpp', dir=tmp_dir_path, delete=False) as temp_file:
                
                # change (#include) to search in the parent directory, since we are running these files in a sub,temp directory
                # useful when the student's code has to import classes
                code = cls.ammend_imports_with_directory(code, dirname=import_dir)
                temp_file.write(bytes(code, encoding='utf-8'))
                
            log.debug(f"Created new temp code file: {temp_file.name}")
            exename = temp_file.name.replace('.cpp', '.exe')

            try:
                # g++ tests-main.o car.cpp  test.cpp -o test; ./test -r compact
                files_to_compile = [temp_file.name]
                
                if test_file:
                    code_filepath = Path(temp_file.name)
                    code_filedir, code_filename = code_filepath.parent.name, code_filepath.name
                    # code_import_str = f"{code_filedir}/{code_filename}"
                    code_import_str = code_filename

                    
                    test_file_code = cls.add_import_of_file_to_testfile(
                        testfile_path=test_file, codefile_dirname=code_import_str)
                    
                    with tempfile.NamedTemporaryFile(prefix="testfile_", suffix='.cpp', dir=tmp_dir_path, delete=False) as temp_test_file:
                        temp_test_file.write(bytes(test_file_code, encoding='utf-8'))

                    files_to_compile = [*files_to_compile, 
                                        cls.CPP_SRC_FILEDIR/'tests-main.o',
                                        temp_test_file.name,
                                        ]
                    
                log.info(files_to_compile)
                result = cls.compile_file(*files_to_compile, outpath=exename)
                # result = cls.compile_file(*files_to_compile, outpath=r" G:\projects\CPP-FYP-Proj\testfile.exe")

                if not result.success: return result
                if not Path(exename).is_file(): raise FileNotFoundError("Compiled executable was not created")
                
                log.info('compile complete')
                
                run_command = exename if not test_file else rf"{exename} -o G:\projects\CPP-FYP-Proj\results"
                return cls.run_wsl_executable(run_command)
            except Exception as E:
                log.error(E)
                
                
    @classmethod
    def compile_file(cls, *files, outpath):
        files = [str(file) for file in files]
        result = subprocess.run(f"g++ {' '.join(files)} -o {outpath}", capture_output=True)
        return CompilationResult(result)
        
    @classmethod
    def run_wsl_executable(cls, command:str):
        if not command.startswith(r'~/cpp_fyp'): command = r"~/cpp_fyp/" + command
        # log.info(command)
        # subprocess.run(["wsl","chmod", "+x" ,f"{command}"])
        log.info(
        subprocess.run(["wsl", f"{command}", '--out=result'], capture_output=True)
        )
        # return CodeExecutionResult(result)
        
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
    
    @classmethod
    def add_import_of_file_to_testfile(cls, testfile_path, codefile_dirname):
        with open(testfile_path, 'r') as f: test_code = f.readlines()
            
        # insert the (#include) of the codefile into the end of the imports
        for index, line in enumerate(test_code): 
            if '#' not in line: break
        index = max(0, index)
        test_code.insert(index, rf'#include "{codefile_dirname}"' + '\n')

        return "".join(test_code)
            
                
class ProcessResult:
    def __init__(self, process_handle: CompletedProcess) -> None:
        self.p = process_handle
        self.stderr, self.stdout = None, None
        self.capture_stdout(self.p)
        self.capture_stderr(self.p)
        return self
    
    
    def capture_stdout(self, process_handle):
        self.stdout = self.attempt_decode(process_handle.stdout)
    
    def capture_stderr(self, process_handle): 
        self.stderr = self.attempt_decode(process_handle.stderr)
        
    @property
    def success(self):
        return not self.stderr
    
    def __str__(self) -> str:
        additional_info = f"Success!" if self.success else f"Failure!"
        return f"{self.__class__.__name__}:{additional_info}\nout > {self.stdout[:300]}\nerr > {self.stderr[:300]}"
    
    @staticmethod
    def attempt_decode(value): 
        try: return value.decode()
        except Exception as E: log.info(f"tried to decode value but failed: {E}"); return value
        

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
    

    
