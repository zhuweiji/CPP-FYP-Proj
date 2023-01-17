import React, { useEffect, useState } from "react";

import { AppBar, Box, Stack, Grid } from '@mui/material';

import CodeEditor from "../components/Editor";
import TopNavBar from "../components/Nav";
// import BottomAppBar from "../components/EditorBottomAppBar";

import './TutorialPage.css';

import example from "../components/exampleDiagram";
import MermaidDiagram from "../components/MermaidDiagram";

import SchemaTwoToneIcon from '@mui/icons-material/SchemaTwoTone';
import TerminalTwoToneIcon from '@mui/icons-material/TerminalTwoTone';
import TextSnippetTwoToneIcon from '@mui/icons-material/TextSnippetTwoTone';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';

import { blueGrey } from '@mui/material/colors';
import TutorialDataFetch from "../services/TutorialDataFetch";

function App(props) {

  const [leftPaneInstructions, setLeftPaneInstructions] = useState("");

  useEffect(() => {
    async function IIFE(){
      let leftPaneData = await TutorialDataFetch.getLeftbarTextInformation(1);
      leftPaneData = leftPaneData.replaceAll("\\n", "\n");
      leftPaneData = leftPaneData.replaceAll('"', "");
      console.log(leftPaneData)
      setLeftPaneInstructions(leftPaneData);
    }
    IIFE();
  }, [])

  return (
    <div>
      <TopNavBar></TopNavBar>

      <Grid container spacing={1} className='TutorialPage' >
        <Grid item xs={4} id='leftGrid'>

          <Stack direction="column" backgroundColor={blueGrey[900]} justifyContent="end" sx={{display:'flex'}} >
            <div id="mermaidDiagramObj">
              <MermaidDiagram chart={example} />
            </div>

              <div id="instructionPage">
                {leftPaneInstructions}
              </div>
          </Stack>

        </Grid>

        <Grid item xs={8}>
          <CodeEditor />
        </Grid>

      </Grid>

      <BottomAppBar></BottomAppBar>

    </div>
  );
}

function BottomAppBar() {

  function toggleMermaidDiagram() {
    let id = 'mermaidDiagramObj'

    const divObj = document.getElementById(id)
    const otherPage = document.getElementById('instructionPage') 
    
    let currentDisplayValue = divObj.style.display
    
    if (currentDisplayValue === 'none'){
      divObj.style.display = 'block'
      otherPage.style.height = '60vh'
    } else{
      divObj.style.display = 'none'
      otherPage.style.height = '90vh'
    }
  }

  function toggleLeftGrid(){
    // TODO: when hididng the left grid, the editor takes up the entire screen, but upon unhiding the editor does not revert to original size
    // maybe have to use base flexbox?
    let id = 'leftGrid'
    const divObj = document.getElementById(id)
    let currentDisplayValue = divObj.style.display
    
    if (currentDisplayValue === 'none') {
      divObj.style.display = 'block'
    } else {
      divObj.style.display = 'none'
    }
  }

  return (
    <React.Fragment>
      <CssBaseline />

      <AppBar position="fixed" sx={{ top: 'auto', bottom: 0, height: '3rem', alignContent: 'center', backgroundColor: blueGrey[50] }}>
        <Toolbar>
          <IconButton size='small' color="inherit" onClick={toggleMermaidDiagram}>
            <SchemaTwoToneIcon sx={{ color: blueGrey[900] }} />
          </IconButton>

          <IconButton size='small' color="inherit" onClick={toggleLeftGrid} disabled>
            <TextSnippetTwoToneIcon sx={{ color: blueGrey[900] }} />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton size='small' color="inherit" disabled>
            <TerminalTwoToneIcon sx={{ color: blueGrey[900] }} />
          </IconButton>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

export default App;
