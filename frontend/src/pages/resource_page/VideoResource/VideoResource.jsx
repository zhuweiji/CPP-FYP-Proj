import s from "./style.module.css";
import RatingDisplay from "../RatingDisplay/RatingDisplay";
import ResourceActions from "../ResourceActions/ResourceActions";

function VideoResource(props) {
  const { title, description, videoLink, rating, id, displayActions } = props;

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
        <ResourceActions resourceId={id} resourceType={"video_resource"} />
      )}
    </div>
  );
}

export default VideoResource;
