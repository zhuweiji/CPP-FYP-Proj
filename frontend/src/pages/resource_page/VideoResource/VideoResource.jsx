import s from "./style.module.css";

function VideoResource(props) {
  const { title, description, videoLink } = props;

  return (
    <div className={`${s.main_container}`}>
      <div>
        <h1 className={`${s.video_title}`}>{title}</h1>
        <a type="button" target="_blank" rel="noreferrer" href={videoLink}>
          Link
        </a>
        <p className={`${s.video_description}`}>{description}</p>
      </div>
    </div>
  );
}

export default VideoResource;
