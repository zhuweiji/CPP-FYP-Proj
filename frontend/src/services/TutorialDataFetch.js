import SETTINGS from "./settings"

import UserService from "./UserService";

export default class TutorialDataFetch{
    static HOST_URL = SETTINGS.HOST_URL;


    static async getTutorialInformation(topicId, tutorialId){
    // fetches the previous and next tutorials, user data (completed tutorial?), and possibly metrics 

        let url = `${this.HOST_URL}tutorials/tutorial?topicId=${topicId}&tutorialId=${tutorialId}`
        let user_id = UserService.getUserId();
        if (user_id){
            url = url + `&user_id=${user_id}`
        }

        try {
            let result = await fetch(`${url}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            console.log(`result in service ${result.status}`)

            return result.json();

        } catch (error) {
            console.log("Error when sending code for compilation")
            console.error(error);
        }

    }

    static async getTutorials(){
        let url = `${this.HOST_URL}tutorials/tutorials`
        let user_id = UserService.getUserId();
        if (user_id) {
            url = url + `?user_id=${user_id}`
        }
        try {
            let result = await fetch(`${url}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            return result.json();

        } catch (error) {
            console.log("Error when sending code for compilation")
            console.error(error);
        }
    }


}