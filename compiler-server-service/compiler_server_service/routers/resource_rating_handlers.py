import logging

from compiler_server_service.services.resource_dao import ResourceData
from compiler_server_service.services.resource_rating_dao import ResourceRatingData
from compiler_server_service.services.notes_dao import NotesData
from compiler_server_service.services.db_dao import DB_DAO
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

ROUTE_PREFIX = '/resource-ratings'

router = APIRouter(
    prefix=ROUTE_PREFIX,
    tags=['ResourceRatings'],
)

class POST__Create_Rating(BaseModel):
    user_id: str
    resource_id: str
    rating: int
    resource_type: str # notes, exam_paper, exam_solution, video_resource    

@router.post('/')
def create_rating(request: Request, data: POST__Create_Rating):
    # CHECKPOINT

    # check valid user id and resource id
    found_rating = ResourceRatingData.find_by_keys(data.user_id, data.resource_id)
    client = DB_DAO.db_client

    if found_rating:
        # update rating
        pass
    else:
        # start DB session
        try: 
            with client.start_session() as session:
                with session.start_transaction():
                    new_rating = ResourceRatingData(
                        user_id=data.user_id,
                        resource_id=data.resource_id,
                        rating=data.rating,
                        resource_type=data.resource_type
                    ).create()

                    if not new_rating: 
                        raise HTTPException(status_code=500, detail='error on rating creation')
                    
                    # update rating count and total
                    if data.resource_type == 'notes':
                        NotesData.add_rating(data.resource_id, data.rating)
                    elif data.resource_type == 'exam_paper':
                        # Checkpoint
                        pass
                    elif data.resource_type == 'exam_solution':
                        pass
                    elif data.resource_type == 'video_resource':
                        pass
                    else:
                        pass
        except Exception:
            raise HTTPException(status_code=500, detail='error on rating creation')

    return {'ratingId': new_rating.id, 'rating': new_rating.rating}
    # return {'faq_id': new_faq.id, 'question':new_faq.question, 'answer': new_faq.answer}

# @router.get('/', status_code=200)
# def get_all_resources(request: Request):
#     resources = ResourceData.find_all()
    
#     # Convert Cursor object to a list
#     notes_list = [note for note in resources['notes']]
#     exam_papers_list = [exam_paper for exam_paper in resources['exam_papers']]
#     exam_solutions_list = [exam_solution for exam_solution in resources['exam_solutions']]
#     videos_list = [video for video in resources['videos']]

#     return {
#         'notes': notes_list,
#         'examPapers': exam_papers_list,
#         'examSolutions': exam_solutions_list,
#         'videos': videos_list
#     }