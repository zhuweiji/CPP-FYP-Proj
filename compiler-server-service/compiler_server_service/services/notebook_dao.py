import logging
from pathlib import Path

from compiler_server_service.utilities import NOTEBOOK_DIR_PATH

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

class NotebookDAO:
    DATA_SRC_PATH = NOTEBOOK_DIR_PATH
    notebook_file_extension = '.txt'
    
    @classmethod
    def get_notebook_by_name(cls, name):
        found_files = list(cls.DATA_SRC_PATH.glob(f'{name}{cls.notebook_file_extension}'))
        if not found_files:
            return False
        
        if len(found_files) > 1: log.warning(f'Found more than one notebook when looking for notebook named {name}')
        file = found_files[0]
        
        with open(file, 'r') as f:
            return f.read()
        
            