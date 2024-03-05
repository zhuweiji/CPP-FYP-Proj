import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useCapitalizer } from "../../../hooks/capitalize-hook";
import { useHttpClient } from "../../../hooks/http-hook";
import EmptyResource from "../EmptyResource/EmptyResource";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import NotesResource from "../NotesResource/NotesResource";
// import PageNotFound from "../../pages/PageNotFound/PageNotFound";
// import SideBar from "../../components/SideBar/SideBar";
import VideoResource from "../VideoResource/VideoResource";
import ExamResourse from "../ExamResource/ExamResource";
import s from "./style.module.css";
import ResponsiveAppBar from "../../../components/Nav";
import SideBar from "../SideBar/SideBar";
import ContributeForm from "../ContributeForm/ContributeForm";

const validResourceNames = ["notes", "videos", "exams", "contribute"];

const dummyData = {
  notes: [
    {
      title: "Q: Test Question",
      description: "hello how are you doing today? Im great lol xdxd hahahah",
      link: "hi",
      file: null,
    },
    { title: "Foo2", description: "bar2", link: "hi2", file: null },
  ],
  videos: [
    {
      title: "V: Some Question",
      description: "hello how are you doing today? Im great lol xdxd hahahah",
      link: "https://google.com",
    },
    {
      title: "Youtube",
      description: "bar2",
      link: "https://youtube.com",
      file: null,
    },
  ],
  examPapers: [
    {
      title: "V: Some Question",
      link: "",
      file: "uploads/dc64fe38-9865-404e-af02-7c85b629dcab2023-12-03_WoodlandsSH.pdf",
    },
    {
      title: "Youtube",
      link: "https://youtube.com",
      file: null,
    },
  ],
  examSolutions: [
    {
      title: "V: Some Question",
      link: "https://google.com",
      file: null,
    },
    {
      title: "Youtube",
      link: "https://youtube.com",
      file: null,
    },
  ],
};

function ResourcePage() {
  const navigate = useNavigate();
  const resourceType = decodeURI(useParams().resourceType);

  const { sendRequest } = useHttpClient();
  const { capitalizeWords } = useCapitalizer();
  const [resourceData, setResourceData] = useState();

  /* Re-direct to notes route if invalid resource path */
  useEffect(() => {
    if (validResourceNames.indexOf(resourceType) === -1) {
      navigate("./../notes");
    }
  }, [navigate, resourceType]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        // get relevant data
        const response = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/resources`
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setResourceData(responseData);
      } catch (err) {
        // TODO: handle error when fetching from backend
        console.log(err.message);
      }
    };
    fetchResources();
  }, [sendRequest]);

  // TODO: remove after test
  // useEffect(() => {
  //   // setResourceData([]);
  //   setResourceData(dummyData);
  // }, []);

  if (!resourceData) {
    return (
      <div>
        <LoadingSpinner asOverlay />
      </div>
    );
  }

  function getAppropriateResources(resourceType) {
    if (resourceType === "notes") {
      return (
        <div>
          {!resourceData.notes || resourceData.notes.length === 0 ? (
            <EmptyResource resourceType="notes" />
          ) : (
            resourceData.notes.map((note, idx) => {
              return (
                <NotesResource
                  key={`note-${idx}`}
                  title={note.title}
                  description={note.description}
                  notesLink={note.link}
                  notesFile={note.file}
                />
              );
            })
          )}
        </div>
      );
    } else if (resourceType === "videos") {
      return (
        <div>
          {!resourceData.videos || resourceData.videos.length === 0 ? (
            <EmptyResource resourceType="videos" />
          ) : (
            resourceData.videos.map((video, idx) => {
              return (
                <VideoResource
                  key={`vid-${idx}`}
                  title={video.title}
                  description={video.description}
                  videoLink={video.link}
                />
              );
            })
          )}
        </div>
      );
    } else if (resourceType === "examPapers") {
      return (
        <div>
          {!resourceData.examPapers || resourceData.examPapers.length === 0 ? (
            <EmptyResource resourceType="exam papers" />
          ) : (
            resourceData.examPapers.map((examPaper, idx) => {
              return (
                <ExamResourse
                  key={`exampaper-${idx}`}
                  title={examPaper.title}
                  examLink={examPaper.link}
                  examFile={examPaper.file}
                />
              );
            })
          )}
        </div>
      );
    } else if (resourceType === "examSolutions") {
      return (
        <div>
          {!resourceData.examSolutions ||
          resourceData.examSolutions.length === 0 ? (
            <EmptyResource resourceType="exam solutions" />
          ) : (
            resourceData.examSolutions.map((examSolution, idx) => {
              return (
                <ExamResourse
                  key={`examsol-${idx}`}
                  title={examSolution.title}
                  examLink={examSolution.link}
                  examFile={examSolution.file}
                />
              );
            })
          )}
        </div>
      );
    } else if (resourceType === "contribute") {
      return (
        <div>
          <ContributeForm />
        </div>
      );
    }
  }

  return (
    <div>
      <ResponsiveAppBar />
      <SideBar />
      <div className={`${s.main_container}`}>
        <div className={`${s.resource_container}`}>
          <h1 className={s.section_title}>{`${
            resourceType === "exams"
              ? "Exam Papers"
              : capitalizeWords(resourceType)
          }`}</h1>
          {getAppropriateResources(
            resourceType === "exams" ? "examPapers" : resourceType
          )}
        </div>
        {resourceType === "exams" && (
          <div className={`${s.resource_container}`}>
            <h4 className={s.section_title}>{`Exam Solutions`}</h4>
            {getAppropriateResources("examSolutions")}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourcePage;
