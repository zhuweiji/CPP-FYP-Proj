import asyncio
import logging
import re
import time

from game_service.services.game_state_messages import (
    ChatMessage,
    CouldNotCreateRoundMessage,
    JoinMessage,
    LeaveMessage,
    RequestStartNewRoundMessage,
    RoundAlreadyStartedMessage,
    RoundCreatedMessage,
    RoundEndedMessage,
    RoundStartingMessage,
    convert_to_game_state_message,
)
from game_service.services.open_api_dao import generate_prompt

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

class CodingConundrumManager:
    round_duration__seconds = 240
    
    def __init__(self, connectionManager) -> None:
        self.round_started = False
        self.round_start_time = None
        self.round_prompt = ''
        self.creating_round_in_progress = False
        
        self.connectionManager = connectionManager
        
    async def handle_new_connection(self, connection):
        if self.round_started:
            await self.connectionManager.send_personal_message(
                RoundCreatedMessage.create(self.round_start_time, self.round_duration__seconds, self.round_prompt).wrap_for_serialization(), connection
            )
        
    async def handle_incoming_message(self, message:str):
        message_queue = []
        is_state_message = False
        
        if '[gamestate]: ' in message:
            is_state_message = True
            message = convert_to_game_state_message(message.replace('[gamestate]: ',''))
        
        if isinstance(message, ChatMessage):
            await self.connectionManager.broadcast(message.wrap_for_serialization())
            return
            
        if isinstance(message, (JoinMessage, LeaveMessage)):
            await self.connectionManager.broadcast(message.wrap_for_serialization())
            
        elif isinstance(message, RequestStartNewRoundMessage):
            await self.connectionManager.broadcast(message.wrap_for_serialization())
            
            if not self.round_started:
                asyncio.create_task(self.start_new_round())
            else:
                message_queue.append(RoundAlreadyStartedMessage.create())
                
        else:
            log.info(f'received message {message} but did not process it')
            
                    
        for queued_message in message_queue:
            await self.connectionManager.broadcast(queued_message.wrap_for_serialization())
            
    async def start_new_round(self):
        if self.creating_round_in_progress:
            return 
        
        await self.connectionManager.broadcast(
            RoundStartingMessage.create().wrap_for_serialization()
        )
        self.creating_round_in_progress = True
        
        try:
            game_prompt = await generate_prompt()
            # game_prompt = 'aa'
            log.info(game_prompt)
            self.round_started = True
            self.round_start_time = time.time()
            self.round_prompt = game_prompt
            
            t = asyncio.create_task(self.setup_end_round())
            
            await self.connectionManager.broadcast(
                RoundCreatedMessage.create(self.round_start_time,
                                           self.round_duration__seconds,
                                           self.round_prompt).wrap_for_serialization()
            )
            
            await t 
        except asyncio.TimeoutError:
            log.warning('timeout when starting new game')
            self.connectionManager.broadcast(
                CouldNotCreateRoundMessage.create().wrap_for_serialization()
            )
        finally:
            self.creating_round_in_progress = False
            
        
        
    async def setup_end_round(self):
        async def _end_round():
            self.round_started = False
            self.round_start_time = None
            self.round_prompt = ''
            await self.connectionManager.broadcast(
                RoundEndedMessage.create().wrap_for_serialization()
            )
            
        try:
            log.info('starting end round setup')
            await asyncio.sleep(self.round_duration__seconds)
            log.info('ending round')
            await _end_round()
        except asyncio.TimeoutError:
            log.exception('was not able to termiante codingconundrum round')
            
