import React, { useState, useRef } from "react";

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid'; // Grid version 2
import { Box, Container } from '@mui/material'

import CodeEditor from "../components/Editor";
import ButtonAppBar from "../components/Nav";
import './TutorialPage.css';

import MermaidDiagram from "../components/MermaidDiagram";
import example from "../components/example";

function App(props) {

  return (
    <div className="App">
      <ButtonAppBar></ButtonAppBar>

      <br /><br /><br />
      <br />


      <Grid container spacing={1}>

        <Grid item xs={4}>
          <MermaidDiagram chart={example} />
          <Box id="instructionPage" 
          sx={{
            height: "50vh",
            "background-color":"#6B2F6C",
            color: 'aliceblue',
            padding: "5%",
            overflowY: "scroll",
            scrollbarWidth: "thin",
            textAlign: 'center',
            fontFamily: "Open Sans",
          }}
          >
            <div className="instructionsDiv">
              <p>Hello</p>
              <br/>
              <p>Welcome to Comprehend C++</p>
              <p>In this section we will try to create log hello world into the console.</p>
              <p>Proident nisi proident dolore eiusmod non tempor quis est dolor amet ullamco ipsum reprehenderit ex. Esse in culpa amet veniam elit ea in nostrud pariatur sit id non aute reprehenderit. Voluptate tempor culpa voluptate exercitation id.</p>

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
