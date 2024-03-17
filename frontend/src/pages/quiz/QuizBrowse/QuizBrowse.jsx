import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";

// import EmptyResource from "../EmptyResource/EmptyResource";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ResponsiveAppBar from "../../../components/Nav";
import QuizResource from "../QuizResource/QuizResource";
// import PageNotFound from "../../pages/PageNotFound/PageNotFound";

function QuizBrowse() {
  const { sendRequest } = useHttpClient();
  const [quizzesData, setQuizzesData] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // get relevant data for the current course
        const response = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/quizzes`
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setQuizzesData(responseData);
      } catch (err) {
        // TODO: handle error when fetching from backend
        console.log(err.message);
      }
    };
    fetchQuizzes();
  }, [sendRequest]);

  // if (courseId === "INVALID") {
  //   return <PageNotFound />;
  // }

  if (!quizzesData) {
    return (
      <div className="center">
        <LoadingSpinner asOverlay />
      </div>
    );
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
          <h4 className={s.section_title}>{`Quizzes`}</h4>
          <div>
            <div
              title="add a Quiz"
              className={`${s.add_quiz_btn}`}
              onClick={() => {
                navigate("./create");
              }}
            >
              +
            </div>
            {!quizzesData.quizzes || quizzesData.quizzes.length === 0 ? (
              // <EmptyResource resourceType="quizzes" />
              <h4>Empty Resource</h4>
            ) : (
              quizzesData.quizzes.map((quiz, idx) => {
                return (
                  <QuizResource
                    idx={idx}
                    key={`quiz-${idx}`}
                    title={quiz.title}
                    quizId={quiz.id}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizBrowse;
