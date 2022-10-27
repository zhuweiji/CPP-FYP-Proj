import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

import ButtonAppBar from "../components/Nav";

import { red, blue, green, blueGrey } from '@mui/material/colors';
import { Typography, Box, Grid, Container} from '@mui/material';

import './Homepage.css'


export default function Homepage(props) {
    const navigate = useNavigate();
    const redirectToTutorialList = useCallback(() => navigate('/tutorials', { replace: false }), [navigate]);
    const redirectToGamesPage = useCallback(() => navigate('/games', { replace: false }), [navigate]);
    const redirectToIDE = useCallback(() => navigate('/ide', { replace: false }), [navigate]);

    return (
        <Box component='div'>
            <ButtonAppBar></ButtonAppBar>
            <Grid container spacing={1} style={{ backgroundColor: blueGrey[900], minHeight: '100vh', }}>
                <Grid item xs={4}>
                    <div className="columnOne" onClick={redirectToTutorialList}>
                        <Typography variant="h2" >Guided Tutorials</Typography>
                    </div>

                </Grid>

                <Grid item xs={4} >
                    <div className="columnTwo" onClick={redirectToGamesPage}>
                        <Container>
                            <Typography variant="h2">Interactive Games</Typography>
                        </Container>
                    </div>
                </Grid>

                <Grid item xs={4} >
                    <div className="columnThree" onClick={redirectToIDE}>
                        <Container>
                            <Typography variant="h2">C++ Online IDE</Typography>
                        </Container>

                    </div>

                </Grid>
            </Grid>
        </Box>
    )
}