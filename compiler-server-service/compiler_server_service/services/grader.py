"""
evaluate doctests
check console output
"""

import logging
import os
from typing import Literal, Union

from compiler_server_service.services.cpp_compiler.cpp_compiler_revised import (
    CPP_Compiler,
)
from compiler_server_service.services.cpp_compiler.doctest_output_parser import (
    DoctestOutputParser,
    DoctestOverallResult,
)
from compiler_server_service.services.cpp_compiler.process_results import ProcessResult
from compiler_server_service.services.tutorial_dataloader import TutorialDataLoader
from compiler_server_service.utilities import GUIDED_TUTORIALS_DIR_PATH

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


class Grader:
    def check_console_output(topicId:int, tutorialId:int, code:str) -> bool:
        if not (tutorial_data := TutorialDataLoader.find_tutorial(topicId=topicId, tutorialId=tutorialId)): raise TutorialDataNotFound # the tutorial must exist to be graded, we cannot automatically mark missing tutorials as correct
        if not (expected_output := tutorial_data.expectedConsoleOutput): return True # if no console output is explicitly written in the data, then the code is always right
        
        compile_result = CPP_Compiler.write_compile_run(code=code, add_custom_headers=False)
        
        return compile_result.stdout.strip() == expected_output.strip()
        
    
    def check_doctest(topicId:int, tutorialId:int, code: str) -> Union[Literal[True], str]:
        # should find all file related to this tutorial in compiler-server-service\cpp_source_files\guided_tutorials\ and compile with the code
        tutorial_files_path = GUIDED_TUTORIALS_DIR_PATH / f'topic_{topicId}' / f'tutorial_{tutorialId}'
        
        
        if not tutorial_files_path.exists(): raise TutorialDataNotFound
        prewritten_files_for_tutorial = os.listdir(str(tutorial_files_path))
        if not prewritten_files_for_tutorial: return True
        
        log.info(prewritten_files_for_tutorial)
        
        process_result = CPP_Compiler.write_compile_run(code=code, add_custom_headers=True)
        
        doctest_result = DoctestOutputParser.parse(process_result)
        
        if isinstance(doctest_result, DoctestOverallResult) and doctest_result.all_passed: return True
        else: 
            # should convert to string interpretable result here
            if isinstance(doctest_result, DoctestOverallResult): return '\n\n'.join(doctest_result.get_failing_tests_as_str())
            else: return str(doctest_result)
        


class TutorialDataNotFound(ValueError):
    "Data not found for that tutorial"
    pass