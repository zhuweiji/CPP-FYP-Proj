import { useEffect, useState, useCallback } from "react";

import RatingDisplay from "../RatingDisplay/RatingDisplay";
import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";
import ResourceActions from "../ResourceActions/ResourceActions";

function ExamResourse(props) {
  const { title, examFile, examLink, rating, id, isSolution, displayActions } =
    props;
  const { sendRequest } = useHttpClient();
  const [fileUrl, setFileUrl] = useState();
  const [toDelete, setToDelete] = useState(false);

  const triggerDelete = useCallback(() => {
    setToDelete(true);
  }, []);

  useEffect(() => {
    const createTempUrl = async () => {
      try {
        const response = await sendRequest(
          `${process.env.REACT_APP_ASSET_URL}/${examFile}`
        );

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          setFileUrl(url);
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (examFile) {
      createTempUrl();
    }
  }, [examFile, sendRequest, setFileUrl]);

  useEffect(() => {
    const deleteResource = async () => {
      try {
        const response = await sendRequest(
          `${process.env.REACT_APP_ASSET_URL}/${
            isSolution ? "exam-solutions" : "exam-papers"
          }/${id}`,
          "DELETE"
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.detail);
        }

        alert("Resource successfully deleted");
        window.location.reload(false); // reload to see changes
      } catch (err) {
        alert(err.message);
      }
    };
    if (toDelete) {
      deleteResource();
    }
  }, [sendRequest, toDelete, id]);

  return (
    <div className={`${s.main_container}`}>
      <div>
        <h1 className={`${s.exam_title}`}>{title}</h1>

        <span className={`${s.exam_link}`}>
          <b>{"Download: "}</b>
        </span>
        <a
          className={`${s.exam_link}`}
          type="button"
          target="_blank"
          rel="noreferrer"
          href={fileUrl || examLink}
          download={fileUrl && `${title}.pdf`}
        >
          {`${title}`}
        </a>
        <RatingDisplay rating={rating} />
        {displayActions && (
          <ResourceActions
            resourceId={id}
            resourceType={isSolution ? "exam_solution" : "exam_paper"}
            triggerDelete={triggerDelete}
          />
        )}
      </div>
    </div>
  );
}

export default ExamResourse;
