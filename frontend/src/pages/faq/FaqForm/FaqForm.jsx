import Button from "@mui/material/Button";
import { useState } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";
import UserDataService from "../../../services/UserService";

function FaqForm(props) {
  const { question, answer, topic, topicId, id, closeForm } = props;
  const [errorMessage, setErrorMessage] = useState("");
  const { sendRequest } = useHttpClient();
  const [formState, setFormState] = useState({
    question: question,
    answer: answer,
    topic: topic,
  });

  async function formSubmitHandler(event) {
    event.preventDefault();

    if (UserDataService.getUserPrivilege() !== "admin") {
      alert("You are not authorized!");
      return;
    }
    setErrorMessage("");

    const method = id === "-1" ? "POST" : "PUT";
    const path = id === "-1" ? "create" : "";
    const reqBody = {
      question: formState.question,
      answer: formState.answer,
      chat_topic: formState.topic,
      user_id: UserDataService.getUserId(),
    };
    if (id !== "-1") {
      reqBody.id = id;
    }
    try {
      const response = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/chat-queries/${path}`,
        method,
        JSON.stringify(reqBody),
        {
          "Content-Type": "application/json",
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail);
      } else {
        alert("Your FAQ has been uploaded! Thank you!");
        window.location.reload(false); // reload to see changes
      }
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    }
  }

  return (
    <div className={`${s.main_container}`}>
      {/* <div className={`${s.header_container}`}>
        <h1 className={`${s.header}`}>{`New Task`}</h1>
      </div> */}

      <form onSubmit={formSubmitHandler}>
        {/* The question input */}
        <div className={`${s.input_container}`}>
          <h1 className={`${s.input_label}`}>Question</h1>
          <input
            id="question"
            type="text"
            placeholder="Question"
            className={`${s.form_input}`}
            value={formState.question}
            onChange={(event) => {
              setFormState((prev) => {
                return {
                  ...prev,
                  question: event.target.value,
                };
              });
            }}
          />
        </div>

        {/* The answer input */}
        <div className={`${s.input_container}`}>
          <h1 className={`${s.input_label}`}>Answer</h1>
          <textarea
            id="answer"
            rows={5}
            placeholder="Answer"
            className={`${s.form_text_area}`}
            value={formState.answer}
            onChange={(event) => {
              setFormState((prev) => {
                return {
                  ...prev,
                  answer: event.target.value,
                };
              });
            }}
          />
        </div>

        {/* The topic input */}
        <div className={`${s.input_container}`}>
          <h1 className={`${s.input_label}`}>Topic</h1>
          <input
            id="topic"
            type="text"
            placeholder="Topic"
            className={`${s.form_input}`}
            value={formState.topic}
            onChange={(event) => {
              setFormState((prev) => {
                return {
                  ...prev,
                  topic: event.target.value,
                };
              });
            }}
          />
        </div>

        {/* {errorMessage && (
          <div className={`${s.error_container}`}>
            <p>{`${errorMessage}`}</p>
          </div>
        )} */}

        <div className={`${s.button_container}`}>
          <Button
            type="submit"
            sx={{
              mr: "10px",
            }}
            // type="submit"
            variant="contained"
            color="success"
          >
            SUBMIT
          </Button>
          <Button
            sx={{
              ml: "10px",
            }}
            onClick={closeForm}
            variant="contained"
            color="error"
          >
            CANCEL
          </Button>
        </div>
      </form>
    </div>
  );
}
export default FaqForm;
