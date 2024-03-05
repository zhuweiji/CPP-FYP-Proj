import logging

from compiler_server_service.services.resource_dao import ResourceData
from fastapi import APIRouter, HTTPException, Request

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/resources'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['Resources'],
)

@router.get('/', status_code=200)
def get_all_resources(request: Request):
    resources = ResourceData.find_all()
    
    # Convert Cursor object to a list
    notes_list = [note for note in resources['notes']]
    exam_papers_list = [exam_paper for exam_paper in resources['exam_papers']]
    exam_solutions_list = [exam_solution for exam_solution in resources['exam_solutions']]
    videos_list = [video for video in resources['videos']]

    return {
        'notes': notes_list,
        'examPapers': exam_papers_list,
        'examSolutions': exam_solutions_list,
        'videos': videos_list
    }