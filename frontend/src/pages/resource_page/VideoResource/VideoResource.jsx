import { useCallback, useState, useEffect } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";
import RatingDisplay from "../RatingDisplay/RatingDisplay";
import ResourceActions from "../ResourceActions/ResourceActions";

function VideoResource(props) {
  const { title, description, videoLink, rating, id, displayActions } = props;
  const { sendRequest } = useHttpClient();
  const [toDelete, setToDelete] = useState(false);

  const triggerDelete = useCallback(() => {
    setToDelete(true);
  }, []);

  useEffect(() => {
    const deleteResource = async () => {
      try {
        const response = await sendRequest(
          `${process.env.REACT_APP_ASSET_URL}/video-resources/${id}`,
          "DELETE"
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.detail);
        }

        alert("Video resources successfully deleted");
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
        <h1 className={`${s.video_title}`}>{title}</h1>
        <span className={`${s.video_link}`}>
          <b>{"Link: "}</b>
        </span>
        <a
          className={`${s.video_link}`}
          type="button"
          target="_blank"
          rel="noreferrer"
          href={videoLink}
        >
          {`${title}`}
        </a>
        <p className={`${s.video_description}`}>
          <span className={`${s.video_description}`}>
            <b>{"Description: "}</b>
          </span>
          {`${description ? description : "No description found."}`}
        </p>
      </div>
      <RatingDisplay rating={rating} />
      {displayActions && (
        <ResourceActions
          resourceId={id}
          resourceType={"video_resource"}
          triggerDelete={triggerDelete}
        />
      )}
    </div>
  );
}

export default VideoResource;
