e.NamedTemporaryFile(suffix='.cpp', dir=s, delete=False) as temp_file:
        temp_file.write(b'hello')
    
    print(d.exis