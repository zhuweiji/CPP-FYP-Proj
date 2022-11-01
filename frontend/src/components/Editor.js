import React, { useState, useRef, useEffect } from "react";

/* https://www.npmjs.com/package/@monaco-editor/react */
import Editor, { useMonaco } from "@monaco-editor/react";

import CodeIcon from '@mui/icons-material/Code';


import { Container, Stack, Box, Button, ButtonGroup, Chip, Tooltip, Typography, Divider, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ErrorIcon from '@mui/icons-material/Error';
import AcUnitIcon from '@mui/icons-material/AcUnit';

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
    UNTESTED: "We're testing the connection to the compiler server",
    READY: "Strong connection to the compiler server",
    INTERMITTENT: "There have been some issues with the connection to the compiler server",
    UNCONTACTABLE: "The compiler server is unreachable - Check your connection or the compiler server could be down",
    THROTTLED: "You have sent too many compile requests recently. The compiler server is throttling your requests temporarily."
})

function CodeEditor() {
    let TEST_CONNECTION = false;
    
    const monacoRef = useRef(null);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [compilerServerStatus, setCompilerServerStatus] = useState(CompilerServerStatuses.UNTESTED);

    const [executionResult, setExecutionResult] = useState(defaultTextInTerminal);
    const compilerServerProbeResults = [];

    const [theme, setTheme] = useState("light");

    let compilerServerProbeIntervalMS = 5000;

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

    function compilerStatusIcon(){
        let icon;
        if (compilerServerStatus == CompilerServerStatuses.UNTESTED){
            icon = <RestartAltIcon color='disabled'/>;
        } else if (compilerServerStatus == CompilerServerStatuses.READY){
            icon = <CheckIcon color='success'/>;
        } else if (compilerServerStatus == CompilerServerStatuses.INTERMITTENT){
            icon = <ErrorIcon color='warning'/>;
        } else if (compilerServerStatus == CompilerServerStatuses.UNCONTACTABLE){
            icon = <ClearIcon color='error'/>;
        } else if (compilerServerStatus == CompilerServerStatuses.THROTTLED){
            icon = <AcUnitIcon color='secondary'/>;
        }
        
        return <Tooltip title={compilerServerStatus}>
            <IconButton>
                {icon}
            </IconButton>
        </Tooltip>
        
    }

    async function handleCompileButton() {
        let code = getEditorValue();
        let result = await CompilerService.compile_and_run(code)

        let defaultErrorMessage = "There was an error on the compiler server. Please wait and try again later."

        // TODO: this should be in a catch
        if (!result || !result.ok || result.status_code !== 200) {
            if (compilerServerStatus == CompilerServerStatuses.READY || compilerServerStatus == CompilerServerStatuses.UNTESTED) {
                setCompilerServerStatus(CompilerServerStatuses.INTERMITTENT);
            }

            console.log('error on request to compile')
            console.error(result)
            if (result){
                console.error(result_data.json())
            }
            setExecutionResult(defaultErrorMessage);
            return
        }

        let result_data = await result.json()

        console.log(result_data)
        let output = result_data['result']
        console.log(output)

        setExecutionResult(output);
    }

    async function testConnectionToCompilerServer(){
        let probeResults = await CompilerService.check_connection();
        compilerServerProbeResults.unshift(probeResults); // append to front of list

        if (compilerServerProbeResults.length >= 5){
            compilerServerProbeResults.pop()
        }
        if (compilerServerProbeResults.every((value) => value === true)){
            setCompilerServerStatus(CompilerServerStatuses.READY);
        } else if (compilerServerProbeResults.every((value) => value === false)) {
            setCompilerServerStatus(CompilerServerStatuses.UNCONTACTABLE);
        } else {
            setCompilerServerStatus(CompilerServerStatuses.INTERMITTENT);
        }
    }

    useEffect(()=>{
        if (TEST_CONNECTION){
            const interval = setInterval(() => {
                testConnectionToCompilerServer();
            }, compilerServerProbeIntervalMS);

            return () => clearInterval(interval);
        } else{

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

                <Stack direction="row" justifyContent="end" alignItems="center">
                    <Button variant="outlined" size="large" endIcon={<CodeIcon />} onClick={handleCompileButton} disabled={!isEditorReady} justify="flex-end">
                        Compile
                    </Button>
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
                        <ButtonGroup variant="text" aria-label="text button group">
                            <Button> 1 </Button>
                            <Button> 2 </Button>
                            <Button variant="outlined"> 3 </Button>
                        </ButtonGroup>
                    </Stack>
                    
                </div>
                
                {compilerStatusIcon()}
            </Stack>

            <Box id="executionResultDisplay" sx={{
                width: "100%",
                height: "12em",
                fontFamily: 'Inconsolata',
                padding: "5%",
            }}>
                {executionResult}
            </Box>
        </>

    )
}

export default CodeEditor;