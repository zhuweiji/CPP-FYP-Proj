import logging
import os
from dataclasses import dataclass, field
from itertools import count
from pathlib import Path
from typing import Any, List, Union

import yaml
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
    name                  : str
    description           : str = ""
    notebook              : str = ""
    no_tutorial           : bool = False
    tutorial_instructions : str = ""
    default_code          : Union[str, dict] = """#include <iostream>\n\n\nint main() {\n\tstd::cout << "Hello World!";\n\treturn 0;\n}"""
    diagram               : str = ""
    prewritten_cpp_files  : list = field(default_factory=lambda: [])
    prewritten_tests      : list = field(default_factory=lambda: [])
    expectedConsoleOutput : str = ""

    id                    : int = field(default_factory=count(1).__next__, init=False)
    

    def __post_init__(self):
        if self.no_tutorial is False and any((self.tutorial_instructions, self.diagram, self.prewritten_cpp_files, self.prewritten_cpp_files, self.prewritten_tests, self.expectedConsoleOutput)):
            log.warning(f'{self} has no_tutorial flag set but has some elements of a tutorial in it')
    
    def __repr__(self) -> str:
        return f'Tutorial id:{self.id} {self.name}'
    
    
@dataclass
class TopicData:
    topic_name : str
    description: str
    img_name   : str
    tutorials  : list[TutorialData]
    
    topicId    : int = field(default_factory=count(1).__next__, init=False)
    
    def __repr__(self) -> str:
        return f'Topic id: {self.topicId} {self.topic_name}'
    
    
class TutorialDAO:
    topic_data_list: list[TopicData] = []
    all_topics_data: dict[int, TopicData] = {}
    all_topic_ids = []
    
    with open(TUTORIAL_DATA_FILE_PATH.with_suffix('.yaml')) as f:
        data = yaml.safe_load(f)
    
    
    if not (all_topics_raw_data := data.get('topics', None)): raise MissingSetupData
    topic_data_list = [TopicData(**data) for data in all_topics_raw_data]    
    topic_data_list = topic_data_list
    
    for topic in topic_data_list:
        all_topics_data[topic.topicId] = topic
        topic.tutorials = [TutorialData(**tutorial) for tutorial in topic.tutorials]
        
    all_topic_ids = list(all_topics_data.keys())
    
    
        
    @classmethod
    def find_topic(cls, topicId: int) -> Union[TopicData, None]:
        return safe_get(TutorialDAO.all_topics_data, topicId)
    
    @classmethod
    def find_tutorial(cls, topicId: int, tutorialId: int) -> Union[TutorialData, None]:
        if not (topic := cls.find_topic(topicId)): return None
        return next( (i for i in topic.tutorials if i.id == tutorialId) , None) 
    
    @classmethod
    def get_topicId_of_tutorial(cls, tutorial: TutorialData):
        for topic in cls.topic_data_list:
            if tutorial in topic.tutorials:
                return topic.topicId
            
        return None
    
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
    
    
    @classmethod
    def get_previous_tutorial_of_tutorial(cls, topicId: int, tutorialId:int) -> Union[TutorialData, None]:
        previous_tutorial = None
        
        if not (topic := cls.find_topic(topicId=topicId)): return None
        this_topic_tutorial_ids = [i.id for i in topic.tutorials]
    
        # get the previous tutorial by previous id
        if tutorialId != min(this_topic_tutorial_ids): 
            previous_tutorial_id = this_topic_tutorial_ids[this_topic_tutorial_ids.index(tutorialId)-1]
            previous_tutorial = TutorialDAO.find_tutorial(topicId=topicId,tutorialId=previous_tutorial_id)
        
        # if the tutorial is the first of the topic,
        else:
            # if the tutorial is the first tutorial of the first topic: no previous tutorial
            if topicId == min(cls.all_topic_ids):
                previous_tutorial = None
            # there is a previous topic, get the last tutorial of that topic
            else:
                previous_topic_id = cls.all_topic_ids[cls.all_topic_ids.index(topicId)-1]
                previous_topic = TutorialDAO.all_topics_data[previous_topic_id]
                previous_tutorial = previous_topic.tutorials[-1]
                
        return previous_tutorial
    
    @classmethod
    def get_next_tutorial_of_tutorial(cls, topicId: int, tutorialId:int) -> Union[TutorialData, None]:
        if not (topic := cls.find_topic(topicId=topicId)): return None
        this_topic_tutorial_ids = [i.id for i in topic.tutorials]
        
        next_tutorial = None
        
        # get the next tutorial by the next id
        if tutorialId != max(this_topic_tutorial_ids): 
            next_tutorial_id = this_topic_tutorial_ids[this_topic_tutorial_ids.index(tutorialId)+1]
            next_tutorial = TutorialDAO.find_tutorial(topicId=topicId,tutorialId=next_tutorial_id)
        
        # if the tutorial is the last of the topic,
        else:
            # if the tutorial is the last tutorial of the last topic: no previous tutorial
            if topicId == max(cls.all_topic_ids):
                next_tutorial = None
            # there is a next topic, get the first tutorial of that topic
            else:
                next_topic_id = cls.all_topic_ids[cls.all_topic_ids.index(topicId)+1]
                next_topic = TutorialDAO.all_topics_data[next_topic_id]
                next_tutorial = next_topic.tutorials[0]
                
        return next_tutorial
    


class TutorialDataNotFound(ValueError):
    "Data not found for that tutorial"
    pass
        
    

    