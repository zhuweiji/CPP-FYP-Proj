import React, { useState, useRef, useEffect } from "react";
import TopNavBar from "../components/Nav";
import LinearProgressWithLabel from "../components/LinearProgressBar__Labelled";

import {useEffectOnce} from 'react-use'

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

let topic1 = {
    id: 1,
    topic_name: 'Tutorial 1 - C++ Basics',
    description: 'Learn the basics of C++ - compiling and running your first hello world programs',
    img_name: 'first_steps.jpg',
    tuts: [
        {id: 1,name:`Hello World!`},
        {id: 2,name:"Elit pariatur esse est elit ut Lorem eiusmod dolor ad consequat nostrud et aliqua nostrud."},
        {id: 3,name:"Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip."},
        {id: 4,name:"Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip."},
    ]
}

let topic2 = {
    id: 2,
    topic_name: 'Tutorial 2 - Object Oriented Design in C++',
    description: 'Implement the Object Oriented principles in C++ to make your understanding language agnostic',
    img_name: 'corgi_and_friend.jpg',
    tuts: [
        {id: 1, name:`My First C++ Object`},
        {id: 2, name:"Elit pariatur esse est elit ut Lorem eiusmod dolor ad consequat nostrud et aliqua nostrud."},
        {id: 3, name:"Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip."},
        {id: 4, name:"Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip."},
    ]
}

let topic3 = {
    id: 3,
    topic_name: 'Tutorial 3 - Conceptual Representations to Code',
    description: 'Build familiarity by creating things in C++ using a specification',
    img_name: 'convoluted_diagram.jpg',
    tuts: [
        {id: 1,name:`Class Diagrams? I Don't Go To Class.`},
        {id: 2,name:"Elit pariatur esse est elit ut Lorem eiusmod dolor ad consequat nostrud et aliqua nostrud."},
        {id: 3,name:"Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip."},
        {id: 4,name:"Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip."},
        {id: 5,name:"Elit pariatur esse est elit ut Lorem eiusmod dolor ad consequat nostrud et aliqua nostrud."},
        {id: 6,name:"Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip."},
        {id: 7,name:"Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip."},
    ]
}

let capstone = {
    id: 4,
    topic_name: 'Capstone Project - Building STARs, the Course Registration platform ',
    description: 'Solidify your understanding by building an entire project from start to end',
    img_name: 'mountain_peak.jpg',
    tuts: [
        {id:1 ,name:"Elit pariatur esse est elit ut Lorem eiusmod dolor ad consequat nostrud et aliqua nostrud."},
        {id:2 ,name:"Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip."},
        {id:3 ,name:"Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip."},
        {id:4 ,name:"Elit pariatur esse est elit ut Lorem eiusmod dolor ad consequat nostrud et aliqua nostrud."},
        {id:5 ,name:"Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip."},
        {id:6 ,name:"Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip."},
    ]
}

let data = [topic1, topic2, topic3, capstone]



export default function TutorialList(props) {
    
    const [tutorialsData, setTutorialsData] = useState({});

    useEffectOnce(()=>{
        async function fetchData(){
            let v = await TutorialService.getTutorials()
            setTutorialsData(v);
            console.log(v);
        }
        fetchData();
    })

    let listItems = data.map(topic => {
        let image_url = topic['img_name'] || 'objects_on_table.jpg'
        const imageObject = require(`../static/${image_url}`);

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
                    {false ? <DoneIcon/> : <CloseIcon sx={{color:red[600]}}/>}
                </Stack>
                {/* <Stack className='hiddenRow' direction='row'
                    sx={{
                        borderRadius: 1,
                        bgcolor: grey[900],
                        color: 'text.secondary',
                        minHeight: 0,
                    }}
                >
                    <Typography variant="p" component="div" sx={{ m: 1.5, color: blue[600]}}>Tutorial Completed: </Typography>
                    {false ?
                        <Typography variant="p" component="div" sx={{ m: 1.5, color: green[800] }}>Yes </Typography> : 
                        <Typography variant="p" component="div" sx={{ m: 1.5, color: red[800]}}>No </Typography>}
                    <Divider orientation="vertical" variant="middle" flexItem />
                </Stack> */}

            </Stack>

            <List key={topic['id']} sx={{ mb: '1rem' }}>
                <Divider />
                {
                    topic['tuts'].map((tutorial, index) =>{

                        let tutorialCompleted = false;
                        if (tutorialsData && tutorialsData.tutorials_completed && 
                            tutorialsData.tutorials_completed.some((i) => i.topic_id === topic.id && i.tutorial_id === tutorial.id)
                            ){
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
                                            href={`tutorial/${topic.id}/${index + 1}`}><ListItemText primary={`${index + 1}: ${tutorial.name}`} /></ListItemButton>
                                        {tutorialCompleted  && <DoneIcon color='success'></DoneIcon>}
                                        <KeyboardArrowRightIcon id={`hiddenArrow${index}`} />
                                    </Stack>
                                </ListItem>
                            </Paper>
                        </div>
                    })
                }
            </List>
            <LinearProgressWithLabel value={0} />

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