import abc
import asyncio
import logging
import re
import time
from dataclasses import asdict, dataclass, field
from typing import ClassVar, List, Union

from compiler_server_service.services.db_dao import RedisDAO
from compiler_server_service.services.open_api_dao import generate_prompt
from fastapi import WebSocket, WebSocketDisconnect

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)




class CodingConundrumManager:
    round_duration__seconds = 120
    redis_channel = 'codingconundrumstate'
    
    async def handle_new_channel_message(message):
        log.info(f'new channel message: {message}')
        
    
    def __init__(self) -> None:
        self.is_round_creator = False
        self.round_started = False
        self.connected_clients: List[WebSocket] = []
        self.awaiting_tasks = []
    
    async def subscribe_to_channel(self):
        await RedisDAO.subscribe(self.handle_new_channel_message, self.redis_channel)
        
        
        
    def add_client(self, ws: WebSocket):
        self.connected_clients.append(ws)
        
    async def wait_for_incoming(self, websocket: WebSocket):
        try:
            while True:
                message = await websocket.receive_text()
                await self.handle_incoming_message(message, websocket)
        except WebSocketDisconnect:
            return
    
    async def handle_incoming_message(self, message:str, websocket:WebSocket):
        log.info(message)
        message = self.convert_message(message)
        
        # user joins from client
        if isinstance(message, JoinMessage):
            await RedisDAO.publish(self.redis_channel, message.content)
        
        elif isinstance(message, RequestStartNewRoundMessage):
            log.info('new round message')
            await RedisDAO.publish(self.redis_channel, message.content)
            prompt = await self.start_new_round()
            await websocket.send_json({'prompt':prompt})
            
            # RedisDAO.add_to_a_stream(self.redis_channel, message.content)
            # stream_data = RedisDAO.read_from_a_stream(self.redis_channel)
            # converted_stream_data = [self.convert_message(i.content['message']) for i in stream_data]
            
            # existing_round = self.check_if_existing_round(converted_stream_data)
            # response = self.EndpointResponse(converted_stream_data, existing_round)
            
            # return response
            
        # # user leaves 
        # elif isinstance(message, LeaveMessage):
        #     RedisDAO.publish(self.redis_channel, message.content)
            
            
        # elif isinstance(message, RequestStartNewRoundMessage):
        #     RedisDAO.add_to_a_stream(CODING_CONUNDRUM_STATE_REDIS_STREAM, message.content)
        #     log.info(RedisDAO.read_from_a_stream(CODING_CONUNDRUM_STATE_REDIS_STREAM))
            
    async def start_new_round(self):
        log.info('generating new prompt')
        game_prompt = await generate_prompt()
        return game_prompt
    
    def check_if_existing_round(self, converted_stream_data: List["ConvertedMessage"]) -> Union["RoundCreatedMessage", None]:
        for message in converted_stream_data:
            if isinstance(message, RoundCreatedMessage):
                if time.time() - message.start_time < self.round_duration__seconds:
                    return message
                
        return None
                
    def convert_message(self, message) -> "WSBaseMessage":
        message_types: List[WSBaseMessage] = [JoinMessage, LeaveMessage, RequestStartNewRoundMessage]
        
        for message_class in message_types:
            if message_class.check(message):
                return message_class(message)
    
    @dataclass
    class EndpointResponse:
        converted_stream_data: List["ConvertedMessage"]
        roundCreatedMessage:   Union["RoundCreatedMessage", None]
        
        round_started: bool                      = None
        round_start_time: Union[None, float]     = None
        
        def __post_init__(self):
            self.round_started    = bool(self.roundCreatedMessage)
            self.round_start_time = None if not bool(self.roundCreatedMessage) or not self.roundCreatedMessage.start_time else self.roundCreatedMessage.start_time



@dataclass
class CodeConundrumRound:
    players: List[str]
    prompt: str = ""
    start_time: float = field(default_factory=lambda: time.time())
    

class WSBaseMessage:
    message_pattern: str = ""
    
    @classmethod
    def check(cls, message:str):
        if not isinstance(message, str):
            raise ValueError
        return re.match(cls.message_pattern, message)
    
class ConvertedMessage(WSBaseMessage):
    pass
    
@dataclass
class RequestStartNewRoundMessage(ConvertedMessage) :
    content    : Union[str, None] = None
    
    message_pattern: ClassVar[str] = rf"(.+) would like to start a new round"
    
    def __post_init__(self):
        search = re.match(self.message_pattern, self.content)
        self.start_time = search.group(1) if search is not None else 'Unknown'

@dataclass 
class RoundCreatedMessage(ConvertedMessage):
    content    : Union[str, None] = None
    start_time : Union[float, None] = None
    
    message_pattern: ClassVar[str] = rf"Started a game at (.+) time"

    def __post_init__(self):
        search = re.match(self.message_pattern, self.content)
        self.start_time = search.group(1) if search is not None else 'Unknown'

@dataclass
class JoinMessage(ConvertedMessage):
    content    : Union[str, None] = None
    joined_user: Union[str, None] = None
    
    message_pattern: ClassVar[str] = r"(.+) has joined"
    
    def __post_init__(self):
        search = re.match(self.message_pattern, self.content)
        self.joined_user = search.group(1) if search is not None else 'Unknown'

@dataclass
class LeaveMessage(ConvertedMessage):
    content  : Union[str, None] = None
    left_user: Union[str, None] = None
    
    message_pattern: ClassVar[str] = r"(.+) has left"
    
    def __post_init__(self):
        search = re.match(self.message_pattern, self.content)
        self.left_user = search.group(1) if search is not None else 'Unknown'
    