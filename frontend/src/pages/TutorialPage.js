import React, { useState, useRef } from "react";

import Grid from '@mui/material/Grid'; 
import { Box, Container, Fab, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';


import CodeEditor from "../components/Editor";
import ButtonAppBar from "../components/Nav";
import './TutorialPage.css';

import MermaidDiagram from "../components/MermaidDiagram";
import example from "../components/example";

function App(props) {

  return (
    <div>
      <ButtonAppBar></ButtonAppBar>
      
      <Grid container spacing={1} className='TutorialPage'>
        <Grid item xs={4}>
          <MermaidDiagram chart={example} />
          <Box id="instructionPage" 
          sx={{
            height: "50vh",
            "backgroundColor":"#6B2F6C",
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
