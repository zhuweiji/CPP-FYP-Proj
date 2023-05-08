import SETTINGS from "./settings"
import UserDataFetch from "./UserService";

const CompileResultStatuses = {
    THROTTLED: -1,
    ERROR: 0,
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

class PyCodeCompileService {
    static COMPILER_SERVICE_URL = SETTINGS.HOST_URL + SETTINGS.COMPILER_SERVICE_PORT;
    static GAME_SERVICE_URL = SETTINGS.HOST_URL + SETTINGS.GAME_SERVICE_PORT;

    static lastConnectionCheckTime;
    static lastConnectionCheckResult;

    static async run(allCode) {
        let url = `${this.COMPILER_SERVICE_URL}py/run`

        const data = {
            'all_code': allCode,
            'user_id': UserDataFetch.getUserId(),
        }

        let result = new CompileResult();
        try {
            let backendResult = await fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })
            if (backendResult.status === 200) {
                result.status = CompileResultStatuses.SUCCESS
            } else if (backendResult.status === 429) {
                result.status = CompileResultStatuses.THROTTLED;
            } else if (backendResult.status === 500) {
                result.status = CompileResultStatuses.ERROR;
                result.errors = backendResult.errors
            }
            backendResult = await backendResult.json();
            result.message = backendResult.message;


            return result;

        } catch (error) {
            console.log("Error when sending code for compilation")
            console.error(error);
        }
    }

    static async check_connection() {
        const currentTimeInSeconds = () => new Date().getTime() / 1000;

        if (this.lastConnectionCheckTime && this.lastConnectionCheckResult &&
            currentTimeInSeconds() - this.lastConnectionCheckTime < 5) {
            return this.lastConnectionCheckResult;
        }


        this.lastConnectionCheckResult = this.__check_connection();
        this.lastConnectionCheckTime = currentTimeInSeconds();
        return this.lastConnectionCheckResult;
    }

    static async __check_connection() {
        try {
            let result = await fetch(`${this.COMPILER_SERVICE_URL}py/`,
                {
                    method: 'GET',
                })
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
    PyCodeCompileService,
    CompileResultStatuses,
    CompileResult,
};