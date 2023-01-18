import json
import logging
from dataclasses import dataclass
from typing import Any, Union

from compiler_server_service.utilities import (
    TUTORIAL_DATA_FILE_PATH,
    MissingSetupData,
    safe_get,
)

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


@dataclass
class TutorialData:
    id                    : int
    name                  : str
    leftPaneInstructions  : str
    expectedConsoleOutput : str = None
    
@dataclass
class TopicData:
    topicId    : int
    topic_name : str
    description: str
    img_name   : str
    tutorials  : list[TutorialData]
    
    
class TutorialDataLoader:
    all_topics_data: dict[int, TopicData] = {}
    

    raw_data = {}
    with open(TUTORIAL_DATA_FILE_PATH) as f:
        raw_data = json.load(f)
    if not (all_topics_raw_data := raw_data.get('topics', None)): raise MissingSetupData
    
    topic_data_list = [TopicData(**data) for data in all_topics_raw_data]    
    
    for topic in topic_data_list:
        all_topics_data[topic.topicId] = topic
        topic.tutorials = [TutorialData(**tutorial) for tutorial in topic.tutorials]
    
    
    @classmethod
    def get_topic(cls, topicId: int):
        return safe_get(TutorialDataLoader.all_topics_data, topicId)
    
    @classmethod
    def find_tutorial(cls, topicId: int, tutorialId: int) -> Union[TutorialData, Any]:
        if not (topic := cls.get_topic(topicId)): return None
        return next( (i for i in topic.tutorials if i.id == tutorialId) , None) 
    
        
    

    