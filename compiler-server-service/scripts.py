import logging
import subprocess

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

def start_process(*args):
    try:
        subprocess.run([*args])
    except KeyboardInterrupt:
        log.info("Keyboard Interrupt: Halting Program.")

def start():
    start_process(*['uvicorn', 'main:app', '--port' ,'8080', '--host', '0.0.0.0'])

def startreload():
    start_process(*['uvicorn', 'main:app', '--port' ,'8080', '--host', '0.0.0.0', '--reload'])
    

def test():
    start_process(*['pytest'])
    
def healthcheck():
    start_process(*[['curl', '--fail', 'http://localhost:8080', '||', 'exit 1']])