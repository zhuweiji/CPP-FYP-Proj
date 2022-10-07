import React, { useState, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

import { Box, Button } from "@mui/material";
import CodeIcon from '@mui/icons-material/Code';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';

import './Editor.css';
import CompilerService from "../services/CompilerBackend";


let CPPDefaultCode = `// Your First C++ Program

#include <iostream>

int main() {
    std::cout << "Hello World!";
    return 0;
}`

function CodeEditor(){
    const monacoRef = useRef(null);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [executionResult, setExecutionResult] = useState(">>");

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

    async function handleCompileButton(){
        let code = getEditorValue();
        let result = await CompilerService.compile_and_run(code)
        let result_data = await result.json()
        
        if (!result.ok){
            console.log('error on request to compile')
            console.log(result)
        }

        console.log(result_data)
        let output = result_data['result']
        console.log(output)

        setExecutionResult(output);
        console.log(executionResult);
    }

    return(<>
    {/* https://www.npmjs.com/package/@monaco-editor/react */}
        <Editor
            height="50vh"
            defaultLanguage="cpp"
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount}
            defaultValue={CPPDefaultCode}
            theme={theme}
        // theme="vs-dark"
        />
        <Button variant="outlined" size="large" endIcon={<CodeIcon/>} onClick={handleCompileButton} disabled={!isEditorReady}>
            Compile
        </Button>

        <br /><br /><br />
        
        

        <Container>
            <p className="executionResultDisplay">{executionResult}</p>
        </Container>
    </>)
}

export default CodeEditor;