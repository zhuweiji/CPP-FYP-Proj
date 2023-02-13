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

    const [showTutorialStickyButton, setShowTutorialStickyButton] = useState(true);

    let lastScroll = 0;

    useEffect(() => {
      window.addEventListener('scroll', () => {
          var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
          if (st > lastScroll) { // scroll down
              setShowTutorialStickyButton(false);
          } else if (st < lastScroll) { //scroll up
              setShowTutorialStickyButton(true);
          } // else was horizontal scroll
          lastScroll = st <= 0 ? 0 : st; // For Mobile or negative scrolling
      })
    
    }, [])
    


    return <>
        <TopNavBar></TopNavBar>

        <Fade in={showTutorialStickyButton}>
            <Button sx={{ position: 'fixed', top: 90, right: 16}}
                onClick={() => navigate(`/tutorial/${topicId}/${tutorialId}`)}
                startIcon={<DoubleArrowIcon />}>
                To the Tutorial
            </Button>

        </Fade>

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