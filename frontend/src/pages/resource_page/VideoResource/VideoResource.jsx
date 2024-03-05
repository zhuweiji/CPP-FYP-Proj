import s from "./style.module.css";

function VideoResource(props) {
  const { title, description, videoLink } = props;

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
        <p className={`${s.video_description}`}>{description}</p>
      </div>
    </div>
  );
}

export default VideoResource;
