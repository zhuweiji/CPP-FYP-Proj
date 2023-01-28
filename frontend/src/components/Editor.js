import React, { useState, useRef, useEffect } from "react";

/* https://www.npmjs.com/package/@monaco-editor/react */
// https://microsoft.github.io/monaco-editor/playground.html
import Editor from "@monaco-editor/react";

import CodeIcon from '@mui/icons-material/Code';


import { Stack, Box, Button, Tooltip, Typography, IconButton, Pagination, CircularProgress, TextField, FormControl } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ErrorIcon from '@mui/icons-material/Error';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';

import {
    CodeCompileService,
    CompileResultStatuses
} from "../services/CodeCompileService";



let defaultTextInEditor = `// Your First C++ Program

#include <iostream>

int main() {
    std::cout << "Hello World!";
    return 0;
}`


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

function CodeEditor(props) {
    let TEST_CONNECTION = true;

    const editorRef = useRef(null);
    const newFilenameRef = useRef(null);

    const [isEditorReady, setIsEditorReady] = useState(false);
    const [wasThrottled, setWasThrottled] = useState(false);
    const [newEditorFilename, setnewEditorFilename] = useState('');

    const [showDeleteError, setShowDeleteError] = useState(false);
    const [showFilenameError, setShowFilenameError] = useState(false);
    const [currentEditorFilename, setCurrentEditorFilename] = useState('main.cpp');
    const [editorFile, setEditorFile] = useState({
        'main.cpp': `${defaultTextInEditor}`
    });

    const [secondsTillUnthrottled, setSecondsTillUnthrottled] = useState(0);
    const [postCompileMessages, setPostCompileMessages] = useState('');
    const [compilerServerStatus, setCompilerServerStatus] = useState(TEST_CONNECTION ? CompilerServerStatuses.UNTESTED : CompilerServerStatuses.WILL_NOT_TEST);

    const [executionResults, setExecutionResults] = useState([]);

    let defaultTextInTerminal = props.defaultTextInTerminal ?? `>> Hello! Compile something and view the results here`
    const [displayedExecutionResult, setDisplayedExecutionResult] = useState(defaultTextInTerminal);
    const compilerServerProbeResults = [];

    const [theme, setTheme] = useState("light");

    let compilerServerProbeIntervalMS = 7000;

    useEffect(() => {
        editorRef.current?.focus();
    }, [editorFile]);


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


    function handleEditorWillMount(monaco) {
        // do something before editor is mounted
    }

    function handleEditorDidMount(editor, monaco) {
        // here is another way to get monaco instance
        // you can also store it in `useRef` for further usage
        setIsEditorReady(true);
        editorRef.current = editor;

        editorRef.current.addAction({
            id: 'delete-left-shift-del',
            label: 'Delete Left',
            keybindings: [
                monaco.KeyMod.Shift | monaco.KeyCode.Delete,
            ],
            // @param editor The editor instance is passed in as a convenience
            run: function (ed) {
                ed._actions.deleteAllLeft.run();
            }
        })

        // not currently working because cant find a good keybinding thats not taken up by either browser or monaco
        editorRef.current.addAction({
            id: 'compile-code',
            label: 'Compile Code',
            keybindings: [
                monaco.KeyMod.Ctrl | monaco.KeyMod.Shift | monaco.KeyCode.B,
            ],
            run: function (ed) {
                console.log('hello!');
                handleCompilation();
            }
        });


        let actions = editor.getSupportedActions().filter((a) => a.id == 'vs.editor.ICodeEditor:1:compile-code');

    }


    function toggleTheme() {
        setTheme(theme === "light" ? "vs-dark" : "light");
    }

    function getEditorValue() {
        return editorRef.current.getValue();
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

    async function handleCompilation(grade) {
        setIsEditorReady(false);
        let code = getEditorValue();
        let result;

        if (grade) {
            result = await CodeCompileService.grade_code(code, props.topicId, props.tutorialId);
        } else {
            result = await CodeCompileService.compile_and_run(code, props.errorOptions ?? true);
        }

        if (!result) {
            setPostCompileMessages('There was an error compiling your code. ')
            setIsEditorReady(true);
            return
        }


        if (result.status === CompileResultStatuses.THROTTLED) {
            setCompilerServerStatus(CompilerServerStatuses.THROTTLED);
            setWasThrottled(true);

            setPostCompileMessages('Your requests are currently being throttled. Please wait before continuing.')


            let msToNextMinute = (60 - new Date().getSeconds()) * 1000;

            setSecondsTillUnthrottled(msToNextMinute / 1000);
            let updateSecondsToThrottleIntervalId = setInterval(() => {
                setSecondsTillUnthrottled((prevState, props) => prevState - 1);
            }, 1000);

            setTimeout(() => {
                clearInterval(updateSecondsToThrottleIntervalId);
                setWasThrottled(false);
                setIsEditorReady(true);
            }, msToNextMinute);

        } else {
            if (result.error) {
                console.error(result.error)
            }

            if (result.status === CompileResultStatuses.ERROR) {
                setPostCompileMessages('There was an error compiling your code.')
                setIsEditorReady(true);
            } else {
                setPostCompileMessages('')
            }

            if (result.status === CompileResultStatuses.PASSED_GRADING) {
                props.updateGradingToPassed();
            }

            let displayedOutput = result.message;

            setExecutionResults([...executionResults, displayedOutput]);
            setDisplayedExecutionResult(displayedOutput);
            setIsEditorReady(true);
        }
    }

    async function testConnectionToCompilerServer() {
        let probeResults = await CodeCompileService.check_connection();

        compilerServerProbeResults.push(probeResults); // append to front of list

        if (compilerServerProbeResults.length > 5) {
            compilerServerProbeResults.shift()
        }

        if (compilerServerProbeResults.every((value) => value === CodeCompileService.probeResponse.ok)) {
            setCompilerServerStatus(CompilerServerStatuses.READY);
        } else if (compilerServerProbeResults.every((value) => value === CodeCompileService.probeResponse.error)) {
            setCompilerServerStatus(CompilerServerStatuses.UNCONTACTABLE);
        } else {
            setCompilerServerStatus(CompilerServerStatuses.INTERMITTENT);
        }
    }


    const displayFilenameError = () => {
        return newEditorFilename.length !== 0 && (
            newEditorFilename.split('.').length !== 2
            || !(newEditorFilename.split('.')[1] === 'cpp' || newEditorFilename.split('.')[1] === 'h')
        )
    }

    const createNewFile = () => {
        if (displayFilenameError() || newEditorFilename.length === 0) {
            setShowFilenameError(true);
            return;
        } else {
            setShowFilenameError(false);

            let newfile = {}
            newfile[newEditorFilename] = ''

            setEditorFile({ ...editorFile, ...newfile });
            setCurrentEditorFilename(newEditorFilename);
            setnewEditorFilename('');
        }
    }

    

    function deleteCurrentFile(){
        if (currentEditorFilename === 'main.cpp') {
            setShowDeleteError(true);
            setTimeout(()=>{
                setShowDeleteError(false);
            },1500)
            
            return;
            }
        setShowDeleteError(false);
        let { [currentEditorFilename]: _, ...rest } = editorFile;
        setEditorFile(rest);
        setCurrentEditorFilename('main.cpp');
    }

    return (
        <>
            <Box id="editorDiv" sx={{ border: "1px solid #979797", padding: '2%', marginRight: '5px' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} mb={2}>
                    <Stack direction='column'>
                        <Button onClick={deleteCurrentFile}>Delete Current File</Button>
                        <Typography variant='small' color='#d32f2f'>{showDeleteError?"Cannot delete main.cpp":""}</Typography>
                    </Stack>

                    <Box>
                        {Object.entries(editorFile).map(([filename, fileobject], index) => {
                            return <Button variant={currentEditorFilename === filename ? 'outlined': 'text'} key={`file${index}`} onClick={() => setCurrentEditorFilename(filename)}>{filename}</Button>
                        }
                        )}
                    </Box>

                    <Box>
                        <FormControl>
                            <TextField id="newFileNameTextField" label="File Name" variant="standard" sx={{ width: '10ch' }}
                                onChange={(e) => setnewEditorFilename(e.target.value)} value={newEditorFilename}
                                error={showFilenameError}
                                helperText={showFilenameError ? "File extension must either be '.cpp' or '.h'" : ''}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') createNewFile();
                                }}
                            />
                            <Button onClick={createNewFile}>Create New File</Button>
                        </FormControl>
                    </Box>


                </Stack>



                <Editor
                    height={props.codeEditorHeight || '45vh'}
                    defaultLanguage="cpp"

                    beforeMount={handleEditorWillMount}
                    onMount={handleEditorDidMount}

                    // why are new files undefined?
                    defaultValue={props.defaultValue || (editorFile[currentEditorFilename] ?? "")}


                    path={currentEditorFilename}

                    theme={theme}
                // theme="vs-dark"
                />

                <br /><br />

                <Stack direction="row" justifyContent="end" alignItems="center" spacing={2}>
                    {
                        props.includeGradeButton &&
                        <Button color="success" variant="outlined" size="large" endIcon={<DoneAllRoundedIcon />} onClick={() => handleCompilation(true)} disabled={!isEditorReady} justify="flex-end" >
                            Grade
                        </Button>
                    }


                    <Button variant="outlined" size="large" endIcon={<CodeIcon />} onClick={() => handleCompilation(false)} disabled={!isEditorReady} justify="flex-end">
                        Compile
                    </Button>
                    {(!isEditorReady && (compilerServerStatus !== CompilerServerStatuses.UNCONTACTABLE)) ? <CircularProgress size='1rem' /> : null}

                </Stack>
            </Box>

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



                <Stack direction="row" alignItems="center">
                    <Typography style={{ fontFamily: "Inconsolata" }}>{postCompileMessages}</Typography>

                    {getThrottledIcon()}
                    {getCompilerStatusIcon()}
                </Stack>
            </Stack>

            <Box id="executionResultDisplay"
                height={props.executionResultHeight || "21vh"}
                sx={{
                    flexDirection: 'column',
                    fontFamily: 'Inconsolata',
                    padding: '1rem',
                    pt: '2rem',
                    pl: '3rem',
                    // padding: "5%",
                    whiteSpace: "pre-line", // displays line breaks instead of keeping text on same line
                    overflowY: 'auto',
                    color: '#9cd025',
                    backgroundColor: '#333333',
                }}>
                {displayedExecutionResult}
            </Box>
        </>

    )
}

export default CodeEditor;