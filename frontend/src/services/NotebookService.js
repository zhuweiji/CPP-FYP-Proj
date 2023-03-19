import { Typography } from "@mui/material";
import SETTINGS from "./settings"


export class NotebookService {
    static HOST_URL = SETTINGS.HOST_URL + SETTINGS.COMPILER_SERVICE_PORT;

    // static cache = new Map();

    // static cacheLookup(notebookId) {
    //     if (this.cache.has(notebookId)) {
    //         return this.cache.get(notebookId)
    //     }
    //     return false;
    // }

    // static cacheStore(notebookId, data) {
    //     this.cache.set(notebookId, data);
    // }

    static async getNotebook(id) {
        // let cacheResult = this.cacheLookup(id);
        // if (cacheResult) return cacheResult;

        let url = `${this.HOST_URL}notebooks/${id}`
        let response = await fetch(url,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

        if (response.status !== 200) {
            if (response.status === 404) {
                return false
            }
            return false
        }

        let data = await response.json();
        if (data.errors) {
            console.log('data.errors = ', data.errors)
        }


        // this.cacheStore(id, data);
        return data.message;

    }

}