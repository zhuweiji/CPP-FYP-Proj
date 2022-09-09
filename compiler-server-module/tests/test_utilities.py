from pathlib import Path
import unittest
import logging

logging.basicConfig(format='%(process)d-%(levelname)s:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from src.utilities import *

class TestUtilities(unittest.TestCase):
    def test_check_path_exists(self):
        parent_filepath = Path(__file__).parent
        assert check_path_exists(parent_filepath,is_dir=True)
        assert check_path_exists(parent_filepath,parent_filepath,parent_filepath,is_dir=True)
        
        assert check_path_exists(Path(__file__), is_file=True)
        assert check_path_exists(Path(__file__),Path(__file__),Path(__file__), is_file=True)
        
        assert not check_path_exists(parent_filepath/'asoidnaoisdoaisndoiqnoi12', is_file=True)
        
        with self.assertRaises(ValueError): check_path_exists(Path(__file__))
        with self.assertRaises(ValueError): check_path_exists(Path(__file__), is_dir=True, is_file=True)
        
            