import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

import ButtonAppBar from "../components/Nav";

import { red, blue, green, blueGrey } from '@mui/material/colors';
import { Typography, Box, Grid, Container } from '@mui/material';

import './Homepage.css'


export default function Homepage(props) {
    const navigate = useNavigate();
    const redirectToTutorialList = useCallback(() => navigate('/tutorials', { replace: false }), [navigate]);
    const redirectToGamesPage = useCallback(() => navigate('/games', { replace: false }), [navigate]);
    const redirectToIDE = useCallback(() => navigate('/ide', { replace: false }), [navigate]);

    return (
        <Box component='div'>
            <ButtonAppBar hideLinks={true}></ButtonAppBar>
            <Grid container spacing={1}  style={{ backgroundColor: blueGrey[900], height: '100vh', }}>
                <Grid item md={4}>
                    <div className="columnOne" onClick={redirectToTutorialList}>
                        <Grid
                            container
                            direction="column"
                            alignItems="center"
                            rowSpacing={5}
                            sx={{padding:"2rem"}}
                        >
                            <Grid item>
                                <Typography variant="h2" >Guided Tutorials</Typography>

                            </Grid>
                            <Grid item>
                                <Typography variant="h6" className="subtext">Learn OOP in C++ step-by-step. Use notebook style editors and a full web GUI IDE (guide) to craft code from class diagrams and other specifications . </Typography>
                            </Grid>
                        </Grid>
                    </div>

                </Grid>

                <Grid item md={4} >
                    <div className="columnTwo" onClick={redirectToGamesPage}>
                        <Grid
                            container
                            direction="column"
                            alignItems="center"
                            rowSpacing={5}
                            sx={{ padding: "2rem" }}
                        >
                            <Grid item>
                                <Typography variant="h2">Interactive Games</Typography>

                            </Grid>
                            <Grid item>
                                <Typography variant="h6" className="subtext" >Compete with your friends, offline bots, or other people on the site to develop proficiency and speed. </Typography>
                            </Grid>
                        </Grid>
                    </div>
                </Grid>

                <Grid item md={4} >
                    <div className="columnThree" onClick={redirectToIDE}>
                        <Grid
                            container
                            direction="column"
                            alignItems="center"
                            rowSpacing={5}
                            sx={{ padding: "2rem" }}
                        >
                            <Grid item>
                                <Typography variant="h2">C++ Online IDE</Typography>

                            </Grid>
                            <Grid item>
                                <Typography variant="h6" className="subtext">Use our web IDE to run C++ code without the hassle of setting up a dev environment yourself.</Typography>
                            </Grid>
                        </Grid>
                    </div>

                </Grid>
            </Grid>
        </Box>
    )
}