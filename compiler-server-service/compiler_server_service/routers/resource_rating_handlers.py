import logging

from compiler_server_service.services.resource_dao import ResourceData
from compiler_server_service.services.user_dao import UserData
from compiler_server_service.services.resource_rating_dao import ResourceRatingData
from compiler_server_service.services.notes_dao import NotesData
from compiler_server_service.services.exam_paper_dao import ExamPaperData
from compiler_server_service.services.exam_solution_dao import ExamSolutionData
from compiler_server_service.services.video_resource_dao import VideoResourceData
from compiler_server_service.services.db_dao import DB_DAO
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

logging.basicConfig(
    format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
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
    resource_type: str  # notes, exam_paper, exam_solution, video_resource


@router.delete('/{resource_id}', status_code=200)
def delete_ratings_by_resource_id(request: Request, resource_id: str):
    deleted_count = ResourceRatingData.delete_ratings_by_resource_id(
        resource_id)

    return {
        'detail': 'Ratings successfully deteled',
        'ratingsCount': deleted_count
    }


@router.post('/')
def create_rating(request: Request, data: POST__Create_Rating):
    # check valid user id
    found_user = UserData.find_by_id(data.user_id)
    if not found_user:
        raise HTTPException(status_code=404, detail='user not found')

    # check if the user has rated this resource before
    found_rating = ResourceRatingData.find_by_keys(
        data.user_id, data.resource_id)

    client = DB_DAO.db_client
    # start DB session
    try:
        with client.start_session() as session:
            with session.start_transaction():
                if found_rating:
                    old_rating = found_rating.rating
                    log.info('old rating: ' + str(old_rating))
                    increment = data.rating - old_rating
                    # update rating total
                    if data.resource_type == 'notes':
                        if not NotesData.update_rating_stats(data.resource_id, increment, session=session):
                            raise HTTPException(
                                status_code=404, detail='Invalid resource ID')
                    elif data.resource_type == 'exam_paper':
                        if not ExamPaperData.update_rating_stats(data.resource_id, increment, session=session):
                            raise HTTPException(
                                status_code=404, detail='Invalid resource ID')
                    elif data.resource_type == 'exam_solution':
                        if not ExamSolutionData.update_rating_stats(data.resource_id, increment, session=session):
                            raise HTTPException(
                                status_code=404, detail='Invalid resource ID')
                    elif data.resource_type == 'video_resource':
                        if not VideoResourceData.update_rating_stats(data.resource_id, increment, session=session):
                            raise HTTPException(
                                status_code=404, detail='Invalid resource ID')
                    else:
                        raise HTTPException(
                            status_code=404, detail='Invalid resource type')

                    new_rating = ResourceRatingData.update_rating(
                        found_rating.id, data.rating, session=session)
                    if not new_rating:
                        raise HTTPException(
                            status_code=404, detail='Invalid resource ID')
                    return {'ratingId': new_rating.id, 'newRating': data.rating, 'oldRating': old_rating}
                else:
                    # update rating count and total
                    if data.resource_type == 'notes':
                        if not NotesData.add_rating(data.resource_id, data.rating, session=session):
                            raise HTTPException(
                                status_code=404, detail='Invalid resource ID')
                    elif data.resource_type == 'exam_paper':
                        if not ExamPaperData.add_rating(data.resource_id, data.rating, session=session):
                            raise HTTPException(
                                status_code=404, detail='Invalid resource ID')
                    elif data.resource_type == 'exam_solution':
                        if not ExamSolutionData.add_rating(data.resource_id, data.rating, session=session):
                            raise HTTPException(
                                status_code=404, detail='Invalid resource ID')
                    elif data.resource_type == 'video_resource':
                        if not VideoResourceData.add_rating(data.resource_id, data.rating, session=session):
                            raise HTTPException(
                                status_code=404, detail='Invalid resource ID')
                    else:
                        raise HTTPException(
                            status_code=404, detail='Invalid resource type')

                    new_rating = ResourceRatingData(
                        user_id=data.user_id,
                        resource_id=data.resource_id,
                        rating=data.rating,
                        resource_type=data.resource_type
                    ).create(session=session)

                    if not new_rating:
                        raise HTTPException(
                            status_code=500, detail='error on rating creation')
                    return {'ratingId': new_rating.id, 'rating': new_rating.rating}
    except Exception as e:
        raise e

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
