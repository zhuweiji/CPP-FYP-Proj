import { Box, Container, Stack, Typography, Grid, Button, LinearProgress } from "@mui/material"

import React, { useState, useRef, useEffect } from "react";
import LinearProgressWithLabel from "../components/LinearProgressBar__Labelled";
import { red, pink, purple, deepPurple, blue } from '@mui/material/colors';

import CodeEditor from "../components/Editor";
import ResponsiveAppBar from "../components/Nav";

export default (props) => {
    
    const randomElement = (array) => array[Math.floor(Math.random() * array.length)];

    const possible_questions = [
        'Complete the function to reverse a string',
        'Complete the function get all matching characters in a string',
        'Complete the function to reverse a given array',
        "Create a class named Car with the following specifications:\nAn instance variable named velocity to represent the car's velocity,\nAn instance variable named acceleration to represent the car's acceleration",
    ]
    const [currentQuestion, setCurrentQuestion] = useState(randomElement(possible_questions))

    const [thisplayerProgress, setThisplayerProgress] = useState(0);
    const [player1Progress, setPlayer1Progress] = useState(0);
    const [player2Progress, setPlayer2Progress] = useState(0);
    const [player3Progress, setPlayer3Progress] = useState(0);


    React.useEffect(() => {
        const timer = setInterval(() => {
            setPlayer1Progress((oldProgress) => {
                if (oldProgress === 100) {
                    return 0;
                }
                const diff = Math.random() * 10;
                return Math.min(oldProgress + diff, 100);
            });
        }, 1500);

        return () => {
            clearInterval(timer);
        };
    }, []);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setPlayer2Progress((oldProgress) => {
                if (oldProgress === 100) {
                    return 0;
                }
                const diff = Math.random() * 10;
                return Math.min(oldProgress + diff, 100);
            });
        }, 2000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setPlayer3Progress((oldProgress) => {
                if (oldProgress === 100) {
                    return 0;
                }
                const diff = Math.random() * 10;
                return Math.min(oldProgress + diff, 100);
            });
        }, 1900);

        return () => {
            clearInterval(timer);
        };
    }, []);



    return <>
        <ResponsiveAppBar></ResponsiveAppBar>

        <Grid
            container
            direction="row"
            height='80vh'
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        >
            <Grid item xs>
                <Stack
                    direction="column"
                    // alignItems="center"
                >
                <Typography mt='3rem' variant='h4' sx={{ color: 'white', backgroundColor: 'black', textAlign: 'center' }}>Complete the following functionality to pass</Typography>
                <Typography mt='1rem' variant='p' sx={{ color: 'white', backgroundColor: 'black', textAlign: 'center' }}>{currentQuestion}</Typography>

                <Typography mt='20%' variant='p' sx={{ color: 'white', backgroundColor: blue[300], textAlign: 'center' }}>Your progress</Typography>
                <LinearProgress variant="determinate" value={thisplayerProgress}></LinearProgress>

                <Typography mt='20%' variant='p' sx={{ color: 'white', backgroundColor: red[300], textAlign: 'center' }}>Player 1</Typography>
                <LinearProgress variant="determinate" value={player1Progress}></LinearProgress>

                <Typography mt='1rem' variant='p' sx={{ color: 'white', backgroundColor: pink[300], textAlign: 'center' }}>Player 2</Typography>
                <LinearProgress variant="determinate" value={player2Progress}></LinearProgress>

                <Typography mt='1rem' variant='p' sx={{ color: 'white', backgroundColor: purple[300], textAlign: 'center' }}>Player 3</Typography>
                <LinearProgress variant="determinate" value={player3Progress}></LinearProgress>
                </Stack>

            </Grid>

            <Grid item xs>

                <Stack
                    direction="column"
                    // alignItems="center"
                    justifyContent="flex-start"
                >

                    <CodeEditor></CodeEditor>
                
                </Stack>

                
                
            </Grid>


        </Grid>

    </>
}