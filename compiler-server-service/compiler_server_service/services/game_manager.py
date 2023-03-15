# import abc
# import asyncio
# import logging
# import re
# import time
# from dataclasses import asdict, dataclass, field
# from typing import ClassVar, List, Set, Union

# from compiler_server_service.services.db_dao import RedisDAO
# from compiler_server_service.services.open_api_dao import generate_prompt
# from fastapi import WebSocket, WebSocketDisconnect

# logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
# log = logging.getLogger(__name__)

# tasks = set()


# class CodingConundrumManager:
#     """Handles two sources of data concurrently:
#         1. pubsub stream 
#         2. websockets from frontend clients
#     """
    
#     round_duration__seconds = 120
#     redis_channel = 'codingconundrumstate'
    
#     def __init__(self) -> None:
#         self.is_round_creator = False
#         self.round_started = False
#         self.round_start_time: float = None
#         self.round_prompt = ''
#         self.connected_clients: Set[WebSocket] = set()
#         self.awaiting_tasks = []
#         self.channel_messages_seen = []
        
#         run_task(self.subscribe_to_pubsub_channel())
    
#     async def handle_incoming_message(self, message:str, websocket:WebSocket):
#         message = self.convert_websocket_message(message)
        
#         # user joins from client
#         if isinstance(message, (JoinMessage, LeaveMessage, ChatMessage)):
#             await self.publish_to_pubsub_channel(message)
        
#         elif isinstance(message, RequestStartNewRoundMessage):
#             await self.publish_to_pubsub_channel(message)
            
#             existing_round_message = self.check_if_existing_round()
#             if existing_round_message:
#                 await self.publish_to_pubsub_channel(RoundAlreadyStartedMessage.create())
#             else:
#                 await self.publish_to_pubsub_channel(RoundStartingMessage.create())
#                 prompt = await self.start_new_round()
#                 await websocket.send_json({'prompt':prompt})
            
            
    
#     async def start_new_round(self):
#         log.info('starting new round')
        
#         game_prompt = await generate_prompt()
        
#         round_created_message = RoundCreatedMessage.create(game_prompt)
#         await self.publish_to_pubsub_channel(round_created_message)
#         self.is_round_creator = True
#         self.round_started = True
#         self.round_start_time = round_created_message.start_time
#         self.round_prompt = game_prompt
        
#         return game_prompt
    
#     async def handle_new_channel_message(self, message:dict):
#         converted_message = self.convert_channel_message(message)
#         self.channel_messages_seen.append(converted_message)
        
#         log.info(message)
#         await self.publish_message_to_clients(message)
    
#     async def publish_message_to_clients(self, message:dict):
#         '''	Broadcast a message to all connected websockets of clients connected to this game manager
#         Primarily used to update clients when the state of the game changes 
#         '''
#         for client in self.connected_clients:
#             try:
#                 await client.send_json(message)
#             except RuntimeError:
#                 log.exception(f"tried to send ws msg: {message} to ws {client} but failed")
        
#     async def subscribe_to_pubsub_channel(self):
#         '''	Subscribe to the channel where all game state changes are broadcast 
#         Examples would be when a new user joins or leaves, or a new round is started
#         '''
#         await RedisDAO.subscribe(self.handle_new_channel_message, self.redis_channel)
        
#     async def publish_to_pubsub_channel(self, message:"ConvertedMessage"):
#         if not isinstance(message, ConvertedMessage): log.warning("Game channel should not have arbitrary strings, use a child class of ConvertedMessage instead")
#         await RedisDAO.publish(self.redis_channel, message.content)
        
        
#     def add_client(self, ws: WebSocket):
#         self.connected_clients.add(ws)
        
#     def remove_client(self, ws: WebSocket):
#         self.connected_clients.remove(ws)
        
#     async def wait_for_incoming(self, websocket: WebSocket):
#         try:
#             while True:
#                 message = await websocket.receive_text()
#                 await self.handle_incoming_message(message, websocket)
#                 log.info(message)
#                 await asyncio.sleep(0.5)
#         except WebSocketDisconnect:
#             return
    
#     def check_if_existing_round(self) -> Union["RoundCreatedMessage", None]:
#         for message in self.channel_messages_seen:
#             if isinstance(message, RoundCreatedMessage):
#                 if (time.time() - message.start_time) < self.round_duration__seconds:
#                     return message
                
#         return False
                
#     def convert_websocket_message(self, message) -> "ConvertedMessage":
#         """Parses incoming WebSocket messages to specific defined messages"""
#         message_types: List["ConvertedMessage"] = [JoinMessage, LeaveMessage, RequestStartNewRoundMessage, RoundCreatedMessage, ChatMessage]
        
