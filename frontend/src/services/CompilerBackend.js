class CompilerService {
    static HOST_URL = "localhost:8080"

    static async compile_and_run(codeString) {
        const data = {
            'code': codeString
        }

        try {
            let result = await fetch('http://localhost:8080/cpp/compile_and_run',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })
            console.log(`result in service ${result.status}`)
            return result;
        } catch (error) {
            console.log("Error when sending code for compilation")
            console.error(error);
        }
    }

    static async check_connection() {
        try {
            let result = await fetch('http://localhost:8080/cpp/',
                {
                    method: 'GET',
                })
            // TODO: if server includes status in the get method, can check the status here
            return this.probeResponse.ok;
        } catch (error) {
            console.error(`Encountered error while checking connection to compiler server: ${error}`);
            return this.probeResponse.error;
        }
    }

    static probeResponse = {
        'error': -1,
        'ok': 1,
        'throttled': 3,
    }
}

export default CompilerService;