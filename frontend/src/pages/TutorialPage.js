import React, { useState, useRef } from "react";

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid'; // Grid version 2
import { Box, Container } from '@mui/material'

import CodeEditor from "../components/Editor";
import ButtonAppBar from "../components/Nav";
import './TutorialPage.css';

import MermaidDiagram from "../components/MermaidDiagram";
import example from "../components/example";

function App() {

  return (
    <div className="App">
      <ButtonAppBar></ButtonAppBar>

      <br /><br /><br />
      <br />


      <Grid container spacing={1}>

        <Grid item xs={4}>
          <Box id="instructionPage" sx={{
            height: "90vh",
          }}>
            <MermaidDiagram chart={example} />


            <div className="instructionsDiv">
              <p>Hello</p>
              <br/>
              <p>Welcome to Comprehend C++</p>
              <p>In this section we will try to create log hello world into the console.</p>
            </div>
              
          </Box>
        </Grid>

        <Grid item xs={8}>
          <CodeEditor />
        </Grid>

      </Grid>

    </div>
  );
}

export default App;
