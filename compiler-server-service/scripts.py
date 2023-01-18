import subprocess


def start():
    subprocess.run(['uvicorn', 'main:app', '--port' ,'8080', '--host', '0.0.0.0'])

def startreload():
    subprocess.run(['uvicorn', 'main:app', '--port' ,'8080', '--host', '0.0.0.0', '--reload'])
    

def test():
    subprocess.run(["pytest"])
    
def healthcheck():
    subprocess.run(['curl', '--fail', 'http://localhost:8080', '||', 'exit 1'])