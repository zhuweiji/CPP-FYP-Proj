import { Typography } from "@mui/material";
import SETTINGS from "./settings"


export class NotebookService{
    static HOST_URL = SETTINGS.HOST_URL;


    static async getNotebook(id) {
        let url = `${this.HOST_URL}notebooks/${id}`
        let response = await fetch(url,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

        if (response.status !== 200) {
            if (response.status === 404){
                return false
            }
            return false
        }

        let data = await response.json();
        if (data.errors){
            console.log('data.errors = ', data.errors)
        }   
        return data.message;

    }

}