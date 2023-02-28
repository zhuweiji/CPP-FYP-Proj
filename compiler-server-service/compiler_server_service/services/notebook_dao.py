import logging
from pathlib import Path

from compiler_server_service.services.tutorial_dao import TutorialDAO
from compiler_server_service.utilities import NOTEBOOKS_PATH

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

class NotebookDAO:
    notebook_file_extension = '.txt'
    
    @classmethod
    def get_notebook_by_tutorial(cls, topicId:int, tutorialId: int):
        tutorial = TutorialDAO.find_tutorial(topicId=topicId, tutorialId=tutorialId)
        return None if not tutorial.notebook else cls.get_notebook_by_name(tutorial.notebook)
    
    @classmethod
    def get_tutorial_instructions_by_tutorial(cls, topicId:int, tutorialId: int):
        tutorial = TutorialDAO.find_tutorial(topicId=topicId, tutorialId=tutorialId)
        return None if tutorial.no_tutorial else cls.get_notebook_by_name(tutorial.tutorial_instructions)
    
    
    @classmethod
    def get_notebook_by_name(cls, name):
        return cls._get_notebook(name, NOTEBOOKS_PATH)
    
    @classmethod
    def _get_notebook(cls, notebook_name:str, notebook_source_path: Path):
        found_files = list(notebook_source_path.glob(f'{notebook_name}{cls.notebook_file_extension}'))
        
        if not found_files:
            return False
        
        if len(found_files) > 1: log.warning(f'Found more than one notebook when looking for notebook named {notebook_name}')
        file = found_files[0]
        
        with open(file, 'r') as f:
            return f.read()
        
    