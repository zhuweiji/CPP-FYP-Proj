import { useEffect, useState } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";
import RatingDisplay from "../RatingDisplay/RatingDisplay";

function NotesResource(props) {
  const { title, description, notesFile, notesLink, rating } = props;

  const { sendRequest } = useHttpClient();
  const [fileUrl, setFileUrl] = useState();

  useEffect(() => {
    const createTempUrl = async () => {
      try {
        const response = await sendRequest(
          `${process.env.REACT_APP_ASSET_URL}/${notesFile}`
        );

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          setFileUrl(url);
        }
      } catch (err) {}
    };
    if (notesFile) {
      createTempUrl();
    }
  }, [notesFile, sendRequest, setFileUrl]);

  return (
    <div className={`${s.main_container}`}>
      <div>
        <h1 className={`${s.notes_title}`}>{title}</h1>
        <span className={`${s.notes_link}`}>
          <b>{"Download: "}</b>
        </span>
        <a
          className={`${s.notes_link}`}
          type="button"
          target="_blank"
          rel="noreferrer"
          // href={
          //   notesFile
          //     ? `${process.env.REACT_APP_ASSET_URL}/${notesFile}`
          //     : notesLink
          // }
          href={fileUrl || notesLink}
          download={fileUrl && `${title}.pdf`}
        >
          {`${title}`}
        </a>
        <p className={`${s.notes_description}`}>
          <span>
            <b>{"Description: "}</b>
          </span>
          {`${description}`}
        </p>
      </div>
      <RatingDisplay rating={rating} />
    </div>
  );
}

export default NotesResource;
