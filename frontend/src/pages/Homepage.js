import React, { useState, useRef } from "react";
import ButtonAppBar from "../components/Nav";

import coding_image from '../static/coding_image.jpg'

import { red, blue, green, blueGrey } from '@mui/material/colors';
import { Typography, Box, Grid, Container } from '@mui/material';

import './Homepage.css'


export default function Homepage(props) {
    return (
        <>
            <ButtonAppBar></ButtonAppBar>
            <Grid container spacing={1} style={{ minHeight: '100vh', backgroundColor: blueGrey[900]}}>
                <Grid item xs={4}>
                    <div className="columnOne" onClick={()=>alert('hello!')}>
                        <Typography variant="h2" >Guided Tutorials</Typography>
                    </div>

                </Grid>

                <Grid item xs={4} >
                    <div className="columnTwo">
                        <Container>
                            <Typography variant="h2">Interactive Games</Typography>
                        </Container>
                    </div>
                </Grid>

                <Grid item xs={4} >
                    <div className="columnThree">
                        <Container>
                            <Typography variant="h2">C++ Online IDE</Typography>
                        </Container>

                    </div>

                </Grid>
            </Grid>

        </>
    )
}