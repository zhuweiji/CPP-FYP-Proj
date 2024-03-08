import { useEffect, useState } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";

function Comment(props) {
  const { userName, text, timeStamp } = props;

  const { sendRequest } = useHttpClient();

  return (
    <div className={`${s.main_container}`}>
      <div>
        <h1 className={`${s.user_name}`}>{userName}</h1>
        <h2 className={`${s.time_stamp}`}>{timeStamp}</h2>
        <p className={`${s.text}`}>{text}</p>
      </div>
    </div>
  );
}

export default Comment;
