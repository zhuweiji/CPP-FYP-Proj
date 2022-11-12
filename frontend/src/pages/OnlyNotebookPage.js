import Notebook from "../components/Notebook";

import React from "react";

import { AppBar, Box, Stack, Grid } from '@mui/material';
import TopNavBar from "../components/Nav";

import './TutorialPage.css';


export default function NotebookPage() {
    return <>
        <TopNavBar></TopNavBar>
        <Notebook />
    </>
}