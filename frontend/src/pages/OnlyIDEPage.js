import React from "react";

import { AppBar, Box, Stack, Grid } from '@mui/material';

import CodeEditor from "../components/Editor";
import TopNavBar from "../components/Nav";

import './TutorialPage.css';


export default function IDEPage(){
    return <>
        <TopNavBar></TopNavBar>
        <CodeEditor/>
    </>
}