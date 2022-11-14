import logging
import re
from pathlib import Path

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

# might want to create (or ensure they are created) all these directories with a script on startup 
# some of the test errors from ProcessWrapper are hard to comprehend when the directories are simply not created

CPP_MODULE_DIR_PATH = Path(__file__).parent
COMPILER_SERVER_SERVICE_DIR_PATH = CPP_MODULE_DIR_PATH.parent
USER_TEMP_FILES_DIR_PATH = CPP_MODULE_DIR_PATH / 'user_temp_files'

CPP_SOURCE_FILES_DIR_PATH = COMPILER_SERVER_SERVICE_DIR_PATH / 'cpp_source_files' 
GUIDED_TUTORIALS_DIR_PATH = CPP_SOURCE_FILES_DIR_PATH / 'guided_tutorials'
CPP_HEADER_FILES_SOURCE_DIR = CPP_SOURCE_FILES_DIR_PATH / 'header_files'

def create_directory_ifnotexist(path: Path):
    if not path.is_dir():
        path.mkdir()
        log.info(f'created file directory {path}')
        return True
    return True

def check_path_exists(*args: Path, is_file=None, is_dir=None):
    if not (is_file or is_dir) or (is_file and is_dir): raise ValueError("Indicate whether checking for either the path of a file or a directory")
    pathtype = 'file' if is_file else 'directory'
    
    for path in args:
        if not isinstance(path, Path): path = Path(str(path))
        if (is_dir and not path.is_dir()) or (is_file and not path.is_file()):
            log.error(f"Checked for the existence of {pathtype} at {path} but {pathtype} does not exist at that path")
            return False

    return True

def safe_get(l: list, index:int):
    try:
        return l[index]
    except IndexError:
        return None
    
def get_named_capture_group(regex:str, s:str):
    return safe_get([m.groupdict() for m in re.finditer(regex, s)], 0)