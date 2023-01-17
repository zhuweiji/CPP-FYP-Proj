# from pathlib import Path
# from subprocess import Popen
# import subprocess
# import unittest
# import logging
# import tempfile

# logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
# log = logging.getLogger(__name__)

# from compiler_server_service.cpp_compiler_module.cpp_compiler import CPPCompiler

# class TestCPPCompiler(unittest.TestCase):
#     CPP_SRC_DIR = Path(__file__).parents[2] / 'simple-cpp-module' / 'src'
#     TEST_SOURCES_DIR = CPP_SRC_DIR / 'py_unittest_src'
        
#     def test_gpp_installed(self):
#         with subprocess.Popen("g++ --version", stdout=subprocess.PIPE) as p:
#             assert any('This is free software; see the source for copying conditions.' in str(i) for i in p.stdout.readlines()), "Please install g++"
            
#     def test_compile(self):
#         with tempfile.TemporaryDirectory() as tmpdirname:
#             sample_cpp_file = self.TEST_SOURCES_DIR / 'sample_cpp_file.cpp'
#             output_filepath = Path(tmpdirname)/ 'exe_gen_from_test.exe'
            
#             result = CPPCompiler.compile_files(sample_cpp_file, out_filepath=output_filepath)
#             assert result.success
#             assert Path(output_filepath).is_file()
        
#     def test_run_exe(self):
#         sample_cpp_exe = self.TEST_SOURCES_DIR / 'sample_cpp_bin.exe'
#         result = CPPCompiler.run_executable(sample_cpp_exe)
#         assert result.success
#         assert result.stdout.strip() == 'hello world!'
        
#     def test_ammend_import(self):
#         code = '#ifndef foo_h__\n#define foo_h__\n#include <stdio.h>\n#include "car.cpp"'
#         assert code.replace("car.cpp", "mydir/car.cpp").strip() == CPPCompiler.ammend_imports_with_directory(code, "mydir").strip()
        
#     def test_add_import_of_file_to_testfile(self):
#         code = CPPCompiler.add_import_userfile(self.TEST_SOURCES_DIR/'testcases_for_truck.cpp',
#                                                    import_filepath='aoisdn')
#         log.info(code)
#         assert '#include "aoisdn"' in code

#     def test_build_and_run(self):
#         result = CPPCompiler.run_tests(
#             """
#             #include <iostream>

#             int main(){
#                 std::cout << "hello world" << std::endl;
#                 return 1;
#             }
#             """
#         )
        
#         assert result.success
#         assert result.stdout.strip() == 'hello world'
        
#     def test_build_and_run__wtestfile(self):
#         result = CPPCompiler.run_tests(
#             """
#             #include <iostream>

#             class Truck{
#             public:
#                 int acceleration = 0;
#                 Truck(int initial_acceleration){
#                     acceleration = initial_acceleration;
#                 };

#                 void accelerate(){
#                     acceleration ++;
#                 };
#             };
#             """
#         , test_file=self.TEST_SOURCES_DIR/'testcases_for_truck.cpp')
        
#         log.info(result)
#         print(result)
#         assert result.success
