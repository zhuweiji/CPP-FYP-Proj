import SETTINGS from "./settings"
import UserDataFetch from "./UserService";

class GameDataService {
    static HOST_URL = SETTINGS.HOST_URL;

    static async getPrompt() {
        let url = `${this.HOST_URL}terminator/generate`
        let response = await fetch(url,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

        if (response.status !== 200) {
            console.warn('failed to get prompt from chatgpt backend')
            return ""
        }

        let data = await response.json();

        if (data['errors']) {
            console.warn(`error message while getting prompt ${data['errors']}`)
        }
        return data['message'];
    }

}

export {
    GameDataService
}