import React, { useState, useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

import CodeEditor from "./Editor";

import { red, blue, green, blueGrey, grey, teal, pink } from '@mui/material/colors';
import { Typography, Box, Grid, Container, Stack, Paper, Divider } from '@mui/material';

export default function Notebook(){
    return <>
        <Stack direction='column' sx={{ ml: 10, mr: 10, mt: 2, mb: 1}}>
            <Typography  variant="h3" component="div" mt={5} mb={8}>Magna est ullamco quis velit.</Typography>
            <Typography variant="p" component="div" mb={3}>Ex officia velit veniam duis. Esse magna dolor sunt tempor ex. Occaecat enim ut minim exercitation magna qui. Ut officia eiusmod mollit laborum esse proident non consequat enim voluptate in amet nostrud. Consectetur enim incididunt nulla aute incididunt magna laborum sint adipisicing id adipisicing. Eiusmod enim dolore nisi culpa cupidatat magna.</Typography>
            <CodeEditor codeEditorHeight='15vh' executionResultHeight='8vh' defaultTextInTerminal='>'/>

            <Divider sx={{ mt: 10, mb:4 }} />

            <Typography variant="h3" component="div" mt={5} mb={8}>Magna est ullamco quis velit.</Typography>
            <Typography variant="p" component="div" mb={3}>Ex officia velit veniam duis. Esse magna dolor sunt tempor ex. Occaecat enim ut minim exercitation magna qui. Ut officia eiusmod mollit laborum esse proident non consequat enim voluptate in amet nostrud. Consectetur enim incididunt nulla aute incididunt magna laborum sint adipisicing id adipisicing. Eiusmod enim dolore nisi culpa cupidatat magna.</Typography>
            <CodeEditor codeEditorHeight='15vh' executionResultHeight='8vh' defaultTextInTerminal='>' />

            <Divider sx={{ mt: 10, mb: 4 }} />

            <Typography variant="h3" component="div" mt={5} mb={8}>Magna est ullamco quis velit.</Typography>
            <Typography variant="p" component="div" mb={3}>Ex officia velit veniam duis. Esse magna dolor sunt tempor ex. Occaecat enim ut minim exercitation magna qui. Ut officia eiusmod mollit laborum esse proident non consequat enim voluptate in amet nostrud. Consectetur enim incididunt nulla aute incididunt magna laborum sint adipisicing id adipisicing. Eiusmod enim dolore nisi culpa cupidatat magna.</Typography>
            <CodeEditor codeEditorHeight='15vh' executionResultHeight='8vh' defaultTextInTerminal='>' />

            <Divider sx={{ mt: 10, mb: 4 }} />


            <Typography variant="h3" component="div" mt={5} mb={8}>Magna est ullamco quis velit.</Typography>
            <Typography variant="p" component="div" mb={3}>Ex officia velit veniam duis. Esse magna dolor sunt tempor ex. Occaecat enim ut minim exercitation magna qui. Ut officia eiusmod mollit laborum esse proident non consequat enim voluptate in amet nostrud. Consectetur enim incididunt nulla aute incididunt magna laborum sint adipisicing id adipisicing. Eiusmod enim dolore nisi culpa cupidatat magna.</Typography>
            <CodeEditor codeEditorHeight='15vh' executionResultHeight='8vh' defaultTextInTerminal='>' />
        </Stack>
    </>
}