import Notebook from "../components/Notebook";

import React, { useEffect, useState } from "react";

import { indigo, blueGrey } from '@mui/material/colors';

import { AppBar, Box, Stack, Grid, Typography, Paper } from '@mui/material';
import TopNavBar from "../components/Nav";

import './TutorialPage.css';
import { NotebookService } from "../services/NotebookService";
import CodeEditor from "../components/Editor";

import { matchRoutes, useLocation } from "react-router-dom"
import { useNavigate } from 'react-router-dom';

export default function NotebookPage() {

    const [notebookData, setNotebookData] = useState('');

    // get the path of this page (to get the tutorialId of the page)
    const routeRegex = '/notebook/(?<topicId>[0-9]+)/(?<tutorialId>[0-9]+)'

    let tutorialId = useLocation().pathname.match(routeRegex).groups['tutorialId']
    if (!tutorialId) console.error('tutorialId of this page could not be found!')

    let topicId = useLocation().pathname.match(routeRegex).groups['topicId']
    if (!topicId) console.error('topicId of this page could not be found!')

    useEffect(() => {
        async function getData() {
            let data = await NotebookService.getNotebook(`notebook${tutorialId}`);
            setNotebookData(data);
        }

        getData();
    }, [])


    const parsedNotebook = () =>{
        // let lines = notebookData.split(/\r?\n/);
        let lines = notebookData.split(/\n\n/);

        let nonEmptyLines = lines.filter(i => i);

        let output = [];

        let lineNumber = 0;
        let parsingComponent = false;
        let componentData = {};
        let currentComponentName;

        const startOfComponent = (text) => text.trim()[0] == "<";
        const endOfComponent = (text) => text.trim().search(">") !== -1;
        while (lineNumber < nonEmptyLines.length){
            let line = nonEmptyLines[lineNumber];
            let outputLine;

            if (startOfComponent(line)){
                parsingComponent = true;
                const componentNameRegex = /<\s*(?<name>[a-zA-Z]+)/;
                currentComponentName = line.match(componentNameRegex).groups.name 
                componentData[currentComponentName] = [line]

            } else if (parsingComponent && endOfComponent(line) ){
                parsingComponent = false;
                componentData[currentComponentName].push(line)
                let component = parseComponent(componentData[currentComponentName], currentComponentName, lineNumber)
                output.push(component)

            } else if (parsingComponent){
                componentData[currentComponentName].push(line)

            } else if (line.trim()[0] == "#"){
                outputLine = <Typography key={lineNumber} variant="h3" mt={5} mb={5} whiteSpace="pre-line">{line.replace('#', '')}</Typography> 
            } else {
                outputLine = <Paper elevation={1} sx={{ backgroundColor: '#f5f5f5'}}>
                    <Typography key={lineNumber} padding={3} mb={2} whiteSpace="pre-line" >{line}</Typography>
                </Paper >
            }
            output.push(outputLine);
            lineNumber = lineNumber + 1
        }
        return output
    }

    function parseComponent(data, componentName, lineNumber){
        data = data.join('\n')
        let component;

        if (componentName === 'Editor') {
            const defaultValueRegex = /defaultvalue\s?={?(?<defaultvalue>[\s\S]+)}/
            let defaultValue = data.match(defaultValueRegex).groups.defaultvalue;
            component = <Box key={lineNumber} mb={15} mt={7}>
                <CodeEditor codeEditorHeight='15vh' executionResultHeight='8vh' defaultValue={defaultValue ?? '>'}> </CodeEditor>
            </Box>
        }

        return component;
    }

    return <>
        <TopNavBar></TopNavBar>
        
        <Box sx={{ backgroundColor: '  #fbf9f6' }}>
            <Stack direction='column' sx={{ ml: 10, mr: 10, mt: 2, mb: 1, }}>
                {parsedNotebook()}
            </Stack>
        </Box>

    </>
}