import logging
import re
import time
from dataclasses import asdict, dataclass
from typing import ClassVar, Union

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

class WSBaseMessage:
    """Base class to be extended"""
    pass
    
class ConvertedMessage(WSBaseMessage):
    """A standard game state message"""
    message_pattern: str = ""
    
    @classmethod
    def check(cls, message:str):
        if not isinstance(message, str):
            raise ValueError
        return re.match(cls.message_pattern, message)
    
    @classmethod
    def get_subclasses(cls):
        return cls.__subclasses__()
    
    def wrap_for_serialization(self):
        return {
            type(self).__name__:  asdict(self)
        }

@dataclass
class RequestStartNewRoundMessage(ConvertedMessage) :
    content    : str = None
    requesting_user: str = None
    
    message_pattern: ClassVar[str] = rf"(.+) would like to start a new round"
    
    def __post_init__(self):
        search = re.match(self.message_pattern, self.content)
        self.requesting_user = search.group(1) if search is not None else 'Unknown'

@dataclass
class RoundStartingMessage(ConvertedMessage):
    content    : Union[str, None] = None
    
    message_pattern: ClassVar[str] = rf"Initializing game..."
    
    @classmethod
    def create(cls):
        return cls(cls.message_pattern)

@dataclass 
class RoundCreatedMessage(ConvertedMessage):
    content    : Union[str, None] = None
    start_time : Union[float, None] = None
    prompt     : str = None
    
    message_pattern: ClassVar[str] = rf"Started a game at (.+) with prompt (.+)"

    def __post_init__(self):
        search = re.match(self.message_pattern, self.content)
        self.start_time = float(search.group(1)) if search is not None else 'Unknown'
        self.start_time = search.group(2) if search is not None else 'Could not find prompt'
        
    @classmethod
    def create(cls, start_time, prompt:str):
        """Create a new RoundCreatedMessage object at the current time"""
        # uhh does postinit run here?
        return cls(content=f"Started a game at {start_time} with prompt {prompt}",
                   start_time=start_time,
                   prompt=prompt)

@dataclass
class RoundEndedMessage(ConvertedMessage):
    content : str = None
    
    message_pattern: ClassVar[str] = rf"The round has ended. No new submissions will be accepted."

    @classmethod
    def create(cls):
        """Create a new EndRoundMessage object"""
        return cls(cls.message_pattern)

@dataclass
class RoundAlreadyStartedMessage(ConvertedMessage):
    content : str = None
    
    message_pattern: ClassVar[str] = rf"Round has already been started, please wait until the current round ends."
    
    @classmethod
    def create(cls):
        """Create a new RoundAlreadyStartedMessage object"""
        return cls(cls.message_pattern)

@dataclass
class CouldNotCreateRoundMessage(ConvertedMessage):
    content : str = None
    
    message_pattern: ClassVar[str] = rf"An error happened while creating the round. Please try again"

    @classmethod
    def create(cls):
        """Create a new CouldNotCreateRoundMessage object"""
        return cls(cls.message_pattern)

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

@dataclass
class ChatMessage(ConvertedMessage):
    content: str = None
    user:    str = None
    
    # format - username: chat message
    message_pattern: ClassVar[str] = r"(.+?): .+"
    
    def __post_init__(self):
        search = re.match(self.message_pattern, self.content)
        self.user = search.group(1) if search is not None else 'Unknown'
        
def convert_to_game_state_message(string: str):
    message_classes = ConvertedMessage.get_subclasses()
    
    for message_class in message_classes:
        if message_class.check(string):
            return message_class(string)