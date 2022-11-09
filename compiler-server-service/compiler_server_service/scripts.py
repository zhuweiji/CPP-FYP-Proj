import subprocess

def start():
    subprocess.run(['uvicorn', 'main:app', '--port' ,'8080', '--host', '0.0.0.0'])

def test():
    subprocess.run(["pytest"])
    