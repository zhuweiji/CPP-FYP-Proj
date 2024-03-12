import { React, useState, useEffect } from "react";

import { Button, Stack, Fade } from "@mui/material";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import TopNavBar from "../components/Nav";

import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Notebook from "../components/Notebook";
import { NotebookService } from "../services/NotebookService";
import TutorialDataFetch from "../services/TutorialDataFetch";

export default function OnlyNotebookPage() {
  // TODO: Remove this regex nonsense

  // get the path of this page (to get the tutorialId of the page)
  const routeRegex = "/notebook/(?<topicId>[0-9]+)/(?<tutorialId>[0-9]+)";

  let tutorialId =
    useLocation().pathname.match(routeRegex).groups["tutorialId"];
  if (!tutorialId) console.error("tutorialId of this page could not be found!");

  let topicId = useLocation().pathname.match(routeRegex).groups["topicId"];
  if (!topicId) console.error("topicId of this page could not be found!");

  const navigate = useNavigate();

  const notebookName = `notebook${topicId}-${tutorialId}`;

  useEffect(() => {
    async function navigateToTutorialIfNoNotebook() {
      let data = await NotebookService.getNotebook(notebookName);
      if (!data) {
        navigate(`/tutorial/${topicId}/${tutorialId}`, { replace: true });
      }
    }
    navigateToTutorialIfNoNotebook();
  }, []);

  return (
    <>
      <TopNavBar></TopNavBar>

      {/* <Fade in={myfunc}> */}
      <Button
        sx={{ position: "fixed", top: 90, right: 16 }}
        onClick={() => {
          navigate(`/tutorial/${topicId}/${tutorialId}`);
          TutorialDataFetch.markTutorialCompleted(topicId, tutorialId);
        }}
        startIcon={<DoubleArrowIcon />}
      >
        Next
      </Button>
      {/* </Fade> */}

      <Notebook name={notebookName} />

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Button
          variant="contained"
          size="large"
          sx={{ mt: 10, mb: 20, minWidth: "40vw", minHeight: 100 }}
          onClick={() => {
            navigate(`/tutorial/${topicId}/${tutorialId}`);
            TutorialDataFetch.markTutorialCompleted(topicId, tutorialId);
          }}
        >
          Next!
        </Button>
      </Stack>
    </>
  );
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
const getRandomValue = () => getRandomInt(0, Number.MAX_SAFE_INTEGER);
