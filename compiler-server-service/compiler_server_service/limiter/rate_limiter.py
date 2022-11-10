import logging
logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from slowapi import Limiter
from slowapi.util import get_remote_address

limiterobj = Limiter(key_func=get_remote_address)
