import logging
from dataclasses import asdict
from typing import List

from game_service.routers.templates import BasicResponse
from game_service.services.game_manager import CodingConundrumManager

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


class WebSocketConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_json(message)


connection_manager = WebSocketConnectionManager()
game_manager = CodingConundrumManager(connection_manager)

@router.websocket('/codingconundrum')
async def coding_conundrum_websocket_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket)
    
    await game_manager.handle_new_connection(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            await game_manager.handle_incoming_message(data)
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
        
@router.get('/')
async def compiler_status(request: Request):
    return BasicResponse(message="we're up!")