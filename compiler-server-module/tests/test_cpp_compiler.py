from pathlib import Path
from subprocess import Popen
import subprocess
import unittest
import logging
import tempfile

logging.basicConfig(format='%(process)d-%(levelname)s:  %(message)s', level=logging.INFO)
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
        assert CPPCompiler.run_executable(sample_cpp_exe).decode('utf-8').strip() == 'hello world!'
        

