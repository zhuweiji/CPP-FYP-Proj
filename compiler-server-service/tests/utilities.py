import logging
import unittest
from pathlib import Path

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

TEST_ROOT_DIR_PATH = Path(__file__).parent
CPP_TEST_FILES_DIR_PATH = TEST_ROOT_DIR_PATH / 'cpp_files_for_testing'

            