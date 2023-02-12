import React, { useEffect, useState } from "react";

import { blueGrey } from '@mui/material/colors';

import { styled } from '@mui/material/styles';
import { Box, Stack, Grid, Typography, Paper, Divider, Container, Link, Button, Tooltip, Skeleton, IconButton } from '@mui/material';
import TerminalTwoToneIcon from '@mui/icons-material/TerminalTwoTone';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import { tooltipClasses } from '@mui/material/Tooltip';
import TopNavBar from "../components/Nav";

import './TutorialPage.css';
import { NotebookService } from "../services/NotebookService";
import CodeEditor from "../components/Editor";

import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

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
        }}>{replaceBackticks(text).replaceAll('\\t','\t')}</Typography>
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
            // TODO: extract the extract component code into another function and use that in the create component function for editor groups
            let maybeComponent = componentBuilder.call(line);

            if (maybeComponent !== false) {
                if (maybeComponent === true){
                    continue
                }
                else{
                    output.push(maybeComponent);
                }

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

    const componentBuilder = {
        componentStartTagRegex: /^<(?<componentName>\w+)(?<args>[\w=,\s\.]*?)>/,
        componentEndTagRegex: (componentName) => RegExp('</' + componentName + '>'),

        currentComponentData: {},
        parsingComponent: false,
        currentComponentName: '',

        reset: function(){
            this.currentComponentData = {};
            this.parsingComponent = false;
            this.currentComponentName = '';
        },

        call: function (line) {
            let componentStartTagRegex = this.componentStartTagRegex;
            let componentEndTagRegex = this.componentEndTagRegex(this.currentComponentName);

            if (line.match(componentStartTagRegex) && !this.parsingComponent) {
                this.parsingComponent = true;

                let matchObject = line.match(componentStartTagRegex)
                this.currentComponentName = matchObject.groups.componentName;
                this.currentComponentData['args'] = matchObject.groups.args.split(',');

                componentEndTagRegex = this.componentEndTagRegex(this.currentComponentName);

                let lineComponentData = line.replace(componentStartTagRegex, '');

                if (line.match(componentEndTagRegex)) {
                    lineComponentData = lineComponentData.replace(componentEndTagRegex, '')
                    this.currentComponentData['data'] = [lineComponentData];

                    let currentComponentName = this.currentComponentName;
                    let currentComponentData = this.currentComponentData;
                    this.reset();

                    let component = createComponent(currentComponentName, currentComponentData);
                    return component;
                } else {
                    this.currentComponentData['data'] = [lineComponentData];

                }

            } else if (this.parsingComponent && line.match(componentEndTagRegex)) {
                let lineComponentData = line.replace(componentEndTagRegex, '')
                this.currentComponentData['data'].push(lineComponentData)

                let currentComponentName = this.currentComponentName;
                let currentComponentData = this.currentComponentData;
                this.reset();
                let component = createComponent(currentComponentName, currentComponentData);
                return component;

            } else if (this.parsingComponent) {
                this.currentComponentData['data'].push(line);
            } else{
                return false;
            }

            return true;
        },
        
        // given a string of several components together, return an object with keys 
        //   components: an array of split components, 
        //   unmatched: an array of text that does not belong to any components
        splitComponents: function(text, componentName){
            let componentStartTagRegex = this.componentStartTagRegex;
            let componentEndTagRegex = this.componentEndTagRegex(componentName);

            let output = {components: [], unmatched: []}

            while (text){
                text = text.trim()

                let foundComponentStartTag = text.match(componentStartTagRegex);
                let foundComponentEndTag = text.match(componentEndTagRegex);

                if (foundComponentStartTag && foundComponentEndTag){
                    let componentData = text.substr(foundComponentStartTag.index, foundComponentEndTag.index + foundComponentEndTag[0].length)
                    output.components.push(componentData);

                    if (foundComponentStartTag.index !== 0){
                        output.unmatched.push(text.substr(0, foundComponentStartTag.index))
                    }

                    text = text.substr(foundComponentEndTag.index + foundComponentEndTag[0].length+1)
                } else{
                    output.unmatched.push(text)
                    text = ''
                }

            }

            return output;

        }
    }

    

    function createComponent(componentName, componentData, lineNumber = reactComponentKey()) {
        let raw_args = componentData['args'].map(i => i.trim())
        let data = componentData['data'].join('\n');

        let component;
        let args = {}

        raw_args.map(i => i.match(/(?<name>\w+?)=(?<value>\w+(\.\w+)?)/))
            .filter(i => i)
            .map(j => j.groups)
            .map(k => args[k.name] = k.value)

        


        switch (componentName) {
            case 'EditorGroup':
                let splitData = componentBuilder.splitComponents(data, 'EditorFile');
                if (splitData.unmatched.length > 0){
                    console.warn(`some text was unmatched within an editor group was unmatched ${splitData.unmatched}`)
                }
                let components = splitData.components ?? [];

                let unnamedFileIndex = 0;
                const generateFilename = () => {
                    unnamedFileIndex++;
                    return `file_${unnamedFileIndex}.cpp`;
                }

                let editorData = {}
                let dir = getRandomValue();
                components.map(i => componentBuilder.call(i, 'EditorFile')).forEach(obj => {
                    let filename = obj.filename ?? generateFilename()
                    editorData[`${dir}/${filename}`] = obj.data;
                });
                component = <Box key={lineNumber} mb={15} mt={5}>
                    <CodeEditor codeEditorHeight='20vh' executionResultHeight='8vh' files={editorData}
                    noCompile={args.nocompile === 'true' ?? false} errorOptions={!args.noerrors === 'true' ?? true} noFiles={args.nofiles === 'true' ?? false}> </CodeEditor>
                </Box>
                break;
            case 'EditorFile': 
                return {filename: args.filename, data: data}

            case 'Editor':
                component = <Box key={lineNumber} mb={15} mt={5}>
                    <CodeEditor codeEditorHeight='20vh' executionResultHeight='8vh' dir={`${lineNumber}/`} defaultValue={data.trim() ?? '>'} noCompile={args.nocompile === 'true' ?? false} errorOptions={!args.noerrors === 'true' ?? true} noFiles={args.nofiles === 'true' ?? false}> </CodeEditor>
                </Box>
                break;

            case 'Code':
                component = NotebookCodeBlock(InlineCodeBlock(data));
                break;
            default:
                throw Error(`${componentName} not found`)

        }
        return component;

    }



    return <>
        <TopNavBar></TopNavBar>

        <Button sx={{ position: 'fixed', top: 90, right: 16 }}
            onClick={() => navigate(`/tutorial/${topicId}/${tutorialId}`)}
            startIcon={<DoubleArrowIcon/>}>
            To the Tutorial
        </Button>

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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
const getRandomValue = () => getRandomInt(0, Number.MAX_SAFE_INTEGER);