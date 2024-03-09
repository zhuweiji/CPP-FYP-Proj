import { useEffect, useState } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";

// import EmptyResource from "../EmptyResource/EmptyResource";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ResponsiveAppBar from "../../../components/Nav";
import QuizQuestionForm from "../QuizQuestionForm/QuizQuestionForm";
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

  // if (courseId === "INVALID") {
  //   return <PageNotFound />;
  // }

  if (!questions) {
    return (
      <div className="center">
        <LoadingSpinner asOverlay />
      </div>
    );
  }

  async function submitQuiz(event) {
    event.preventDefault();
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
                // <div key={`qn-${idx}`}>Test</div>
                <QuizQuestionForm
                  key={`qn-${idx}`}
                  setQuestions={setQuestions}
                />
                // <Faq
                //   key={`qn-${idx}`}
                //   question={qn.question}
                //   answer={qn.answer}
                // />
              );
            })}
          </form>
        </div>
      </div>
    </div>
  );
}

export default QuizForm;
