import React, { useState, useRef } from "react";

/* https://www.npmjs.com/package/@monaco-editor/react */
import Editor, { useMonaco } from "@monaco-editor/react";

// import { Box as div, Button } from "@mui/material";
import CodeIcon from '@mui/icons-material/Code';


import {Container, Stack, Box, Button} from '@mui/material';

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

function CodeEditor() {
    const monacoRef = useRef(null);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [executionResult, setExecutionResult] = useState(defaultTextInTerminal);

    const [theme, setTheme] = useState("light");

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

    async function handleCompileButton() {
        let code = getEditorValue();
        let result = await CompilerService.compile_and_run(code)

        let defaultErrorMessage = "There was an error on the compiler server. Please wait and try again later."
        if (!result){
            setExecutionResult(defaultErrorMessage);
            return
        }

        let result_data = await result.json()

        if (!result.ok || result.status_code !== 200) {
            console.log('error on request to compile')
            console.error(result)
            console.error(result_data)
            setExecutionResult(defaultErrorMessage);
            return
        }

        console.log(result_data)
        let output = result_data['result']
        console.log(output)

        setExecutionResult(output);
    }

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
                
                <Button variant="outlined" size="large" endIcon={<CodeIcon />} onClick={handleCompileButton} disabled={!isEditorReady}>
                    Compile
                </Button>

                <br /><br /><br />



            </div>
            <Box id="executionResultDisplay" sx={{
                width: "100%",
                height: "12em",
                fontFamily: 'Inconsolata', 
                padding:"5%",
            }}>
                {executionResult}
            </Box>
        </>

    )
}

export default CodeEditor;