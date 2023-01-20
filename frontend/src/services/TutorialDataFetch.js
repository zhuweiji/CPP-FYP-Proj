import SETTINGS from "./settings"

import UserDataFetch from "./UserService";

export default class TutorialDataFetch{
    static HOST_URL = SETTINGS.HOST_URL;


    static async getTutorialInformation(topicId, tutorialId){
    // fetches the previous and next tutorials, user data (completed tutorial?), and possibly metrics 

        let user_id = UserDataFetch.getUserId();

        try {
            let result = await fetch(`${this.HOST_URL}tutorials/tutorial?topicId=${topicId}&tutorialId=${tutorialId}$user_id=${user_id}`,
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


}