#         for message_class in message_types:
#             if message_class.check(message): return message_class(message)
        
#         log.warning(f'could not convert message to known format {message}')
    
#     def convert_channel_message(self, message:dict) -> "ConvertedMessage":
#         """Parses new channel message to specific defined messages"""
#         message_types: List["ConvertedMessage"] = [JoinMessage, LeaveMessage, RequestStartNewRoundMessage, RoundCreatedMessage, ChatMessage]
        
#         # redis pubsub format
#         message_content = message.get('data',None)
#         for message_class in message_types:
#             if message_class.check(message_content): return message_class(message_content)
        
#         log.warning(f'could not convert message to known format {message}')
    
#     @dataclass
#     class EndpointResponse:
#         converted_stream_data: List["ConvertedMessage"]
#         roundCreatedMessage:   Union["RoundCreatedMessage", None]
        
#         round_started: bool                      = None
#         round_start_time: Union[None, float]     = None
        
#         def __post_init__(self):
#             self.round_started    = bool(self.roundCreatedMessage)
#             self.round_start_time = None if not bool(self.roundCreatedMessage) or not self.roundCreatedMessage.start_time else self.roundCreatedMessage.start_time

# @dataclass
# class CodeConundrumRound:
#     players: List[str]
#     prompt: str = ""
#     start_time: float = field(default_factory=lambda: time.time())
    

# class WSBaseMessage:
#     message_pattern: str = ""
    
#     @classmethod
#     def check(cls, message:str):
#         if not isinstance(message, str):
#             raise ValueError
#         return re.match(cls.message_pattern, message)
    
# class ConvertedMessage(WSBaseMessage):
#     pass
    
# @dataclass
# class RequestStartNewRoundMessage(ConvertedMessage) :
#     content    : str = None
#     requesting_user: str = None
    
#     message_pattern: ClassVar[str] = rf"(.+) would like to start a new round"
    
#     def __post_init__(self):
#         search = re.match(self.message_pattern, self.content)
#         self.requesting_user = search.group(1) if search is not None else 'Unknown'

# @dataclass
# class RoundStartingMessage(ConvertedMessage):
#     content    : Union[str, None] = None
    
#     message_pattern: ClassVar[str] = rf"Initializing game..."
    
#     @classmethod
#     def create(cls):
#         return cls(cls.message_pattern)

# @dataclass 
# class RoundCreatedMessage(ConvertedMessage):
#     content    : Union[str, None] = None
#     start_time : Union[float, None] = None
#     prompt     : str = None
    
#     message_pattern: ClassVar[str] = rf"Started a game at (.+) with prompt (.+)"

#     def __post_init__(self):
#         search = re.match(self.message_pattern, self.content)
#         self.start_time = float(search.group(1)) if search is not None else 'Unknown'
#         self.start_time = search.group(2) if search is not None else 'Could not find prompt'
        
#     @classmethod
#     def create(cls, prompt:str):
#         """Create a new RoundCreatedMessage object at the current time"""
#         return cls(content=f"Started a game {str(time.time())} with prompt {prompt}")
    
# @dataclass
# class RoundAlreadyStartedMessage(ConvertedMessage):
#     content : str = None
    
#     message_pattern: ClassVar[str] = rf"Round has already been started, please wait until the current round ends."
    
#     def create(cls):
#         """Create a new RoundAlreadyStartedMessage object"""
#         return cls(cls.message_pattern)

# @dataclass
# class JoinMessage(ConvertedMessage):
#     content    : Union[str, None] = None
#     joined_user: Union[str, None] = None
    
#     message_pattern: ClassVar[str] = r"(.+) has joined"
    
#     def __post_init__(self):
#         search = re.match(self.message_pattern, self.content)
#         self.joined_user = search.group(1) if search is not None else 'Unknown'

# @dataclass
# class LeaveMessage(ConvertedMessage):
#     content  : Union[str, None] = None
#     left_user: Union[str, None] = None
    
#     message_pattern: ClassVar[str] = r"(.+) has left"
    
#     def __post_init__(self):
#         search = re.match(self.message_pattern, self.content)
#         self.left_user = search.group(1) if search is not None else 'Unknown'

# @dataclass
# class ChatMessage(ConvertedMessage):
#     content: str = None
#     user:    str = None
    
#     # format - username: chat message
#     message_pattern: ClassVar[str] = r"(.+?): .+"
    
#     def __post_init__(self):
#         search = re.match(self.message_pattern, self.content)
#         self.user = search.group(1) if search is not None else 'Unknown'

# def run_task(f):
#     """asyncio task runner"""
#     task = asyncio.create_task(f)
#     tasks.add(task)
#     task.add_done_callback(tasks.discard)
#     return task