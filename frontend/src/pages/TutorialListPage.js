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

let topic1 = {
    id: 1,
    topic_name: 'Tutorial 1 - C++ Basics',
    description: 'Learn the basics of C++ - compiling and running your first hello world programs',
    img_name: 'first_steps.jpg',
    tuts: [
        { id: 1, name: `Hello World! ` },
        { id: 2, name: "Variable and List Instantialization" },
        { id: 3, name: "Loops and Control Structures" },
        { id: 4, name: "Preprocessor Directives (#)" },
        { id: 5, name: "Forward Declarations And Header Files" },
        { id: 6, name: "Exercise: Use Predefined Code To Create A Calculator" },
        { id: 7, name: "Data Structures" },
        { id: 8, name: "Static Casting, Const Variables and Literals" },
        { id: 9, name: "Namespaces" },

    ]
}

let topic2 = {
    id: 2,
    topic_name: 'Tutorial 2 - Object Oriented Design in C++',
    description: 'Implement the Object Oriented principles in C++ to make your understanding of OOP language agnostic',
    img_name: 'corgi_and_friend.jpg',
    tuts: [
        { id: 1, name: `My First C++ Object` },
        { id: 2, name: `Pariatur quis ex culpa officia magna velit consequat.` },
        { id: 3, name: `Adipisicing laboris consequat consequat irure esse laboris do esse.` },
        { id: 4, name: "Private or Public?", description:"Encapsulation: Don't air your dirty laundry where others might see them."},
        // Inheritance vs Composition: A person can be coded differently in two different games - In one, a person will always have hands (in a peaceful farming game) and in the other, they may have detachable/replacable hands (in a sci-fi game)
        { id: 10, name: "Inheritance vs Composition: Which to Choose?", description: "" },
        { id: 11, name: "(SOLID) Single Responsibility Principle", description: "Don't build anything that does everything." },
        { id: 12, name: "(SOLID) Open-Closed Principle (OCP)" },
        { id: 13, name: "(SOLID) Liskov Substitution Principle (LSP)" },
        { id: 14, name: "(SOLID) Interface Segregation Principle (ISP)" },
        { id: 15, name: "(SOLID) Dependency Injection Principle (DIP)" },
        { id: 16, name: "" },
        { id: 17, name: "" },

    ]
}

let topic3 = {
    id: 3,
    topic_name: 'Tutorial 3 - Conceptual Representations to Code',
    description: 'Build familiarity by creating things in C++ using a specification',
    img_name: 'convoluted_diagram.jpg',
    tuts: [
        { id: 1, name: `Class Diagrams? I Don't Go To Class.` },
        { id: 2, name: "UML Diagrams" },
        { id: 3, name: "Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip." },
        { id: 4, name: "Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip." },
        { id: 5, name: "Elit pariatur esse est elit ut Lorem eiusmod dolor ad consequat nostrud et aliqua nostrud." },
        { id: 6, name: "Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip." },
        { id: 7, name: "Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip." },
    ]
}

let capstone = {
    id: 4,
    topic_name: 'Capstone Project - Building STARs, the Course Registration platform ',
    description: 'Solidify your understanding by building an entire project from start to end',
    img_name: 'mountain_peak.jpg',
    tuts: [
        { id: 1, name: "Excepteur eu reprehenderit reprehenderit esse irure aliquip voluptate in." },
        { id: 2, name: "Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip." },
        { id: 3, name: "Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip." },
        { id: 4, name: "Elit pariatur esse est elit ut Lorem eiusmod dolor ad consequat nostrud et aliqua nostrud." },
        { id: 5, name: "Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip." },
        { id: 6, name: "Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip." },
    ]
}

let advanced = {
    id: 5,
    topic_name: '(Advanced Tutorials) Common Design Patterns in Software Engineering',
    description: 'Build everything with software! Explore the power of OOP by building different projects (maintainably and sustainably)',
    img_name: 'lens_mountain.jpg',
    tuts: [
        { id: 1, name: "User Analytics", description: 'Create multiple classes to store and manipulate data to ensure that different departments can get the data they need for user-analytics' },
        { id: 2, name: "Image Processing Pipeline", description: 'Use a pipeline pattern to implement a simple image editor. Image editors have to be able to undo unglamorous edits, so we will ensure our system can do so.' },
        { id: 3, name: "Data Access Objects", description: 'Use the DAO pattern to read data from external sources, while ensuring that your code does not become reliant on data from only one provider.' },
        { id: 4, name: "Data Manipulation and Cleaning", description: 'Use method chaining to make your data science notebooks readable, even after you return to the office after a long holiday.' },
        { id: 5, name: "Hiding the Spaghetti", description: 'Create a Facade to minimise the complexity that others (or more likely, yourself in a few weeks time) will face when using your modules.' },
        { id: 6, name: "Observers (Pub/Sub)", description: 'Write code to listen to the rise and fall of currency rates to ensure that you can exchange your SGD to USD at the most favourable rates.' },
        { id: 7, name: "Unit Tests", description: '' },
        { id: 8, name: "Application Programming Interfaces (API)", description: '' },
    ]
}

let data = [topic1, topic2, topic3, capstone, advanced]



export default function TutorialList(props) {

    const [tutorialsData, setTutorialsData] = useState({});

    useEffectOnce(() => {
        async function fetchData() {
            let v = await TutorialService.getTutorials()
            setTutorialsData(v);
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
                    {false ? <DoneIcon /> : <CloseIcon sx={{ color: red[600] }} />}
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
                    topic['tuts'].map((tutorial, index) => {

                        let tutorialCompleted = false;
                        if (tutorialsData && tutorialsData.tutorials_completed &&
                            tutorialsData.tutorials_completed.some((i) => i.topic_id === topic.id && i.tutorial_id === tutorial.id)
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
                                            href={`notebook/${topic.id}/${index + 1}`}><ListItemText primary={`${index + 1}: ${tutorial.name}`} secondary={tutorial.description || ''} /></ListItemButton>
                                        {tutorialCompleted && <DoneIcon color='success'></DoneIcon>}
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