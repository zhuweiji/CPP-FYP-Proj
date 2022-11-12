import React, { useState, useRef, useEffect } from "react";

/* https://www.npmjs.com/package/@monaco-editor/react */
import Editor, { useMonaco } from "@monaco-editor/react";

import CodeIcon from '@mui/icons-material/Code';


import { Container, Stack, Box, Button, ButtonGroup, Chip, Tooltip, Typography, Divider, IconButton, Pagination, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ErrorIcon from '@mui/icons-material/Error';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import OpacityIcon from '@mui/icons-material/Opacity';

import './Editor.css';
import CompilerService from "../services/CompilerBackend";



let defaultTextInEditor = `// Your First C++ Program

#include <iostream>

int main() {
    std::cout << "Hello World!";
    return 0;
}`

let defaultTextInTerminal = `>> Hello! Compile something and view the results here
`

// TODO:  want to change this to proper enum so that storing the states wont be an array of a chunk of text: rn its ["we're testing ... ", "we're testing.."]
const CompilerServerStatuses = Object.freeze({
    WILL_NOT_TEST: "",
    UNTESTED: "We're testing the connection to the compiler server",
    READY: "Strong connection to the compiler server",
    INTERMITTENT: "There have been some issues with the connection to the compiler server",
    UNCONTACTABLE: "The compiler server is unreachable - Check your connection or the compiler server could be down",
    THROTTLED: "You have sent too many compile requests recently. The compiler server is throttling your requests temporarily.",
    RECENLTY_THROTTLED: "Your connection has been throttled recently. Consider slowing down the rate of your compile requests.",
})

function CodeEditor() {
    let TEST_CONNECTION = true;

    const monacoRef = useRef(null);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [wasThrottled, setWasThrottled] = useState(false);
    const [secondsTillUnthrottled, setSecondsTillUnthrottled] = useState(0);
    const [compilerServerStatus, setCompilerServerStatus] = useState(TEST_CONNECTION ? CompilerServerStatuses.UNTESTED : CompilerServerStatuses.WILL_NOT_TEST);

    const [executionResults, setExecutionResults] = useState([]);

    const [displayedExecutionResult, setDisplayedExecutionResult] = useState(defaultTextInTerminal);
    const compilerServerProbeResults = [];

    const [theme, setTheme] = useState("light");

    let compilerServerProbeIntervalMS = 7000;

    function handleEditorWillMount(monaco) {
        // here is the monaco instance
        // do something before editor is mounted
    }

    function handleEditorDidMount(editor, monaco) {
        // here is another way to get monaco instance
        // you can also store it in `useRef` for further usage
        setIsEditorReady(true);
        monacoRef.current = editor;
    }


    function toggleTheme() {
        setTheme(theme === "light" ? "vs-dark" : "light");
    }

    function getEditorValue() {
        return monacoRef.current.getValue();
    }

    function getThrottledIcon() {
        if (wasThrottled === true) {

            return <Tooltip title={`${CompilerServerStatuses.THROTTLED}\nYou can next compile in ${secondsTillUnthrottled}s`}>
                <IconButton>
                    <AcUnitIcon color="secondary" />
                </ IconButton>

            </Tooltip>
        }
    }

    function getCompilerStatusIcon() {
        // using the compilerServerStatus state, return a Tooltip button that corresponds to the state
        let icon;
        if (compilerServerStatus === CompilerServerStatuses.WILL_NOT_TEST) {

        } else if (compilerServerStatus === CompilerServerStatuses.UNTESTED) {
            icon = <RestartAltIcon color='disabled' />;
        } else if (compilerServerStatus === CompilerServerStatuses.READY) {
            icon = <CheckIcon color='success' />;
        } else if (compilerServerStatus === CompilerServerStatuses.INTERMITTENT) {
            icon = <ErrorIcon color='warning' />;
        } else if (compilerServerStatus === CompilerServerStatuses.UNCONTACTABLE) {
            icon = <ClearIcon color='error' />;
        }

        return <Tooltip title={compilerServerStatus}>
            <IconButton>
                {icon}
            </IconButton>
        </Tooltip>

    }

    async function handleCompileButton() {
        setIsEditorReady(false);
        let code = getEditorValue();
        let result = await CompilerService.compile_and_run(code)

        if (result.status === 429) {
            setCompilerServerStatus(CompilerServerStatuses.THROTTLED);
            setWasThrottled(true);

            let msToNextMinute = (60 - new Date().getSeconds()) * 1000;
            
            setSecondsTillUnthrottled(msToNextMinute/1000);
            let updateSecondsToThrottleIntervalId = setInterval(()=>{
                setSecondsTillUnthrottled((prevState, props)=>prevState-1);
                },1000);

            setTimeout(() => {
                clearInterval(updateSecondsToThrottleIntervalId);
                setWasThrottled(false);
                setIsEditorReady(true);
            }, msToNextMinute);
        } else {

            let defaultErrorMessage = "There was an error on the compiler server. Please wait and try again later."

            // // TODO - this should be in a catch
            // if (!result || !result.ok || result.status_code !== 200) {
            //     if (compilerServerStatus == CompilerServerStatuses.READY || compilerServerStatus == CompilerServerStatuses.UNTESTED) {
            //         setCompilerServerStatus(CompilerServerStatuses.INTERMITTENT);
            //     }

            //     console.log('error on request to compile')
            //     console.error(result)
            //     if (result){
            //         console.error(result.json())
            //     }
            //     setExecutionResult(defaultErrorMessage);
            //     return
            // }


            let result_data = await result.json()

            let displayedOutput = result_data['result']
            setExecutionResults([...executionResults, displayedOutput]);

            setDisplayedExecutionResult(displayedOutput);

            setIsEditorReady(true);
        }
    }

    async function testConnectionToCompilerServer() {
        let probeResults = await CompilerService.check_connection();

        compilerServerProbeResults.push(probeResults); // append to front of list

        if (compilerServerProbeResults.length > 5) {
            compilerServerProbeResults.shift()
        }

        if (compilerServerProbeResults.every((value) => value === CompilerService.probeResponse.ok)) {
            setCompilerServerStatus(CompilerServerStatuses.READY);
        } else if (compilerServerProbeResults.every((value) => value === CompilerService.probeResponse.error)) {
            setCompilerServerStatus(CompilerServerStatuses.UNCONTACTABLE);
        } else {
            setCompilerServerStatus(CompilerServerStatuses.INTERMITTENT);
        }
    }

    useEffect(() => {
        // poll connection to compiler server backend
        if (TEST_CONNECTION) {
            testConnectionToCompilerServer();
            
            const interval = setInterval(() => {
                testConnectionToCompilerServer();
            }, compilerServerProbeIntervalMS);

            return () => clearInterval(interval);
        } else {

        }
    }, [])


    return (
        <>
            <div id="editorDiv">
                <Editor
                    height="50vh"
                    defaultLanguage="cpp"
                    beforeMount={handleEditorWillMount}
                    onMount={handleEditorDidMount}
                    defaultValue={defaultTextInEditor}
                    theme={theme}
                // theme="vs-dark"
                />

                <br /><br />

                <Stack direction="row" justifyContent="end" alignItems="center" spacing={2}>
                    <Button variant="outlined" size="large" endIcon={<CodeIcon />} onClick={handleCompileButton} disabled={!isEditorReady} justify="flex-end">
                        Compile
                    </Button>
                    {(!isEditorReady && (compilerServerStatus !== CompilerServerStatuses.UNCONTACTABLE)) ? <CircularProgress size='1rem' /> : null}

                </Stack>
            </div>

            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center"
                sx={{
                    "paddingLeft": "1rem",
                    "paddingTop": "0.5rem",
                    "paddingBottom": "0.5rem",
                    "paddingRight": "0.5rem",
                }}>

                <div>
                    <Stack direction="row" alignItems="center">
                        <Typography style={{ fontFamily: "Inconsolata" }}> View results from execution: </Typography>
                        <Pagination count={executionResults.length} onChange={(event, value) => {
                            let index = value - 1; // onChange value starts from 1
                            setDisplayedExecutionResult(executionResults[index]);
                        }}></Pagination>
                    </Stack>

                </div>

                <Stack direction="row" alignItems="end">
                    {getThrottledIcon()}
                    {getCompilerStatusIcon()}
                </Stack>
            </Stack>

            <Box id="executionResultDisplay" sx={{
                width: "100%",
                height: "20em",
                fontFamily: 'Inconsolata',
                padding: "5%",
                whiteSpace: "pre-line", // displays line breaks instead of keeping text on same line
                overflowY: 'auto',
            }}>
                {displayedExecutionResult}
            </Box>
        </>

    )
}

export default CodeEditor;