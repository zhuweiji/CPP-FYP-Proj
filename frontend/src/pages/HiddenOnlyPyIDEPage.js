import React from "react";

import { AppBar, Box, Stack, Grid } from '@mui/material';

import PyCodeEditor from "../components/PyEditor";
import TopNavBar from "../components/Nav";

import './TutorialPage.css';


export default function PyIDEPage() {
    return <>
        <TopNavBar></TopNavBar>
        <PyCodeEditor />
    </>
}