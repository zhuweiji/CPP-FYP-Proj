import { useCallback, useEffect, useState } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";

// import EmptyResource from "../EmptyResource/EmptyResource";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ResponsiveAppBar from "../../../components/Nav";
import QuizQuestionForm from "../QuizQuestionForm/QuizQuestionForm";
import { Button } from "@mui/material";
import { json } from "react-router-dom";
// import QuizResource from "../QuizResource/QuizResource";
// import PageNotFound from "../../pages/PageNotFound/PageNotFound";

function QuizForm() {
  const { sendRequest } = useHttpClient();
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([{}]);

  const validateInputs = useCallback(() => {
    if (!quizTitle) {
      return "Quiz Title is empty";
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].title) {
        return `Question ${i + 1} is empty`;
      } else if (questions[i].options.length < 2) {
        return `Question ${i + 1} has only 1 option`;
      } else if (questions[i].solution.length === 0) {
        return `Question ${i + 1} has no solution`;
      }

      for (const option of questions[i].options) {
        if (!option) {
          return `Question ${i + 1} has one or more blank options`;
        }
      }

      for (const sln of questions[i].solution) {
        if (sln < 0 || sln >= questions[i].options.length) {
          return `Question ${i + 1} has one or more invalid solutions`;
        }
      }

      return "";
    }
  }, [questions, quizTitle]);

  async function submitQuiz() {
    // event.preventDefault();
    const message = validateInputs();
    if (message) {
      alert(message);
      return;
    }

    const formData = new FormData();
    formData.append("title", quizTitle);

    const questionsData = questions.map((qn) => {
      if (qn.imageFile) {
        qn.hasFile = true;
        formData.append("file_list", qn.imageFile);
      } else {
        qn.hasFile = false;
      }
      qn.imageFile = "";
      qn.questionType = qn.questionType === "0" ? "radio" : "checkbox";
      return qn;
    });
    formData.append("questions_data", JSON.stringify(questionsData));

    try {
      const response = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/quizzes/create-whole`,
        "POST",
        formData
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.detail);
      } else {
        alert("Your contribution has been uploaded! Thank you!");
        window.location.reload(false); // reload
        // setFormState({
        //   title: "",
        //   description: "",
        //   resourceType: "0",
        //   uploadType: "0",
        //   link: "",
        //   file: null,
        // });
      }
    } catch (err) {
      // console.log(err.message);
      alert(err.message);
      window.location.reload(false); // reload
    }
  }

  return (
    <div>
      <ResponsiveAppBar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className={`${s.container}`}>
          <h1 className={s.section_title}>{`Create Quiz`}</h1>
          <form onSubmit={submitQuiz}>
            {/* The title input */}
            <div className={`${s.title_container}`}>
              <h1 className={`${s.label}`}>Title</h1>
              <input
                id="title"
                type="text"
                placeholder="Title"
                className={`${s.form_input}`}
                value={quizTitle}
                onChange={(event) => {
                  setQuizTitle(event.target.value);
                }}
              />
            </div>
            {questions.map((qn, idx) => {
              return (
                <QuizQuestionForm
                  questionIdx={idx}
                  key={`qn-${idx}`}
                  setQuestions={setQuestions}
                />
              );
            })}
            <div
              title="add another question"
              className={`${s.add_qn_btn}`}
              onClick={() => {
                setQuestions((prev) => {
                  return [
                    ...prev,
                    {
                      title: "",
                      options: [],
                      solution: [],
                      score: 1,
                      questionType: "radio",
                      imageLink: "",
                      imageFile: null,
                    },
                  ];
                });
              }}
            >
              +
            </div>
            <div className={`${s.submit_btn_container}`}>
              <Button variant="contained" color="success" onClick={submitQuiz}>
                SUBMIT
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default QuizForm;
