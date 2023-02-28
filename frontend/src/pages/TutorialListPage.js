import React, { useState, useRef, useEffect } from "react";
import TopNavBar from "../components/Nav";
import LinearProgressWithLabel from "../components/LinearProgressBar__Labelled";

import { useEffectOnce } from 'react-use'

import { red, blue, green, blueGrey, grey, teal, pink } from '@mui/material/colors';
import { Typography, Box, Grid, Container, Stack, Paper } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import BabyImage from "../static/first_steps.jpg";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import { useNavigate } from 'react-router-dom';


import './TutorialListPage.css'
import TutorialService from "../services/TutorialDataFetch";


export default function TutorialList(props) {

    const [tutorialsData, setTutorialsData] = useState([]);
    const [tutorialsCompleted, setTutorialsCompleted] = useState([]);

    useEffectOnce(() => {
        async function fetchData() {
            let v = await TutorialService.getTutorials()
            setTutorialsData(v?.data);
            setTutorialsCompleted(v?.tutorials_completed);

        }
        fetchData();
    })

    let listItems = tutorialsData?.map(topic => {
        let image_url = topic['img_name'] || 'objects_on_table.jpg';
        const imageObject = require(`../static/${image_url}`);

        let numTutorialsCompleted = 0;
        if (tutorialsData && tutorialsCompleted) {
            numTutorialsCompleted = new Set(tutorialsCompleted.filter(i => i.topic_id === topic.topicId)).size;
        }

        return <div key={topic['id']}>

            <Stack direction="column" alignItems="start" className="TutorialBanner" sx={{
                // backgroundColor: 'black',
                color: 'whitesmoke',
                pl: '1rem', pb: '2rem', pr: '10%',
                minHeight: '15vh',
                backgroundImage: `url(${imageObject}), linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8))`,
                backgroundPosition: 'center center',
                backgroundSize: 'cover',
                backgroundBlendMode: 'overlay',
                '&:hover': {
                    boxShadow: 6,
                },
                '&:hover .hiddenRow': {
                    // transform: "translate(0%, 0)",
                    transition: 'all 0.1 ease-in-out',
                    opacity: 100,
                    maxHeight: 1000

                }
            }}>
                <Typography sx={{ mt: 4, mb: 2 }} variant="h4" component="div">{topic['topic_name']}</Typography>
                <Typography sx={{ mt: 4, mb: 5 }} variant="p" component="div" className="tutorialBannerDescription"><i>{topic['description']}</i></Typography>

                <Stack direction='row' alignItems='center' className="hiddenRow" spacing={2}
                    sx={{ transition: 'all 0.4s ease-in-out 0.5s', opacity: 0.0, maxHeight: 0 }}>
                    <Typography variant="h6" component="div" >
                        Tutorial Completed:
                    </Typography>
                    {false ? <DoneIcon /> : <CloseIcon sx={{ color: red[600] }} />}
                </Stack>

            </Stack>

            <List key={topic['id']} sx={{ mb: '1rem' }}>
                <Divider />
                {
                    topic.tutorials.map((tutorial, index) => {
                        let tutorialCompleted = false;
                        if (tutorialsData && tutorialsCompleted &&
                            tutorialsCompleted.some((i) => i.topic_id === topic.topicId && i.tutorial_id === tutorial.id)
                        ) {
                            tutorialCompleted = true;

                        }
                        let color = tutorialCompleted ? '#f1fdf4' : "white";

                        return <div key={index}>
                            <Paper elevation={3} sx={{
                                backgroundColor: color,

                            }}>
                                <ListItem key={index} sx={{
                                    '&:hover': {
                                        boxShadow: 6,
                                    },
                                }} >

                                    <Stack direction='row' alignItems="center" sx={{ width: '100%', }}>
                                        <ListItemButton
                                            sx={{ '&:hover': { background: 'transparent' } }}
                                            href={`notebook/${topic.topicId}/${index + 1}`}><ListItemText primary={`${index + 1}: ${tutorial.name}`} secondary={tutorial.description || ''} /></ListItemButton>
                                        {tutorialCompleted && <DoneIcon color='success'></DoneIcon>}
                                        <KeyboardArrowRightIcon id={`hiddenArrow${index}`} />
                                    </Stack>
                                </ListItem>
                            </Paper>
                        </div>
                    })
                }
            </List>
            <LinearProgressWithLabel value={
                Math.min((numTutorialsCompleted / topic.tutorials.length) * 100, 100)
            } />

            <br /><br />
            <br /><br />
        </div>
    })


    return (<div className="listPage">
        <TopNavBar></TopNavBar>

        <Box sx={{ width: '90vw', margin: '5%' }}>
            <Typography variant="h2">Course Outline</Typography>
            <Divider sx={{ pb: '3rem' }} />
            <br />
            {listItems}
        </Box>
    </div>)
}