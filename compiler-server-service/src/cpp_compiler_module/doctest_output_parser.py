from dataclasses import dataclass
import re
from src.cpp_compiler_module.cpp_compiler import CodeExecutionResult, CompilationResult
from src.utilities import safe_get, get_named_capture_group

import logging
from typing import Union

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


class DoctestOutputParser:
    TEST_CASE_SEPERATOR = "==============================================================================="
    
    def __init__(self, doctest_result) -> None:
        return self.parse(doctest_result)
    
    @classmethod
    def parse(cls, doctest_result: Union[str, CodeExecutionResult, CompilationResult]):
        output = None
        
        if isinstance(doctest_result, CompilationResult): 
            output = cls.parse_compilation_result(doctest_result)
        else:
            # output = cls.parse_execution_result(doctest_result)
            pass
        
    @classmethod
    def parse_execution_result(cls, result: CodeExecutionResult):
        main_output, secondary_output = result.stdout, result.stderr
        if not isinstance(main_output, str): raise ValueError
        
        lines = main_output.split(cls.TEST_CASE_SEPERATOR)
        
        footer = DoctestOutputFooter(lines[-1])
        if footer.success: return True
        
        lines = [line for line in lines if line and not DoctestOutputFooter.is_footer(line)]
        
        for line in lines:
            log.info(DoctestTestCaseFailure(line))
        
        
    @classmethod
    def parse_compilation_result(cls, result: CompilationResult):
        main_output, secondary_output = result.stderr, result.stdout
        pass
    
    
@dataclass
class DoctestTestCaseFailure:
    testcase: str
    subcase: str
    assertion: str
    
    def __init__(self, string: str) -> None:
        TESTCASE_REGEX = r"TEST CASE:\s+(?P<testcase>.+)\n\s+(?P<subcase>.+)\n"
        ASSERTION_REGEX = r'FATAL ERROR:\s*(?P<assertion>.+) is NOT correct!'
        
        values = get_named_capture_group(TESTCASE_REGEX, string)
        
        if isinstance(values, dict):
            self.testcase = values.get('testcase', None)
            self.subcase = values.get('subcase', None)
            
            values = get_named_capture_group(ASSERTION_REGEX, string)
            if isinstance(values, dict):
                self.assertion = values.get('assertion', None)
            else:
                raise ValueError # not sure what should happen in the above case
        else:
            raise ValueError # not sure what should happen in the above case
        
    def __str__(self) -> str:
        return f"testcase: {self.testcase} | subcase: {self.subcase} | assertion: {self.assertion}"
        
    
@dataclass
class DoctestOutputFooter:
    total_testcases: int
    passing_testcases: int
    failing_testcases: int
    skipped_testcases: int
    
    _success: str
    
    STATUS_REGEX = r"Status:\s+(SUCCESS|FAILURE)"
    TESTCASES_REGEX = r"test cases: (?P<total>\d+) \| (?P<passing>\d+) passed \| (?P<failing>\d+) failed \| (?P<skipped>\d+) skipped"
    
    def __init__(self, string:str) -> None:
        self._success = safe_get(re.findall(self.STATUS_REGEX, string, flags=re.IGNORECASE), 0) or "UNKNOWN"
        
        testcase_values = get_named_capture_group(self.TESTCASES_REGEX, string)
        
        if not isinstance(testcase_values, dict): raise ValueError #
        
        self.total_testcases = testcase_values.get('total') or -1
        self.passing_testcases = testcase_values.get('passing') or -1
        self.failing_testcases = testcase_values.get('failing') or -1
        self.skipped_testcases = testcase_values.get('skipped') or -1
        
    @classmethod
    def is_footer(cls, string):
        return any(re.finditer(cls.TESTCASES_REGEX, string)) 
    
    @property
    def success(self): 
        return self._success.upper().strip() == "SUCCESS"
        
    def __str__(self) -> str:
        return f"All Passed: {self._success} | total: {self.total_testcases} | passing: {self.passing_testcases} | failing: {self.failing_testcases} | skipped: {self.skipped_testcases}"