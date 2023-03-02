import React, { useEffect, useState } from "react";

import { AppBar, Box, Stack, Grid } from '@mui/material';

import CodeEditor from "../components/Editor";
import TopNavBar from "../components/Nav";
// import BottomAppBar from "../components/EditorBottomAppBar";
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';


// import example from "../components/exampleDiagram";
import MermaidDiagram from "../components/MermaidDiagram";

import SchemaTwoToneIcon from '@mui/icons-material/SchemaTwoTone';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';


import { Toolbar, Button, Chip } from '@mui/material';

import { blueGrey } from '@mui/material/colors';
import TutorialDataFetch from "../services/TutorialDataFetch";

import { useLocation } from "react-router-dom";

import { useNavigate } from 'react-router-dom';
import Notebook from "../components/Notebook";



export default function TutorialPage(props) {
    const [gradingPassed, setGradingPassed] = useState(false);
    const [mermaidDiagram, setmermaidDiagram] = useState('')

    const [previousTutorialHref, setPreviousTutorialHref] = useState("");
    const [nextTutorialHref, setNextTutorialHref] = useState("");
    const [previousTutorialDisabled, setPreviousTutorialDisabled] = useState(false);
    const [nextTutorialDisabled, setNextTutorialDisabled] = useState(false);

    const [initialEditorData, setInitialEditorData] = useState(null);
    const [notebookName, setNotebookName] = useState('');


    const navigate = useNavigate();


    // can try using this instead (might be more concise)
    // https://stackoverflow.com/questions/35352638/how-to-get-parameter-value-from-query-string

    // get the path of this page (to get the tutorialId of the page)
    const routeRegex = '/tutorial/(?<topicId>[0-9]+)/(?<tutorialId>[0-9]+)'

    let tutorialId = useLocation().pathname.match(routeRegex).groups['tutorialId']
    if (!tutorialId) console.error('tutorialId of this page could not be found!')

    let topicId = useLocation().pathname.match(routeRegex).groups['topicId']
    if (!topicId) console.error('topicId of this page could not be found!')

    useEffect(() => {
        let tutorialData;
        async function fetchData() {
            tutorialData = await TutorialDataFetch.getTutorialInformation(topicId, tutorialId);

            setNotebookName(tutorialData['instruction_notebook_name']);

            if (typeof tutorialData.default_code === 'string') {
                setInitialEditorData({ 'main.cpp': tutorialData.default_code });
            } else {
                setInitialEditorData(tutorialData.default_code);
            }

            let [prevTopicId, prevTutorialId] = tutorialData['previous_tutorial_topicid_tutid']

            if (!prevTopicId && !prevTutorialId) {
                setPreviousTutorialDisabled(true);
            } else {
                setPreviousTutorialHref(`/notebook/${prevTopicId}/${prevTutorialId}`);
            }

            let [nextTopicId, nextTutorialId] = tutorialData['next_tutorial_topicid_tutid']

            if (!nextTopicId && !nextTutorialId) {
                setNextTutorialDisabled(true);
            } else {
                setNextTutorialHref(`/notebook/${nextTopicId}/${nextTutorialId}`);
            }

            if (tutorialData.no_tutorial === true) {
                navigate(`/notebook/${nextTopicId}/${nextTutorialId}`, { 'replace': true });
            }
        }

        fetchData();
    }, [topicId, tutorialId])

    const { windowWidth, windowHeight } = useWindowSize()

    function getPreviousTutorialHref() {
        return previousTutorialHref;
    }

    function getNextTutorialHref() {
        return nextTutorialHref;
    }

    return (
        <>

            <TopNavBar fixed></TopNavBar>

            {/* single use whole-screen confetti display */}
            <Confetti
                width={windowWidth}
                height={windowHeight}
                numberOfPieces={200}
                recycle={false}
                run={gradingPassed}
            />



            <Grid container >
                <Grid item xs={4} id='leftGrid'>

                    <Stack direction="column" backgroundColor='#fbf9f6'
                        sx={{ overflowY: 'auto', maxHeight: '100vh' }} >

                        {mermaidDiagram ? <div id="mermaidDiagramObj">
                            <MermaidDiagram chart={mermaidDiagram} />
                        </div> : null}

                        <Notebook name={`instructions${topicId}-${tutorialId}`} />

                    </Stack>

                </Grid>

                <Grid item xs={8} mt={8}>
                    {
                        initialEditorData && <CodeEditor topicId={topicId} tutorialId={tutorialId} files={initialEditorData}
                            includeGradeButton={true} updateGradingToPassed={() => { setGradingPassed(true); }} />
                    }

                </Grid>

            </Grid>

            <BottomAppBar
                getPreviousTutorialHref={getPreviousTutorialHref}
                getNextTutorialHref={getNextTutorialHref}
                previousTutorialDisabled={previousTutorialDisabled}
                nextTutorialDisabled={nextTutorialDisabled}
                tutorialId={tutorialId}
                topicId={topicId}
                mermaidDiagram={mermaidDiagram}
            ></BottomAppBar>



        </>
    );
}

function BottomAppBar(props) {

    const navigate = useNavigate();

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

            <AppBar position="fixed" sx={{ top: 'auto', bottom: 0, height: '3.5rem', alignContent: 'center', backgroundColor: blueGrey[50] }}>
                <Toolbar>

                    <Button
                        sx={{ color: 'black', fonfontWeight: 'bold' }}
                        startIcon={<FormatListNumberedIcon sx={{ color: blueGrey[900] }} />}
                        onClick={() => {
                            navigate(`/notebook/${props.topicId}/${props.tutorialId}`);
                            navigate(0);
                        }}>
                        To the Notebook
                    </Button>

                    {
                        props.mermaidDiagram ? <IconButton size='small' color="inherit" onClick={toggleMermaidDiagram}>
                            <SchemaTwoToneIcon sx={{ color: blueGrey[900] }} />
                        </IconButton>
                            :
                            null
                    }

                    {/* 
                    <IconButton size='small' color="inherit" onClick={toggleLeftGrid} disabled>
                        <TextSnippetTwoToneIcon sx={{ color: blueGrey[900] }} />
                    </IconButton> */}



                    <Box sx={{ flexGrow: 1 }} />

                    <Stack direction="row" spacing={2}>
                        {/* <IconButton size='small' color="inherit" disabled>
                            <TerminalTwoToneIcon sx={{ color: blueGrey[900] }} />
                        </IconButton> */}

                        {
                            !props.previousTutorialDisabled &&
                            <Chip label="Previous Tutorial" variant="outlined" onClick={() => {
                                navigate(props.getPreviousTutorialHref(), { replace: true });
                                navigate(0);
                            }
                            } />
                        }

                        {
                            !props.nextTutorialDisabled &&
                            <Chip label="Next Tutorial" variant="outlined" onClick={() => {
                                navigate(props.getNextTutorialHref(), { replace: true });
                                navigate(0);
                            }
                            } />
                        }


                    </Stack>

                </Toolbar>
            </AppBar>
        </React.Fragment>
    );
}

