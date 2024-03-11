import { useEffect, useState } from "react";

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
  const [questions, setQuestions] = useState([
    {},
    // {
    //   title: "",
    //   options: [],
    //   solution: [],
    //   score: "1",
    //   questionType: "0",
    //   imageLink: "",
    //   imageFile: null,
    // },
  ]);

  async function submitQuiz(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", quizTitle);

    // const questionTitleList = [];
    // const optionsList = [];
    // const questionTypeList = [];
    // const scoreList = [];
    // const solutionList = [];
    // const fileList = [];
    // const hasFileList = [];

    // for (const question of questions) {
    //   questionTitleList.push(question.title);
    //   optionsList.push(question.options);
    //   questionTypeList.push(
    //     question.questionType === "0" ? "radio" : "checkbox"
    //   );
    //   scoreList.push(question.score);
    //   solutionList.push(question.solution);

    //   if (question.imageFile) {
    //     formData.append("file_list", question.imageFile);
    //     fileList.push(question.imageFile);
    //     hasFileList.push(true);
    //   } else {
    //     hasFileList.push(false);
    //   }
    // }

    const questionsData = questions.map((qn) => {
      if (qn.imageFile) {
        qn.hasFile = true;
        // fileList.push(qn.imageFile);
        formData.append("file_list", qn.imageFile);
      } else {
        qn.hasFile = false;
      }
      qn.imageFile = "";
      qn.questionType = qn.questionType === "0" ? "radio" : "checkbox";
      return qn;
    });
    formData.append("questions_data", JSON.stringify(questionsData));

    // formData.append("question_title_list", JSON.stringify(questionTitleList));
    // formData.append("options_list", JSON.stringify(optionsList));
    // formData.append("question_type_list", JSON.stringify(questionTypeList));
    // formData.append("score_list", JSON.stringify(scoreList));
    // formData.append("solution_list", JSON.stringify(solutionList));
    // formData.append("has_file_list", JSON.stringify(hasFileList));

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
        console.log("done done");
        // alert("Your contribution has been uploaded! Thank you!");
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
      console.log(err.message);
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
