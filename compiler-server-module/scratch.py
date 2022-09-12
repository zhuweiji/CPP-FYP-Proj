from pathlib import Path
import tempfile

import logging
logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)


def f(*args):
    print(f"{args}")
    
f(1,2,3)