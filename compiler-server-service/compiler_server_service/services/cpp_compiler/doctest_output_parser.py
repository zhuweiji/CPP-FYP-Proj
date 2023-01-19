import logging
import re
from dataclasses import dataclass
from typing import Union

from compiler_server_service.services.cpp_compiler.process_results import (
    CodeExecutionResult,
    CompilationResult,
)
from compiler_server_service.utilities import get_named_capture_group, safe_get

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


class DoctestOutputParser:
    TEST_CASE_SEPERATOR = "==============================================================================="
    
    @classmethod
    def parse(cls, doctest_result: Union[CompilationResult, str, CodeExecutionResult]):
        parse_function = cls.parse_compilation_result if isinstance(doctest_result, CompilationResult) else cls.parse_execution_result
        return parse_function(doctest_result)
        
    @classmethod
    def parse_execution_result(cls, result: CodeExecutionResult):
        main_output, secondary_output = result.stdout, result.stderr
        if not isinstance(main_output, str): raise ValueError
        
        
        test_result_blocks = main_output.split(cls.TEST_CASE_SEPERATOR)
        
        header, footer = None, None
        
        if DoctestOutputHeader.is_header(test_result_blocks[0]):
            header = DoctestOutputHeader(test_result_blocks[0])
            test_result_blocks = test_result_blocks[1:]
        
        if DoctestOutputFooter.is_footer(test_result_blocks[-1]):
            footer = DoctestOutputFooter(test_result_blocks[-1])
            test_result_blocks = test_result_blocks[:-1]
        
        if footer: 
            overall_result = DoctestOverallResult(all_passed=False, total_number_tests_cases=footer.total_testcases, number_passing_test_cases=footer.passing_testcases, number_failing_test_cases=footer.failing_testcases)
            if footer.success:
                overall_result.set_all_passed__true()
                return overall_result
        else:
            overall_result = DoctestOverallResult(all_passed=False, total_number_tests_cases=0, number_passing_test_cases=0, number_failing_test_cases=0)
            
        
            
        
        test_result_blocks = [block for block in test_result_blocks if block]
        
        
        failing_testcases = [DoctestTestCaseFailure(block) for block in test_result_blocks]
        overall_result.failing_test_cases = failing_testcases
        if overall_result.number_failing_test_cases == 0: overall_result.number_failing_test_cases = len(failing_testcases)
        
        return overall_result
        
        
        
    @classmethod
    def parse_compilation_result(cls, result: CompilationResult):
        return DoctestCompilationError(result)


@dataclass
class DoctestCompilationError(CompilationResult):
    """Thin wrapper over CompilationResult as all the error parsing lives there
    This class will take an instance of CompilationResult during init, but act exactly the same - functions as just a rename of the CompilationResult object
    """
    
    
    def __init__(self, baseObject):
        self.__class__ = type(baseObject.__class__.__name__, (self.__class__, baseObject.__class__), {})
        self.__dict__ = baseObject.__dict__
        
    


@dataclass
class DoctestTestCaseFailure:
    testcase: str
    assertion: str
    subcase: str = "None" # TODO should add the parsing regex for it if we use it in the future
    
    def __init__(self, string: str) -> None:
        TESTCASE_REGEX = r"TEST CASE:\s+(?P<testcase>.+)"
        ASSERTION_REGEX = r'FATAL ERROR:\s*(?P<assertion>.+) is NOT correct!'
        
        self.testcase = get_named_capture_group(TESTCASE_REGEX, string).get('testcase', "Unable to get Testcase Name").strip()
        self.assertion = get_named_capture_group(ASSERTION_REGEX, string).get('assertion', "Unable to get Assertion").strip()
        
    def __str__(self) -> str:
        return f"DoctestTestCaseFailure:\nTestcase: {self.testcase} | Subcase: {self.subcase} | Assertion: {self.assertion}"
        


@dataclass
class DoctestOverallResult:
    total_number_tests_cases: int
    number_passing_test_cases: int
    number_failing_test_cases: int
    
    all_passed: bool = False
    failing_test_cases: tuple = ()
    
    def __bool__(self): return self.all_passed
    
    @property
    def success(self): 
        return bool(self)
    
    def __repr__(self) -> str: return f"DoctestOverallResult: All_passed: {self.all_passed} \nTotal_test_cases: {self.total_number_tests_cases} \nPassing_test_cases: {self.number_passing_test_cases} \nFailing_test_cases: {self.number_failing_test_cases}"
    def set_all_passed__true(self): self.all_passed = True
    def get_failing_tests_as_str(self): return [str(i) for i in self.failing_test_cases]


@dataclass
class DoctestOutputHeader:
    version: str
    
    def __init__(self, string:str) -> None:
        VERSION_REGEX = r"\[doctest\] doctest version is (?P<version>)"
        self.version = get_named_capture_group(VERSION_REGEX, string)
    
    @staticmethod
    def is_header(string: str):
        VERSION_REGEX = "[doctest] doctest version is"
        
        return VERSION_REGEX in string

@dataclass
class DoctestOutputFooter:
    """The bottom most line of a doctest result given that the command line arguments to doctest are unchanged (some will give less verbose output or output matching JUnit tests, or others)
    Indicates the overall summary of the results of the doctest"""
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