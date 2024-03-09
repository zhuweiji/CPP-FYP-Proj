import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";

function Comment(props) {
  const { userName, text, timeStamp } = props;

  const { sendRequest } = useHttpClient();

  return (
    <div className={`${s.main_container}`}>
      {/* <div className={`${s.inner_container}`}>
        <h1 className={`${s.user_name}`}>{userName}</h1>
        <h1 className={`${s.time_stamp}`}>{timeStamp}</h1>
      </div> */}
      <span className={`${s.user_name}`}>{userName}</span>
      <span className={`${s.time_stamp}`}>{timeStamp}</span>
      <p className={`${s.text}`}>{text}</p>
    </div>
  );
}

export default Comment;
