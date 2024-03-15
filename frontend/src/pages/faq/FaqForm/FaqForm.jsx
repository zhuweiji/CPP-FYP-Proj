import Button from "@mui/material/Button";
import { useState } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";

function FaqForm(props) {
  const { question, answer, topic, topicId, id, closeForm } = props;
  const [errorMessage, setErrorMessage] = useState("");
  const { sendRequest } = useHttpClient();
  const [formState, setFormState] = useState({
    question: question,
    answer: answer,
    topic: topic,
    id: id,
  });

  async function formSubmitHandler(event) {
    // if (!UserDataService.isLoggedIn()) {
    //   alert("You must log in to contribute!");
    //   return;
    // }
    // setErrorMessage("");
    // event.preventDefault();
    // const formData = new FormData();
    // formData.append("title", formState.title);
    // if (formState.resourceType === "0" || formState.resourceType === "3") {
    //   formData.append("description", formState.description);
    // }
    // formData.append("link", formState.link);
    // if (formState.resourceType !== "3") {
    //   formData.append("file", formState.file);
    // }
    // try {
    //   const resourcePath = resourcePaths[Number(formState.resourceType)];
    //   const response = await sendRequest(
    //     `${process.env.REACT_APP_BACKEND_URL}/${resourcePath}/create`,
    //     "POST",
    //     formData
    //   );
    //   const responseData = await response.json();
    //   if (!response.ok) {
    //     throw new Error(responseData.detail);
    //     // console.log(responseData.message);
    //   } else {
    //     alert("Your contribution has been uploaded! Thank you!");
    //     setFormState({
    //       title: "",
    //       description: "",
    //       resourceType: "0",
    //       uploadType: "0",
    //       link: "",
    //       file: null,
    //     });
    //   }
    // } catch (err) {
    //   console.log(err.message);
    // }
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
