from contextlib import contextmanager
import re
import subprocess
from typing import Union
from compiler_server_service.cpp_compiler.process_results import CodeExecutionResult, CompilationResult
from compiler_server_service.utilities import *

from pathlib import Path
import tempfile
import logging

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)



class CPPCompiler:
    @classmethod
    def run_tests(cls, code: str, test_file:Path, testcases=None):
        '''	Compile some arbitrary C++ code and test it using a predefined test_file '''
        
        # store all intermediate files (compiled executables, etc.) used in the running of this program in a temporary directory
        with tempfile.TemporaryDirectory(dir=GUIDED_TUTORIALS_DIR_PATH) as tmp_dir_path:
            with tempfile.NamedTemporaryFile(suffix='.cpp', dir=tmp_dir_path, delete=False) as temp_file:
                
                # ammend all non-stdlib imports in the code (include "Truck.cpp") to import from parent
                # The executable created from the code will be in a temporary dir INSIDE the dir holding "Truck.cpp" 
                code = cls.ammend_imports_with_directory(code, dirpath=r'..')
                temp_file.write(bytes(code, encoding='utf-8'))
                
            log.debug(f"Created new temp code file: {temp_file.name}")
            output_binary = temp_file.name.replace('.cpp', '.exe')

            try:
                code_filepath = Path(temp_file.name)
                code_filedir, code_filename = code_filepath.parent.name, code_filepath.name

                # the predefined test files are meant to test the code but do not know the code file's name when they were created
                # add the code file as an import and prepare the file to be compiled
                test_file_code: str = cls.add_import_userfile(
                    file_path=test_file, import_filepath=code_filename)
                
                with tempfile.NamedTemporaryFile(prefix="testfile_", suffix='.cpp', dir=tmp_dir_path, delete=False) as temp_test_file:
                    temp_test_file.write(bytes(test_file_code, encoding='utf-8'))

                    
                result = cls.compile_files(temp_file.name, temp_test_file.name, out_filepath=output_binary)

                if not result.success: return result
                if not Path(output_binary).is_file(): raise FileNotFoundError("Compiled executable was not created")
                
                log.debug(f'compile complete, file created: {output_binary}')
                
                return cls.run_a_doctest(output_binary, 
                                         testcases=testcases
                                         )
            except Exception as E:
                log.error(E)
                return False
            

    @classmethod 
    def compile_and_run_from_code(cls, code:Union[str,bytes]):
        if isinstance(code, str): code = code.encode('utf-8')
        log.warning(GUIDED_TUTORIALS_DIR_PATH.exists())
        with tempfile.TemporaryDirectory(dir=GUIDED_TUTORIALS_DIR_PATH) as tmp_dir_path:
            with tempfile.NamedTemporaryFile(suffix='.cpp', dir=tmp_dir_path, delete=False) as temp_file:
                temp_file.write(code)
            
            log.info('written')
            
            executable_filepath = Path(tmp_dir_path)/'output'
            temp_file_path = Path(temp_file.name)
            log.info(temp_file_path.exists())
            log.warning(temp_file.name)
            
            log.info(executable_filepath)
            
            compile_result = cls.compile_files(temp_file_path, out_filepath=executable_filepath)
            log.info(temp_file_path.exists())
            if not compile_result.success: 
                return compile_result
            
            return cls.run_executable(executable=executable_filepath)

    @classmethod
    def compile_files(cls, *files_to_be_compiled, out_filepath):
        """Compiles one or more C++ files together into a single binary"""
        # g++ tests-main.o car.cpp  test.cpp -o test; ./test -r compact
        
        # if isinstance(out_filepath, tempfile.TemporaryDirectory):
            # out_filepath = Path(out_filepath.name)
            
        # convert any non-str objects (Path etc.) to str so they can be run
        if isinstance(files_to_be_compiled, tuple):
            files_to_be_compiled = [str(file) for file in files_to_be_compiled]
        else:
            files_to_be_compiled = str(files_to_be_compiled) 
        
        
        return CompilationResult(
            cls.shell_run('g++', *files_to_be_compiled, '-o', out_filepath)
            )
        
    @classmethod
    def run_a_doctest(cls, executable, *args, testcases=None):
        if testcases: 
            testcases = [testcases] if isinstance(testcases, (int, str)) or len(testcases) == 1 else testcases
            args = (*args, f"-test-case={','.join(map(str,testcases))}")
        
        return cls.run_executable(executable, '--no-intro', 'true', '--no-exitcode', 'true', *args)
    
    @classmethod
    def ammend_imports_with_directory(cls, code, dirpath) -> str:
        """prefix all non-stdlib imports with some directory"""
        
        USER_DEFINED_IMPORTS_REGEX = r'(#include\s+)"(.+[.cpp|.h|.hpp])"'
        STDLIB_IMPORT_REGEX = r"#include\s+<.+>"
        
        result = ""
        for line in code.split('\n'):
            if re.findall(STDLIB_IMPORT_REGEX, line, flags=re.IGNORECASE):
                pass
            elif re.findall(USER_DEFINED_IMPORTS_REGEX, line):
                line = re.sub(USER_DEFINED_IMPORTS_REGEX, rf'\1"{dirpath}/\2"', line)
            result += '\n' + line
        return result
    
    @classmethod
    def add_import_userfile(cls, file_path: Union[str, Path], import_filepath: Union[str, Path]) -> str:
        """Add an (#include "file.h") into a file containing C++ code
        The include is added below other (#include) lines"""
        with open(file_path, 'r') as f: test_code = f.readlines()
            
        # insert the (#include) of the codefile into the end of the chunk of other includes
        index = 0
        for index, line in enumerate(test_code): 
            if '#' not in line: break
        index = max(0, index)
        test_code.insert(index, rf'#include "{import_filepath}"' + '\n')

        return "".join(test_code)
    
    @classmethod
    def inject_code_into_testcase(cls, injectable_code:str, testcase_name: str, testfile_code:str):
        TESTCASE_REGEX = rf'TEST_CASE\("{testcase_name}"\)'
        lines = testfile_code.splitlines()
        
        index, found = 0, False
        for index, line in enumerate(lines):
            if re.findall(TESTCASE_REGEX, line): 
                found = True
                break
                
        if found:
            lines.insert(index+1, injectable_code+'\n')
            return "\n".join(lines)
        else:
            return False
        
    
    @classmethod
    def run_executable(cls, executable:Union[str, Path], *args):
        """Runs some command with optional args, and provides a CodeExecutionObject as result
        This function is synchronous and blocking"""
        return CodeExecutionResult(cls.shell_run(executable, *args))
    
    @classmethod
    def give_executable_permissions(cls, filepath: Path):
        """Only to be used in linux machines"""
        return cls.shell_run('chmod', '+x', filepath)
    
    @classmethod
    def shell_run(cls, command, *args):
        """Create a process to run some command"""
        log.info(f"wsl.exe {command} {args}")
        return subprocess.run([f"{command}", *args], capture_output=True)
                

    @classmethod
    @contextmanager
    def create_temp_dir(cls):
        temp_dir = tempfile.TemporaryDirectory(dir=GUIDED_TUTORIALS_DIR_PATH) 
        yield temp_dir
        temp_dir.cleanup()
        
    @classmethod
    def create_temp_cpp_file(cls, tmp_dir):
        """Creates a tempfile with .cpp extension in a temporary directory"""
        if not isinstance(tmp_dir, tempfile.TemporaryDirectory):
            raise ValueError
        
        tmp_dir_path = Path(tmp_dir.name)
        return tempfile.NamedTemporaryFile(suffix='.cpp', dir=tmp_dir_path, delete=False)


# class TempDirectoryWrapper:
    # maybe can create some kind of wrapper for tempfile.TemporaryDirectory output of create_temp_dir
    # result is object of type tempfile.TemporaryDirectory
    # we keep it as this object because we want to check if a var is a tempdir
    # but we want to be able to treat this object as a path 