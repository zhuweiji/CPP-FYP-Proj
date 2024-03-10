import { useEffect, useState } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";

// import EmptyResource from "../EmptyResource/EmptyResource";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ResponsiveAppBar from "../../../components/Nav";
import QuizQuestionForm from "../QuizQuestionForm/QuizQuestionForm";
import { Button } from "@mui/material";
// import QuizResource from "../QuizResource/QuizResource";
// import PageNotFound from "../../pages/PageNotFound/PageNotFound";

function QuizForm() {
  const { sendRequest } = useHttpClient();
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    {
      title: "",
      options: [],
      solution: [],
      score: 1,
      questionType: "radio",
      imageLink: "",
      imageFile: null,
    },
  ]);

  async function submitQuiz(event) {
    event.preventDefault();

    console.log(questions);
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
              <Button type="submit" variant="contained" color="success">
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
