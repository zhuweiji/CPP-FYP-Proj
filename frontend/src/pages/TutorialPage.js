import React, { useEffect, useState } from "react";

import { AppBar, Box, Stack, Grid } from '@mui/material';

import CodeEditor from "../components/Editor";
import TopNavBar from "../components/Nav";
// import BottomAppBar from "../components/EditorBottomAppBar";
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize' 

import './TutorialPage.css';

import example from "../components/exampleDiagram";
import MermaidDiagram from "../components/MermaidDiagram";

import SchemaTwoToneIcon from '@mui/icons-material/SchemaTwoTone';
import TerminalTwoToneIcon from '@mui/icons-material/TerminalTwoTone';
import TextSnippetTwoToneIcon from '@mui/icons-material/TextSnippetTwoTone';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';

import {Toolbar, Button} from '@mui/material';

import { blueGrey } from '@mui/material/colors';
import TutorialDataFetch from "../services/TutorialDataFetch";

import { matchRoutes, useLocation } from "react-router-dom"
import Overlay from "../components/Overlay";


function App(props) {

    const [leftPaneInstructions, setLeftPaneInstructions] = useState("");
    const [gradingPassed, setGradingPassed] = useState(false);

    // get the path of this page (to get the tutorialId of the page)
    const routeRegex = '/tutorial/(?<topicId>[0-9]+)/(?<tutorialId>[0-9]+)'

    let tutorialId = useLocation().pathname.match(routeRegex).groups['tutorialId']
    if (!tutorialId) console.error('tutorialId of this page could not be found!')

    let topicId = useLocation().pathname.match(routeRegex).groups['topicId']
    if (!topicId) console.error('topicId of this page could not be found!')

    useEffect(() => {
        async function IIFE() {
            let leftPaneData = await TutorialDataFetch.getLeftbarTextInformation(topicId, tutorialId);
            leftPaneData = leftPaneData.replaceAll("\\n", "\n");
            leftPaneData = leftPaneData.replaceAll('"', "");
            setLeftPaneInstructions(leftPaneData);
        }
        
        IIFE();
    }, [])

    const { windowWidth, windowHeight } = useWindowSize()

    // TODO fill in
    function getNextTutorialHref(){
        return `/tutorial/${topicId}/${Number(tutorialId) + 1}`;
    }

    return (
        <div>
            <TopNavBar></TopNavBar>

            {/* <Overlay /> */}
            {gradingPassed && <Overlay/> }

            {/* single use whole-screen confetti display */}
            <Confetti
                width={windowWidth}
                height={windowHeight}
                numberOfPieces={200}
                recycle={false}
                run={gradingPassed}
            />

            <Grid container spacing={1} className='TutorialPage' >
                <Grid item xs={4} id='leftGrid'>

                    <Stack direction="column" backgroundColor={blueGrey[900]} justifyContent="end" sx={{ display: 'flex' }} >
                        <div id="mermaidDiagramObj">
                            <MermaidDiagram chart={example} />
                        </div>

                        <div id="instructionPage">
                            {leftPaneInstructions}
                        </div>
                    </Stack>

                </Grid>

                <Grid item xs={8}>
                    {!gradingPassed &&
                        <CodeEditor topicId={topicId} tutorialId={tutorialId} updateGradingToPassed={() => { setGradingPassed(true); }} />
                    }
                    {gradingPassed &&

                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                            <Button variant="contained" href={getNextTutorialHref()}>Next page</Button>
                    </Box>
                        
                    }
                    
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

        if (currentDisplayValue === 'none') {
            divObj.style.display = 'block'
            otherPage.style.height = '60vh'
        } else {
            divObj.style.display = 'none'
            otherPage.style.height = '90vh'
        }
    }

    function toggleLeftGrid() {
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
