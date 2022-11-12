import React, { useState, useRef } from "react";
import ButtonAppBar from "../components/Nav";

import { red, blue, green, blueGrey } from '@mui/material/colors';
import { Typography, Box, Grid, Container, Stack, Paper } from '@mui/material';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import BabyImage from "../static/first_steps.jpg";



import './TutorialListPage.css'

let topic1 = {
    id: 1,
    topic_name: 'Tutorial 1 - C++ Basics',
    description: 'Learn the basics of C++ - compiling and running your first hello world programs',
    img_name: 'first_steps.jpg',
    tuts: [`Hello World!`,
        "Elit pariatur esse est elit ut Lorem eiusmod dolor ad consequat nostrud et aliqua nostrud.",
        "Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip.",
        "Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip.",
    ]
}

let topic2 = {
    id: 2,
    topic_name: 'Tutorial 2 - Object Oriented Design in C++',
    description: 'Implement the Object Oriented principles in C++ to make your understanding language agnostic',
    img_name: 'corgi_and_friend.jpg',
    tuts: [`My First C++ Object`,
        "Elit pariatur esse est elit ut Lorem eiusmod dolor ad consequat nostrud et aliqua nostrud.",
        "Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip.",
        "Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip.",
    ]
}

let topic3 = {
    id: 3,
    topic_name: 'Tutorial 3 - Conceptual Representations to Code',
    description: 'Build familiarity by creating things in C++ using a specification',
    img_name: 'convoluted_diagram.jpg',
    tuts: [`Class Diagrams? I Don't Go To Class.`,
        "Elit pariatur esse est elit ut Lorem eiusmod dolor ad consequat nostrud et aliqua nostrud.",
        "Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip.",
        "Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip.",
        "Elit pariatur esse est elit ut Lorem eiusmod dolor ad consequat nostrud et aliqua nostrud.",
        "Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip.",
        "Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip.",
    ]
}

let capstone = {
    id: 4,
    topic_name: 'Capstone Project - Building STARs, the Course Registration platform ',
    description: 'Solidify your understanding by building an entire project from start to end',
    img_name: 'mountain_peak.jpg',
    tuts: [
        "Elit pariatur esse est elit ut Lorem eiusmod dolor ad consequat nostrud et aliqua nostrud.",
        "Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip.",
        "Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip.",
        "Elit pariatur esse est elit ut Lorem eiusmod dolor ad consequat nostrud et aliqua nostrud.",
        "Sit ad ullamco fugiat pariatur id id ea ex do non enim aliquip.",
        "Velit id culpa sint velit ex aliquip laborum nulla consequat laboris labore aliquip.",
    ]
}

let data = [topic1, topic2, topic3, capstone]



export default function TutorialList(props) {
    let listItems = data.map(topic => {
        let image_url = topic['img_name'] || 'objects_on_table.jpg'
        const blackCarImage = require(`../static/${image_url}`);

        return <div key={topic['id']}>
            <Stack direction="column" alignItems="start" className="TutorialBanner" sx={{
                // backgroundColor: 'black',
                color: 'whitesmoke', 
                pl: '1rem', pb: '2rem', pr: '10%',
                backgroundImage: `url(${blackCarImage}), linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8))`,
                backgroundPosition: 'center center',
                backgroundSize: 'cover',
                backgroundBlendMode: 'overlay',
            }}>
                <Typography sx={{ mt: 4, mb: 2 }} variant="h4" component="div">{topic['topic_name']}</Typography>
                <Typography sx={{ mt: 4, mb: 2 }} variant="p" component="div" className="tutorialBannerDescription"><i>{topic['description']}</i></Typography>
            </Stack>


            <List key={topic['id']} sx={{ 'paddingBottom': '4rem' }}>
                <Divider />
                {
                    topic['tuts'].map((tutorial, index) =>
                        <div key={index}>
                            <Paper elevation={2} >
                                <ListItem key={index} >
                                    <ListItemButton href={`tutorial/${index}`}><ListItemText primary={`${index+1}: ${tutorial}`} /></ListItemButton>
                                </ListItem>
                            </Paper>
                        </div>
                    )
                }
            </List>
            <br /><br />
        </div>
    })


    return (<div className="listPage">
        <ButtonAppBar></ButtonAppBar>

        <Box sx={{ width: '100%', margin: '5%' }}>
            <Typography variant="h2">Course Outline</Typography>
            <Divider sx={{ pb: '3rem' }} />
            <br />
            {listItems}
        </Box>
    </div>)
}