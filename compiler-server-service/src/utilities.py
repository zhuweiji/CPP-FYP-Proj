from pathlib import Path
import logging
import re

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

# service level paths (compiler-server-service) 
SOURCE_DIRPATH = Path(__file__).parent
SERVICE_DIRPATH = SOURCE_DIRPATH.parent

# project level paths (fyp)
CPP_SOURCE_DIRPATH = SERVICE_DIRPATH / 'data' / 'simple-cpp-module' / 'src'
CPP_TEST_SOURCE_DIRPATH = CPP_SOURCE_DIRPATH / 'tests_for_students'


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