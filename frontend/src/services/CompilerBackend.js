

class CompilerService{
    static HOST_URL = "localhost:8080"

    static async compile_and_run(codeString){
        
        const data = {
            'code': codeString
        }

        try{
            let result = await fetch('http://localhost:8080/cpp/compile_and_run',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })
            
            return result;
        } catch{
            
        }
    }
}

export default CompilerService;