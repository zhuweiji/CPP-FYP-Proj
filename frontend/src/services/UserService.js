import SETTINGS from "./settings"


export default class UserDataService {
    static HOST_URL = SETTINGS.HOST_URL + SETTINGS.COMPILER_SERVICE_PORT;

    static async login(username) {
        const data = {
            'username': username
        }
        try {
            let result = await fetch(`${this.HOST_URL}users/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })

            if (result.status === 404) {
                return false;
            }
            return result.json();

        } catch (error) {
            console.error(error);
        }
    }

    static async create_account(username) {
        const data = {
            'username': username
        }
        try {
            let result = await fetch(`${this.HOST_URL}users/create`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })

            if (result.status === 201) {
                return result.json();
            } else if (result.status === 409) {
                return { 'error': 'username already exists' };
            } else {
                return false;
            }

        } catch (error) {
            console.error(error);
        }
    }

    // static async getUserInfo(userid) {
    //     try {
    //         let result = await fetch(`${this.HOST_URL}user/${userid}`,
    //             {
    //                 method: 'GET',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //             })

    //         return result.json();

    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    // static async setUserInfo() {
    //     const data = {

    //     }
    //     try {

    //         let result = await fetch(`${this.HOST_URL}user`,
    //             {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify(data)
    //             })

    //         return result.json();

    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    static setUserDataValue(k, v) {
        return localStorage.setItem(k, v) || null;
    }

    static getUserDataValue(k) {
        return localStorage.getItem(k) || null;
    }

    static getUserId() {
        return localStorage.getItem('userid') || -1;
    }

    static setUserId(value) {
        return localStorage.setItem('userid', value);

    }

    static getUserName() {
        return localStorage.getItem('username') || '';
    }

    static setUserName(value) {
        return localStorage.setItem('username', value);

    }

    static logout() {
        localStorage.removeItem('username');
        localStorage.removeItem('userid');
    }

}
