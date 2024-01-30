import { useEffect, useState } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";

// import EmptyResource from "../EmptyResource/EmptyResource";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ResponsiveAppBar from "../../../components/Nav";
import QuizResource from "../QuizResource/QuizResource";
// import PageNotFound from "../../pages/PageNotFound/PageNotFound";

// CHECKPOINT
function FaqBrowse() {
  const { sendRequest } = useHttpClient();
  const [faqsData, setFaqsData] = useState();

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/faqs`
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setFaqsData(responseData);
      } catch (err) {
        // TODO: handle error when fetching from backend
        console.log(err.message);
      }
    };
    fetchFaqs();
  }, [sendRequest]);

  // if (courseId === "INVALID") {
  //   return <PageNotFound />;
  // }

  if (!faqsData) {
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
          <h1 className={s.section_title}>{`Quizzes`}</h1>
          <div>
            {!faqsData.quizzes || faqsData.quizzes.length === 0 ? (
              // <EmptyResource resourceType="quizzes" />
              <h4>Empty Resource</h4>
            ) : (
              faqsData.quizzes.map((quiz, idx) => {
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

export default FaqBrowse;
