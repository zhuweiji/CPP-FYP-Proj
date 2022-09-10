from pathlib import Path
from subprocess import Popen
import subprocess
import unittest
import logging
import tempfile

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from src.cpp_compiler import CPPCompiler

class TestCPPCompiler(unittest.TestCase):
    def test_gpp_installed(self):
        with subprocess.Popen("g++ --version", stdout=subprocess.PIPE) as p:
            assert any('This is free software; see the source for copying conditions.' in str(i) for i in p.stdout.readlines()), "Please install g++"
            
    def test_compile(self):
        with tempfile.TemporaryDirectory() as tmpdirname:
            sample_cpp_file = Path(__file__).parent / 'sample_cpp_file.cpp'
            output_filepath = Path(tmpdirname)/'exe_gen_from_test.exe'
            
            CPPCompiler.compile_file(sample_cpp_file, output_filepath)
            assert Path(output_filepath).is_file()
        
    def test_run_exe(self):
        sample_cpp_exe = Path(__file__).parent / 'sample_cpp_bin.exe'
        result = CPPCompiler.run_executable(sample_cpp_exe)
        assert result
        assert result.stdout.strip() == 'hello world!'
        
    def test_ammend_import(self):
        code = '#ifndef foo_h__\n#define foo_h__\n#include <stdio.h>\n#include "car.cpp"'
        assert code.replace("car.cpp", "mydir/car.cpp").strip() == CPPCompiler.ammend_imports_with_directory(code, "mydir").strip()

    def test_build_and_run(self):
        result = CPPCompiler.build_and_run(
            """
            #include <iostream>

            int main(){
                std::cout << "hello world" << std::endl;
                return 1;
            }
            """
        )
        
        assert result.success
        assert result.stdout.strip() == 'hello world'