from pathlib import Path
import tempfile
import unittest
import subprocess
from compiler_server_service.cpp_compiler.cpp_compiler_revised import CPP_Compiler, ProcessWrapper
from tests.utilities import *

import logging
logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

class TestCompiler(unittest.TestCase): 
    temp_output_filepath =  CPP_TEST_FILES_DIR_PATH / 'test_to_be_removed.exe'
    temp_output_filename2 = 'test_to_be_removed2.exe'
    def step_compile_cpp_file(self):
        result = CPP_Compiler.compile_files(CPP_TEST_FILES_DIR_PATH / 'hello_world.cpp', out_filepath=self.temp_output_filepath)
        assert result, str(result.determine_failure_cause())
        
    def step_compile_cpp_file_with_custom_headers(self):
        result = CPP_Compiler.compile_files_with_custom_headers(CPP_TEST_FILES_DIR_PATH / 'hello_world.cpp', out_filepath=self.temp_output_filepath)
        assert result, str(result.determine_failure_cause())
    
    def step_run_cpp_exe(self):
        result = CPP_Compiler.run_cpp_executable(self.temp_output_filepath)
        assert result, result.full_str()
        if result.stdout:
            assert result.stdout.strip() == 'hello world!'
        else:
            self.fail('executable should have piped hello world! to stdout')
        
    def step_write_compile_run(self):
        # could split this into write_compile and run_tests
        with tempfile.TemporaryDirectory(dir=CPP_TEST_FILES_DIR_PATH) as tmp_dir_path:
            cpp_code = """#include <iostream>
            int main(){
                std::cout << "hello world!" << std::endl;
                return 0;
            }"""
            
            result = CPP_Compiler.write_and_compile(code=cpp_code, temp_dir_path=tmp_dir_path, executable_filepath=self.temp_output_filename2)
            assert result
            assert CPP_Compiler.run_cpp_executable(Path(tmp_dir_path)/self.temp_output_filename2)
            
    # def step_run_cpp_exe__after_write_compile(self):
    #     result = CPP_Compiler.run_cpp_executable(self.temp_output_filename2)
    #     assert result, result.full_str()
    #     if result.stdout:
    #         assert result.stdout.strip() == 'hello world!'
    #     else:
    #         self.fail('executable should have piped hello world! to stdout')
        
    def _get_tests(self):
        for name in dir(self): # dir() result is implicitly sorted
            if name.startswith("step"):
                yield name, getattr(self, name) 
                
    def test_all_steps(self):
        for test_number, (name, step) in enumerate(self._get_tests(), start=1):
            try:
                step()
            except Exception as e:
                self.fail(f"Test {test_number} failed: {e}")
    
                
class TestProcessWrapper(unittest.TestCase): 
    def test_shell_run(self):
        assert ProcessWrapper.shell_run("wsl", "-l", "-v")
        
    def test_shell_run__split_text(self):
        assert ProcessWrapper.shell_run__split_text("wsl -l -v")

