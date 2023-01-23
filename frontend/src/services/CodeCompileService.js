import SETTINGS from "./settings"
import UserDataFetch from "./UserService";

const CompileResultStatuses = {
    THROTTLED: -1,
    SUCCESS: 1,
    PASSED_GRADING: 10,
}

class CompileResult {
    constructor(status, message, errors) {
        this.status = status;
        this.message = message;
        this.errors = errors;
    }
}

class CodeCompileService {
    static HOST_URL = SETTINGS.HOST_URL;

    static async compile_and_run(codeString) {
        const data = {
            'code': codeString,
            'user_id': UserDataFetch.getUserId(),
        }

        let result = new CompileResult();

        try {
            let backendResult = await fetch(`${this.HOST_URL}cpp/compile_and_run`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })
            backendResult = await backendResult.json();
            result.message = backendResult.message;
            if (backendResult.status === 200){
                result.status = CompileResultStatuses.SUCCESS
            } else if (backendResult.status === 429) {
                result.status = CompileResultStatuses.THROTTLED;
            } else if (backendResult.status === 500){
                result.errors = backendResult.errors
            }

            return result;

        } catch (error) {
            console.log("Error when sending code for compilation")
            console.error(error);
        }
    }

    static async grade_code(codeString, topicId, tutorialId) {
        const data = {
            'topicId': topicId,
            'tutorialId': tutorialId,
            'code': codeString,
            'user_id': UserDataFetch.getUserId(),
            
        }

        let result = new CompileResult();

        try {
            let backendResult = await fetch(`${this.HOST_URL}cpp/grade_code`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })
            backendResult = await backendResult.json();
            result.message = backendResult.message;
            if (backendResult.status === 200) {
                result.status = CompileResultStatuses.SUCCESS
            } else if (backendResult.status === 429) {
                result.status = CompileResultStatuses.THROTTLED;
            } else if (backendResult.status === 201) {
                result.status = CompileResultStatuses.PASSED_GRADING;
            } else if (backendResult.status === 500) {
                result.errors = backendResult.errors
            }
            return result;


        } catch (error) {
            console.log("Error when sending code for compilation")
            console.error(error);
        }
    }

    static async check_connection() {
        try {
            let result = await fetch(`${this.HOST_URL}cpp/`,
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

export {
    CodeCompileService,
    CompileResultStatuses,
    CompileResult,
} ;