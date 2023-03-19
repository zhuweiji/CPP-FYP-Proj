import logging
import subprocess

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

def start_process(command):
    try:
        subprocess.run([*command.split(' ')])
    except KeyboardInterrupt:
        log.info("Keyboard Interrupt: Halting Program.")
        

PORT = 8081

def start():
    start_process(f'uvicorn main:app --port {PORT} --host 0.0.0.0')

def startreload():
    start_process(f'uvicorn main:app --port {PORT} --host 0.0.0.0')
    
def startssl():
    start_process(f'uvicorn main:app --port {PORT} --host 0.0.0.0 --ssl-keyfile=./key.pem --ssl-certfile=./cert.pem')

def test():
    start_process('pytest')
    
def healthcheck():
    start_process(f'curl --fail https://localhost:{PORT} || exit 1')