import inspect
import logging
from dataclasses import asdict, dataclass, field
from typing import ClassVar, List, Union

from compiler_server_service.services.notes_dao import NotesData
from compiler_server_service.services.video_resource_dao import VideoResourceData
from compiler_server_service.services.exam_paper_dao import ExamPaperData
from compiler_server_service.services.exam_solution_dao import ExamSolutionData

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


@dataclass
class ResourceData:

    @classmethod
    def find_all(cls):
        notes = NotesData.find_all()
        exam_papers = ExamPaperData.find_all()
        exam_solutions = ExamSolutionData.find_all()
        videos = VideoResourceData.find_all()
        
        return {
            'notes': notes,
            'exam_papers': exam_papers,
            'exam_solutions': exam_solutions,
            'videos': videos
        }      
    

        

