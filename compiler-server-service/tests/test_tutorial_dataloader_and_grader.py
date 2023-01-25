import logging
import subprocess
import tempfile
import unittest
from pathlib import Path

from compiler_server_service.services.grader import Grader
from compiler_server_service.services.tutorial_dao import TutorialDAO
from tests.utilities import *

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)



class TestTutorialDataLoader(unittest.TestCase): 
    def test_topic_import(self):
        assert TutorialDAO.all_topics_data
        
    def test_left_pane_import(self):
        assert TutorialDAO.find_tutorial(topicId=1, tutorialId=1)
        
        
class TestGrader(unittest.TestCase):
    def test_check_doctest(self):
        result = Grader.check_doctest(code='int main(){return 0;}',topicId=1, tutorialId=1)
        log.info(result)