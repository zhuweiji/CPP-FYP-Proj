import json
import logging
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, List, Union

from compiler_server_service.utilities import (
    GUIDED_TUTORIALS_DIR_PATH,
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
    prewritten_cpp_files  : list = field(default_factory=lambda: [])
    prewritten_tests      : list = field(default_factory=lambda: [])
    expectedConsoleOutput : str = ""
    
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
    
    @classmethod 
    def get_prewritten_cpp_files(cls, topicId: int, tutorialId: int) -> List[Path]:
        tutorial_files_path = GUIDED_TUTORIALS_DIR_PATH / f'topic_{topicId}' / f'tutorial_{tutorialId}'
        if not tutorial_files_path.exists(): raise TutorialDataNotFound
        
        prewritten_file_names = cls.find_tutorial(topicId=topicId, tutorialId=tutorialId).prewritten_cpp_files
        prewritten_files_for_tutorial = [tutorial_files_path/i for i in os.listdir(str(tutorial_files_path)) if '.cpp' in i and i in prewritten_file_names]
        return prewritten_files_for_tutorial
    
    @classmethod 
    def get_prewritten_test_files(cls, topicId: int, tutorialId: int) -> List[Path]:
        tutorial_files_path = GUIDED_TUTORIALS_DIR_PATH / f'topic_{topicId}' / f'tutorial_{tutorialId}'
        if not tutorial_files_path.exists(): raise TutorialDataNotFound
        
        prewritten_test_file_names = cls.find_tutorial(topicId=topicId, tutorialId=tutorialId).prewritten_tests
        prewritten_tests_for_tutorial = [tutorial_files_path/i for i in os.listdir(str(tutorial_files_path)) if '.cpp' in i and i in prewritten_test_file_names]
        return prewritten_tests_for_tutorial


class TutorialDataNotFound(ValueError):
    "Data not found for that tutorial"
    pass
        
    

    