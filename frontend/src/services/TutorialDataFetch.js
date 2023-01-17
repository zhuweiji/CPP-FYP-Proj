import SETTINGS from "./settings"


export default class TutorialDataFetch{
    static HOST_URL = SETTINGS.HOST_URL;

    static async getLeftbarTextInformation(tutorialId) {
        console.log(`${this.HOST_URL}tutorials/leftpane_instructions?tutorialId=${tutorialId}`)
        try {
            let result = await fetch(`${this.HOST_URL}tutorials/leftpane_instructions?tutorialId=${tutorialId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            console.log(`result in service ${result.status}`)

            return result.text();
        
        } catch (error) {
            console.log("Error when sending code for compilation")
            console.error(error);
        }
    }


}