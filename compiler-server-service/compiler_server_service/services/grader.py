"""
evaluate doctests
check console output
"""

import logging
import os
from typing import Literal, Union

from compiler_server_service.services.cpp_compiler.cpp_compiler_revised import (
    CPP_Compiler,
    LogicalCodeFile,
)
from compiler_server_service.services.cpp_compiler.doctest_output_parser import (
    DoctestOutputParser,
    DoctestOverallResult,
)
from compiler_server_service.services.cpp_compiler.process_results import ProcessResult
from compiler_server_service.services.tutorial_dao import (
    TutorialDAO,
    TutorialDataNotFound,
)
from compiler_server_service.utilities import GUIDED_TUTORIALS_DIR_PATH

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


class Grader:
    def check_console_output(topicId:int, tutorialId:int, code:list[LogicalCodeFile]) -> Union[Literal[True], str]:
        if not (tutorial_data := TutorialDAO.find_tutorial(topicId=topicId, tutorialId=tutorialId)): raise TutorialDataNotFound
        if not (expected_output := tutorial_data.expectedConsoleOutput): return True # if no console output is explicitly written in the data, then the code is always right
        
        prewritten_files = TutorialDAO.get_prewritten_cpp_files(topicId=topicId, tutorialId=tutorialId)
        compile_result = CPP_Compiler.write_compile_run(all_code=code, add_custom_headers=False, other_files=prewritten_files)
        
        return True if compile_result.stdout.strip() == expected_output.strip() else f'Your console output: <{compile_result.stdout.strip()}> does not match <{expected_output.strip()}>'
        
    
    def check_doctest(topicId:int, tutorialId:int, code: list[LogicalCodeFile]) -> Union[Literal[True], str]:
        # should find all file related to this tutorial in compiler-server-service\cpp_source_files\guided_tutorials\ and compile with the code
        prewritten_tests = TutorialDAO.get_prewritten_test_files(topicId=topicId, tutorialId=tutorialId)
        if not prewritten_tests: return True
        
        prewritten_files = TutorialDAO.get_prewritten_cpp_files(topicId=topicId, tutorialId=tutorialId)
        
        process_result = CPP_Compiler.write_compile_run(code_files=code, add_custom_headers=True, other_files=[*prewritten_files, *prewritten_tests])
        doctest_result = DoctestOutputParser.parse(process_result)
        
        if isinstance(doctest_result, DoctestOverallResult) and doctest_result.all_passed: return True
        else: 
            if isinstance(doctest_result, DoctestOverallResult): return '\n\n'.join(doctest_result.get_failing_tests_as_str())
            else: return str(doctest_result)
        


