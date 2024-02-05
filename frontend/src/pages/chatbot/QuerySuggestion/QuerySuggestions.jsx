import { useState } from "react";
import s from "./style.module.css";

const dummyTopics = [
  "Encapsulation",
  "Abstraction",
  "Polymorphism",
  "Class",
  "Inheritance",
];

const dummyQuestions = {
  Encapsulation: [
    "Explain encapsulation.",
    "Why is encapsulation important in OOP?",
  ],
  Abstraction: [],
  Polymorphism: [],
  Class: [],
  Inheritance: [],
};

function QuerySuggestion(props) {
  const [currentTopic, setCurrentTopic] = useState("");
  const { usingCustomQuestion, setUsingCustomQuestion } = props;

  return (
    <div className={`${s.main_container}`}>
      <div>
        <h1 className={`${s.chatter}`}>{`Dan`}</h1>
        <h2 className={`${s.chatter_statement}`}>
          {usingCustomQuestion
            ? "Go ahead and ask your question! If you change your mind, h"
            : "H"}
          {currentTopic === ""
            ? "ere are some topic suggestions."
            : `ere are some question suggestions for ${currentTopic}.`}
        </h2>
      </div>
      <div className={`${s.suggestions_container}`}>
        {currentTopic === "" ? (
          <>
            {dummyTopics.map((topic, idx) => {
              return (
                <div
                  key={`topic-${idx}`}
                  className={`${s.topic_outer_container}`}
                >
                  <div
                    className={`${s.topic_inner_container}`}
                    onClick={() => {
                      setCurrentTopic(topic);
                    }}
                  >
                    {topic}
                  </div>
                </div>
              );
            })}
            <div className={`${s.topic_outer_container}`}>
              <div
                className={`${s.other_button}`}
                onClick={() => {
                  setUsingCustomQuestion(true);
                }}
              >
                Other
              </div>
            </div>
          </>
        ) : (
          <>
            {dummyQuestions[currentTopic].map((qn, idx) => {
              return (
                <div
                  key={`qn-${idx}`}
                  className={`${s.question_outer_container}`}
                >
                  <div
                    className={`${s.question_inner_container}`}
                    onClick={() => {
                      console.log("test");
                    }}
                  >
                    {qn}
                  </div>
                </div>
              );
            })}
            <div className={`${s.question_outer_container}`}>
              <div
                className={`${s.custom_question_button}`}
                onClick={() => {
                  setUsingCustomQuestion(true);
                }}
              >
                I have a different question
              </div>
            </div>
            <div className={`${s.question_outer_container}`}>
              <div
                className={`${s.back_to_suggestions_button}`}
                onClick={() => {
                  setCurrentTopic("");
                }}
              >
                Back To Topic Suggestion
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default QuerySuggestion;
