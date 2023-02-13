import { React, useState, useEffect} from "react";


import { Button, Stack, Fade } from '@mui/material';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import TopNavBar from "../components/Nav";


import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Notebook from "../components/Notebook";



export default function OnlyNotebookPage(){

    // get the path of this page (to get the tutorialId of the page)
    const routeRegex = '/notebook/(?<topicId>[0-9]+)/(?<tutorialId>[0-9]+)'

    let tutorialId = useLocation().pathname.match(routeRegex).groups['tutorialId']
    if (!tutorialId) console.error('tutorialId of this page could not be found!')

    let topicId = useLocation().pathname.match(routeRegex).groups['topicId']
    if (!topicId) console.error('topicId of this page could not be found!')

    const navigate = useNavigate();


    // not working because editors rerender causing all the data on the models to be lost on each state change 
    // let lastScroll = 0;
    // const [showTutorialStickyButton, setShowTutorialStickyButton] = useState(true);

    // const handleTutorialStickyButton = () => {
    //     let scrollY = window.scrollY;
    //     if (scrollY > lastScroll) { // scroll down
    //         setShowTutorialStickyButton(false);
    //     } else if (scrollY < lastScroll) { //scroll up
    //         setShowTutorialStickyButton(true);
    //     } // else was horizontal scroll
    //     lastScroll = scrollY <= 0 ? 0 : scrollY; // For Mobile or negative scrolling
    // }

    // useEffect(() => {
    //   window.addEventListener('scroll', handleTutorialStickyButton);

    //   return () => {
    //     window.removeEventListener('scroll', handleTutorialStickyButton);
    //   }
    
    // }, [])


    


    return <>
        <TopNavBar></TopNavBar>

        {/* <Fade in={myfunc}> */}
            <Button sx={{ position: 'fixed', top: 90, right: 16}}
                onClick={() => navigate(`/tutorial/${topicId}/${tutorialId}`)}
                startIcon={<DoubleArrowIcon />}>
                To the Tutorial
            </Button>
        {/* </Fade> */}

        <Notebook name={`notebook${topicId}-${tutorialId}`}/>

        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
            <Button variant="contained" size='large' sx={{ mt: 10, mb: 20, minWidth:'40vw', minHeight:100}} onClick={() => navigate(`/tutorial/${topicId}/${tutorialId}`)}>To the Tutorial!</Button>
        </Stack>
         
        



    </>

}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
const getRandomValue = () => getRandomInt(0, Number.MAX_SAFE_INTEGER);