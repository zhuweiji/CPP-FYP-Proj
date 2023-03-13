import logging
from dataclasses import asdict

from compiler_server_service.routers.templates import BasicResponse
from compiler_server_service.services.db_dao import RedisDAO
from compiler_server_service.services.game_manager import CodingConundrumManager

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from fastapi import (
    APIRouter,
    HTTPException,
    Request,
    Response,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from pydantic import BaseModel

ROUTE_PREFIX = '/games'

router = APIRouter(
    prefix=ROUTE_PREFIX,
)

codingConundrumManager = CodingConundrumManager()


# @router.on_event('startup')
# async def startup_event():
#     global codingConundrumManager
#     codingConundrumManager = CodingConundrumManager()

@router.websocket('/start')
async def coding_conundrum_websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # await codingConundrumManager.subscribe_to_channel()
    codingConundrumManager.add_client(websocket)
    await codingConundrumManager.wait_for_incoming(websocket)
    
    

@router.get('/')
async def compiler_status(request: Request):
    return BasicResponse(message="we're up!")