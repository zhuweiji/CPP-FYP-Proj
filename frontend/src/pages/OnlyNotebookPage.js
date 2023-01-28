import Notebook from "../components/Notebook";

import React, { useEffect, useState } from "react";

import { indigo, blueGrey } from '@mui/material/colors';

import { AppBar, Box, Stack, Grid, Typography, Paper, Divider } from '@mui/material';
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
        const replaceBackslashWithSpaceInFrontAndNoCharsBehind = (string) => string.replaceAll(/(.*)\s\\(?!\S)/g, '$1\n')

        // TODO: refactor to html like braces (<Editor></Editor> otherwise too many issues with code)
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

            } else if (line.trim().substring(0, 2) === "##") {
                outputLine = <Box mt={lineNumber <= 2 ? 0 : 10} mb={5}><Divider ><Typography fontFamily='PT Serif' color='black' key={lineNumber} variant="h3" mt={5} mb={5} whiteSpace="pre-line">{line.replaceAll('#', '')}</Typography> </Divider></Box>
            } else if (line.trim()[0] === "#") {
                outputLine = <Box mt={lineNumber <= 2 ? 0 : 10} mb={5}><Typography fontFamily='Playfair Display' color='black' key={lineNumber} variant="h2" mt={5} mb={4} whiteSpace="pre-line">{line.replace('#', '')}</Typography><Divider></Divider></Box>
            }  else {
                outputLine = <Paper elevation={1} sx={{ backgroundColor: '#f5f5f5', mt:2, mb:2}}>
                    <Typography fontFamily='PT Serif' color='black' key={lineNumber} padding={3} mb={2} whiteSpace="pre-line" >{replaceBackslashWithSpaceInFrontAndNoCharsBehind(line)}</Typography>
                </Paper >
            }
            output.push(outputLine);
            lineNumber = lineNumber + 1
        }
        return output
    }

    function parseComponent(data, componentName, lineNumber){
        console.log(componentName);

        console.log(data);
        data = data.join('\n')
        let component;

        if (componentName === 'Editor') {
            const defaultValueRegex = /defaultvalue\s?={(?<defaultvalue>[\s\S]+)}/
            let defaultValue = data.match(defaultValueRegex).groups.defaultvalue;

            const errorOptionsRegex = /noerror(s)?\s?={(?<noErrors>[\s\S]+)} /

            let errorOptionsMatch = data.match(errorOptionsRegex);
            let noerror;
            if (errorOptionsMatch){
                noerror = errorOptionsMatch.groups.noErrors;
            }

            console.log(!noerror ?? true);

            component = <Box key={lineNumber} mb={15} mt={7}>
                <CodeEditor codeEditorHeight='15vh' executionResultHeight='8vh' defaultValue={defaultValue ?? '>'} errorOptions={!noerror ?? true}> </CodeEditor>
            </Box>
        }

        return component;
    }

    return <>
        <TopNavBar></TopNavBar>
        
        <Box sx={{ backgroundColor: '  #fbf9f6' , pb:50, pt:2}}>
            <Stack direction='column' sx={{ ml: 10, mr: 10, mt: 2, mb: 5, }}>
                {parsedNotebook()}
            </Stack>
        </Box>

    </>
}