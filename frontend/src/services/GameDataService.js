import SETTINGS from "./settings"
import UserDataFetch from "./UserService";

class GameDataService {
    static HOST_URL = SETTINGS.HOST_URL;

    // creates a websocket connection to the backend CodingConnundrum endpoint
    static startConnection(handleFunc) {
        // let url = `${this.HOST_URL.replace("http", "ws")}games/start`
        let url = 'ws://localhost:8080/games/codingconundrum'
        let ws = new WebSocket(url)
        ws.onmessage = handleFunc;
        return ws;
    }

    // static async getPrompt() {
    //     let url = `${this.HOST_URL}terminator/generate`
    //     let response = await fetch(url,
    //         {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         });

    //     if (response.status !== 200) {
    //         console.warn('failed to get prompt from chatgpt backend')
    //         return ""
    //     }

    //     let data = await response.json();

    //     if (data['errors']) {
    //         console.warn(`error message while getting prompt ${data['errors']}`)
    //     }
    //     return data['message'];
    // }

}

export {
    GameDataService
}