import logging
from pathlib import Path
import tempfile

from src.utilities import CPP_TEST_SOURCE_DIRPATH
logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from src.cpp_compiler_module.cpp_compiler import CPPCompiler

with tempfile.TemporaryDirectory(dir=CPP_TEST_SOURCE_DIRPATH) as t:
    print(type(t))
    print(str(t))
    d = Path(str(t))
    print(Path(str(t)).is_dir())
    print(d.exists())
    
    
with CPPCompiler.create_temp_dir() as t:
    print(t)
    with tempfile.NamedTemporaryFile(suffix='.cpp', dir=t, delete=False) as temp_file:
        temp_file.write(b'hello')
        print(Path(temp_file.name).exists())
    
    print(t.exists())
print(t.exists())

    
    