import React, { useEffect, useState } from "react";

import { indigo, blueGrey } from '@mui/material/colors';

import { styled } from '@mui/material/styles';
import { AppBar, Box, Stack, Grid, Typography, Paper, Divider, Container, Link, Button, Tooltip, Skeleton } from '@mui/material';
import { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import TopNavBar from "../components/Nav";

import './TutorialPage.css';
import { NotebookService } from "../services/NotebookService";
import CodeEditor from "../components/Editor";

import { matchRoutes, useLocation } from "react-router-dom"
import { useNavigate } from 'react-router-dom';
import ErrorPage from "./ErrorPage";
import Editor from "@monaco-editor/react";

const titleRegex = /^(?<!#)#(?<content>[\w\s]+)/
const title2Regex = /^(?<!#)##(?<content>[\w\s]+)/
const title3Regex = /^(?<!#)###(?<content>[\w\s]+)/

const codeRegex = /`(?<content>[\S\s]+?)`/g
const linkRegex = /\[(?<content>[\S\s]+)\]\((?<linkhref>.+)\)/g
const tooltipRegex = /\[(?<content>[\S\s]+)\]\^\{(?<tooltip>.+)\}/g

let _reactComponentKey = 0;
const reactComponentKey = () => {
    _reactComponentKey += 1;
    return _reactComponentKey;
}


const NotebookHeader = (text, key) => {
    // dont add margin if one of the few items on the page - otherwise there is too much whitespace on top
    return <Box mt={key <= 2 ? 0 : 10} mb={5} key={key}>
        <Divider >
            <Typography fontFamily='PT Serif' color='black' key={reactComponentKey()} variant="h2" mt={5} mb={5} p={10} whiteSpace="pre-line">{text}</Typography>
        </Divider>
    </Box>
}

const NotebookHeader2 = (text, key) => {
    // dont add margin if one of the few items on the page - otherwise there is too much whitespace on top
    return <Box mt={key <= 2 ? 0 : 10} mb={5} key={key}>
        <Typography fontFamily='Playfair Display' color='black' key={reactComponentKey()} variant="h3" mt={5} mb={4} whiteSpace="pre-line">{text}</Typography>
        <Divider></Divider>
    </Box>
}

const NotebookHeader3 = (text, key) => {
    // dont add margin if one of the few items on the page - otherwise there is too much whitespace on top
    return <Box mt={key <= 2 ? 0 : 10} mb={5} key={key}>
        <Typography fontFamily='Playfair Display' color='black' key={reactComponentKey()} variant="h4" mt={5} mb={4} whiteSpace="pre-line">{text}</Typography>
        <Divider></Divider>
    </Box>
}

const NotebookCodeBlock = (inlineCodeBlock) => {
    return <Paper key={reactComponentKey()} elevation={1} sx={{ backgroundColor: '#333333', mt: 2, mb: 5 }}>
        {inlineCodeBlock}
    </Paper >
}

const InlineCodeBlock = (text) => {
    const replaceBackticks = (t) => t.replaceAll('`', '')

    text = text.replaceAll(/\\n/g, '\n')

    return <Box key={reactComponentKey()} >
        <Typography key={reactComponentKey()} display='inline' sx={{

            backgroundColor: '#333333',
            display: 'inline-block',
            ml: 5,
            p: 2,
            fontFamily: "Inconsolata",
            whiteSpace: "pre-wrap",
            overflowY: 'auto',
            color: '#9cd025',
        }}>{replaceBackticks(text)}</Typography>
    </Box >

}

const NotebookLink = (content, link) => {
    return <Link href={link} key={reactComponentKey()}>{content}</Link>
}

const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: '50rem',
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}));


const NotebookTooltip = (text, tooltipText) => {
    return <HtmlTooltip key={reactComponentKey()} mt={5} title={
        <>
            <Typography fontFamily='Open Sans' fontSize='.8rem' color='black' width='50rem'
                key={reactComponentKey()} whiteSpace="pre-line">
                {tooltipText}</Typography>
        </>
    } placement="bottom-start" fontSize='3rem'>
        <Typography display='inline-block' fontFamily='Open Sans' fontSize='1.2rem' color='#00695c'
            key={reactComponentKey()} whiteSpace="pre-line"
        >
            {text}</Typography>

    </HtmlTooltip>
}

const NotebookTextBlock = (text) => {
    // const replaceBackslashWithSpaceInFrontAndNoCharsBehind = (string) => string.replaceAll(/(.*)\s\\(?!\S)/g, '$1\n')

    let blocks = []

    function removeRegexMatchFromText(str, regex, objectKey) {
        let extractedStr = true;
        while (extractedStr) {
            extractedStr = str.match(regex)?.pop()
            if (extractedStr) {
                let head = str.substr(0, str.search(regex))
                blocks.push(head)
                blocks.push({ [objectKey]: Array.from(extractedStr.matchAll(regex)).map(i => i.groups) })

                str = str.substr(str.search(regex) + extractedStr.length + 1)
            }

            return str;
        }
    }

    text = removeRegexMatchFromText(text, codeRegex, 'inline-code');
    text = removeRegexMatchFromText(text, linkRegex, 'inline-links');
    text = removeRegexMatchFromText(text, tooltipRegex, 'inline-tooltip');
    blocks.push(text)


    let data = blocks.map(i => {
        if (typeof i === 'string') {
            return Text(i)
        } else if (i['inline-code']) {
            let item = i['inline-code'][0]
            return InlineCodeBlock(item.content)
        } else if (i['inline-links']) {
            let item = i['inline-links'][0]
            return NotebookLink(item.content, item.linkhref)
        } else if (i['inline-tooltip']) {
            let item = i['inline-tooltip'][0]
            return NotebookTooltip(item.content, item.tooltip)
        }
    })



    return <Paper key={reactComponentKey()} elevation={1} sx={{
        textRendering: 'optimizeLegibility', backgroundColor: '#fffffb',
        mt: 2, mb: 2
    }}>
        {data}
    </Paper >

    function Text(text) {
        return <Typography color='black' display='inline-block' fontFamily='Open Sans' fontSize='1.1rem'
            key={reactComponentKey()} padding={3} mb={2} whiteSpace="pre-line"
        >

            {text.replaceAll(/\\n/g, '\n')}
        </Typography>
    }
}



export default function NotebookPage() {

    const [notebookData, setNotebookData] = useState('');
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const [editorNumber, setEditorNumber] = useState(0);

    // get the path of this page (to get the tutorialId of the page)
    const routeRegex = '/notebook/(?<topicId>[0-9]+)/(?<tutorialId>[0-9]+)'

    let tutorialId = useLocation().pathname.match(routeRegex).groups['tutorialId']
    if (!tutorialId) console.error('tutorialId of this page could not be found!')

    let topicId = useLocation().pathname.match(routeRegex).groups['topicId']
    if (!topicId) console.error('topicId of this page could not be found!')

    const navigate = useNavigate();


    useEffect(() => {
        async function getData() {
            try {
                let data = await NotebookService.getNotebook(`notebook${tutorialId}`);
                setNotebookData(data);
            } catch (E) {
                setShowErrorMessage(true);
            }
        }

        getData();
    }, [])

    function parseNotebook2() {
        // split by empty newlines
        let lines = notebookData.split(/\n\s*\n/);

        const output = [];

        let lineNumber = 0;


        let currentComponentData = {};
        let currentComponentName;
        let parsingComponent = false;


        const componentStartTagRegex = /^<(?<componentName>\w+)(?<args>[\w=,\s]*?)>/
        const componentEndTagRegex = /<(?<componentNameEnd>\/.+)>/


        for (let line of lines) {

            if (line.match(componentStartTagRegex) && !parsingComponent) {
                parsingComponent = true;

                let matchObject = line.match(componentStartTagRegex)
                currentComponentName = matchObject.groups.componentName;
                currentComponentData['args'] = matchObject.groups.args.split(',');

                let lineComponentData = line.replace(componentStartTagRegex, '');

                if (line.match(componentEndTagRegex)) {
                    lineComponentData = lineComponentData.replace(componentEndTagRegex, '')
                    currentComponentData['data'] = [lineComponentData];

                    output.push(parseComponent2(currentComponentName, currentComponentData, lineNumber));
                    currentComponentData = {};
                    parsingComponent = false;
                } else {
                    currentComponentData['data'] = [lineComponentData];

                }

            } else if (parsingComponent && line.match(componentEndTagRegex)) {
                let lineComponentData = line.replace(componentEndTagRegex, '')
                currentComponentData['data'].push(lineComponentData)

                output.push(parseComponent2(currentComponentName, currentComponentData, lineNumber));
                currentComponentData = {}
                parsingComponent = false;


            } else if (parsingComponent) {
                currentComponentData['data'].push(line);
            } else {

                const startOfLineRegex = (reg) => new RegExp('^' + reg.source)

                switch (true) {
                    case titleRegex.test(line):
                        line = line.replace(/#/, '')
                        output.push(NotebookHeader(line, lineNumber));
                        break;
                    case title2Regex.test(line):
                        line = line.replace(/##/, '')
                        output.push(NotebookHeader2(line, lineNumber));
                        break;
                    case title3Regex.test(line):
                        line = line.replace(/###/, '')
                        output.push(NotebookHeader3(line, lineNumber))
                        break;
                    case !!line.match(startOfLineRegex(codeRegex)):
                        output.push(NotebookCodeBlock((InlineCodeBlock(line))));
                        break;
                    case !!line.match(startOfLineRegex(linkRegex)):
                        let groups = Array.from(line.matchAll(linkRegex)).map(i => i.groups)[0]
                        output.push(NotebookLink(groups.content, groups.linkhref))


                        break;
                    case !!line.match(startOfLineRegex(tooltipRegex)):
                        let item = Array.from(line.matchAll(tooltipRegex)).map(i => i.groups)[0]
                        output.push(NotebookTooltip(item.content, item.tooltip))
                        break;
                    default:
                        output.push(NotebookTextBlock(line));

                }
            }

            lineNumber += 1;
        }
        return output
    }

    function parseComponent2(componentName, componentData, lineNumber) {
        let raw_args = componentData['args'].map(i => i.trim())
        let data = componentData['data'].join('\n');

        let component;
        let args = {}

        raw_args.map(i => i.match(/(?<name>\w+?)=(?<value>\w+)/))
            .filter(i => i)
            .map(j => j.groups)
            .map(k => args[k.name] = k.value)

        switch (componentName) {
            case 'Editor':
                component = <Box key={lineNumber} mb={15} mt={5}>
                    <CodeEditor codeEditorHeight='20vh' executionResultHeight='8vh' dir={`${lineNumber}/`} defaultValue={data ?? '>'} noCompile={args.nocompile === 'true' ?? false} errorOptions={!args.noerrors === 'true' ?? true} noFiles={args.nofiles === 'true' ?? false}> </CodeEditor>
                </Box>
                break;
            default:
                throw Error(`${componentName} not found`)

        }
        return component;

    }


    const parsedNotebook = () => {
        // let lines = notebookData.split(/\r?\n/);
        let lines = notebookData.split(/\n\n/);


        let nonEmptyLines = lines.filter(i => i);

        let output = [];

        let lineNumber = 0;
        let parsingComponent = false;
        let componentData = {};
        let currentComponentName;

        // TODO: refactor to html like braces (<Editor></Editor> otherwise too many issues with code)
        const startOfComponent = (text) => text.trim()[0] == "<";
        const endOfComponent = (text, componentName) => text.match(RegExp(`${componentName}>`))


        while (lineNumber < nonEmptyLines.length) {
            let line = nonEmptyLines[lineNumber];
            let outputLine;

            if (startOfComponent(line)) {
                parsingComponent = true;
                const componentNameRegex = /<\s*(?<name>[a-zA-Z]+)/;
                currentComponentName = line.match(componentNameRegex).groups.name
                componentData[currentComponentName] = [line]

                if (endOfComponent(line, currentComponentName)) {
                    parsingComponent = false;
                    let component = parseComponent(componentData[currentComponentName], currentComponentName, lineNumber)
                    output.push(component)
                }

            } else if (parsingComponent && endOfComponent(line, currentComponentName)) {
                parsingComponent = false;
                componentData[currentComponentName].push(line)
                let component = parseComponent(componentData[currentComponentName], currentComponentName, lineNumber)
                output.push(component)

            } else if (parsingComponent) {
                componentData[currentComponentName].push(line)

            } else if (line.trim().substring(0, 2) === "##") {
                line = line.replaceAll('#', '')
                outputLine = NotebookHeader(line, lineNumber)
            } else if (line.trim()[0] === "#") {
                line = line.replace('#', '')
                outputLine = NotebookHeader2(line, lineNumber)
            } else {
                outputLine = NotebookTextBlock(line, lineNumber)
            }
            output.push(outputLine);
            lineNumber = lineNumber + 1
        }
        return output
    }

    function parseComponent(data, componentName, lineNumber) {
        data = data.join('\n')
        let component;

        if (componentName === 'Editor') {
            const defaultValueRegex = /defaultvalue\s?={(?<defaultvalue>[\s\S]+)}/
            let defaultValue = data.match(defaultValueRegex)?.groups.defaultvalue;

            const errorOptionsRegex = /noerror(s)?\s?={(?<noErrors>[\s\S]+)} /
            let errorOptionsMatch = data.match(errorOptionsRegex);
            let noerror;
            if (errorOptionsMatch) {
                noerror = errorOptionsMatch.groups.noErrors;
            }

            const noFilesRegex = /nofile(s)?\s?={(?<noFiles>[\s\S]+)}/
            let noFiles = data.match(noFilesRegex)?.groups.noFiles ?? false;

            component = <Box key={lineNumber} mb={15} mt={5}>
                <CodeEditor codeEditorHeight='20vh' executionResultHeight='8vh' defaultValue={defaultValue ?? '>'} errorOptions={!noerror ?? true} noFiles={noFiles}> </CodeEditor>
            </Box>
        } else if (componentName === 'Code') {
            const valueRegex = /value(s)?\s?={(?<value>[\s\S]+)}/
            let value = data.match(valueRegex)?.groups.value ?? '';
            component = NotebookCodeBlock(value, lineNumber)
        }

        return component;
    }

    return <>
        <TopNavBar></TopNavBar>

        <Box sx={{ backgroundColor: '#fbf9f6', pb: 50, pt: 2 }}>
            {
                showErrorMessage ?
                    <Grid
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                        style={{ minHeight: '80vh' }}
                    >

                        <Grid item xs={3}>
                            <div id="error-page">
                                <Container>
                                    <Typography variant="h2">Oops!</Typography>
                                    <p>Sorry, an unexpected error has occurred.</p>
                                    <p>
                                        <i>We were unable to load the notebook</i>
                                    </p>
                                </Container>
                            </div>
                        </Grid>

                    </Grid>
                    :
                    <Stack direction='column' sx={{ ml: 10, mr: 10, mt: 2, mb: 5, }}>
                        {notebookData ? parseNotebook2()
                            :
                            <Stack spacing={2} p={10}>
                                <Skeleton variant="rounded" width='80vw' height='5vh'/>
                                <Skeleton variant="rectangular" width='80vw' height='15vh' mb={2} />
                                <Skeleton variant="rectangular" width='80vw' height='20vh' mb={2} />
                                <Skeleton variant="rectangular" width='80vw' height='10vh' mb={2} />
                                <Skeleton variant="rectangular" width='80vw' height='15vh' mb={2} />
                            </Stack>
                        }
                        <Button variant="contained" sx={{ p: 5, mt: 10 }} onClick={() => navigate(`/tutorial/${topicId}/${tutorialId}`)}>To the Tutorial!</Button>

                        {/* <Stack direction='column' sx={{ ml: 10, mr: 10, mt: 2, mb: 1 }}>
                            <CodeEditor dir={'hello/'} noCompile={true} codeEditorHeight='15vh' executionResultHeight='8vh' defaultTextInTerminal='>' />
                            <CodeEditor noCompile={true} codeEditorHeight='15vh' executionResultHeight='8vh' defaultTextInTerminal='>' />
                            <CodeEditor noCompile={true} codeEditorHeight='15vh' executionResultHeight='8vh' defaultTextInTerminal='>' />
                            <CodeEditor noCompile={true} codeEditorHeight='15vh' executionResultHeight='8vh' defaultTextInTerminal='>' />
                        </Stack> */}

                        {
                            // NotebookTextBlock("hello world! `this is my code`")
                        }
                        {/* <Typography>Hello world {NotebookCodeBlock('oasdmpoas', 1)} World!</Typography> */}


                    </Stack>
            }

        </Box>

    </>
}