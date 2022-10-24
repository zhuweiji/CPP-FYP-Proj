import React, { useState, useRef } from "react";

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid'; // Grid version 2

import CodeEditor from "./components/Editor";
import ButtonAppBar from "./components/Nav";
import './App.css';



function App() {
  return (
    <div className="App">
      <ButtonAppBar></ButtonAppBar>

      <br /><br /><br />

      <Grid container spacing={2}>

        <Grid item xs={4}>
          <p>Hello</p>
        </Grid>
        
        <Grid item xs={8}>
          <CodeEditor />
        </Grid>

      </Grid>

    </div>
  );
}

export default App;
