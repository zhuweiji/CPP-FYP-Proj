import logging
import unittest

from compiler_server_service.services.notebook_dao import NotebookDAO

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


class TestNotebookDao(unittest.TestCase):
    def test_get_by_name(self):
        assert NotebookDAO.get_notebook_by_name('notebook_formats'), "Could not find the notebook test_notebook"
        
        
        
        
        
