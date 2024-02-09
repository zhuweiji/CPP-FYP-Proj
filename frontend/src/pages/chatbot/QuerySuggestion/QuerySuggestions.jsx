import { useState, useEffect, useCallback } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";

// const topicsData = [
//   "Encapsulation",
//   "Abstraction",
//   "Polymorphism",
//   "Class",
//   "Inheritance",
// ];

// const dummyQuestions = {
//   Encapsulation: [
//     "Explain encapsulation.",
//     "Why is encapsulation important in OOP?",
//   ],
//   Abstraction: [],
//   Polymorphism: [],
//   Class: [],
//   Inheritance: [],
// };

function QuerySuggestion(props) {
  const { sendRequest } = useHttpClient();
  const [topicsData, setTopicsData] = useState();
  const [queriesData, setQueriesData] = useState({});
  const {
    usingCustomQuestion,
    setUsingCustomQuestion,
    addToChatHistory,
    currentTopic,
    setCurrentTopic,
    isFirstQuestion,
    setIsFirstQuestion,
    chatbotName,
  } = props;

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/chat-topics`
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setTopicsData(responseData);
      } catch (err) {
        // TODO: handle error when fetching from backend
        console.log(err.message);
      }
    };
    fetchTopics();
  }, [sendRequest]);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const response = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/chat-queries/${currentTopic.id}`
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.detail);
        }

        setQueriesData((prev) => {
          return {
            ...prev,
            [currentTopic.title]: responseData.queries,
          };
        });
      } catch (err) {
        // TODO: handle error when fetching from backend
        console.log(err.message);
      }
    };

    // fetch data only if not fetched previously
    if (currentTopic && !queriesData[currentTopic.title]) {
      fetchQueries();
    }
  }, [currentTopic, sendRequest]);

  const determineAppropriatePrompt = useCallback(() => {
    let prompt = "";

    if (usingCustomQuestion) {
      prompt += "Go ahead and ask your question! If you change your mind, ";
      if (currentTopic) {
        prompt += `here are some question suggestions for ${currentTopic.title}.`;
      } else {
        prompt += "here are some topic suggestions.";
      }
    } else {
      if (currentTopic) {
        prompt += "Excellent topic! Here are some question suggestions";
      } else {
        if (isFirstQuestion) {
          prompt += "Not sure what to ask? ";
        } else {
          prompt += "Have another question? ";
        }
        prompt += "Here are some topic suggestions";
      }
    }

    return prompt;
  }, [usingCustomQuestion, currentTopic, isFirstQuestion]);

  return (
    <div className={`${s.main_container} ${s.chatbot_bg}`}>
      <div>
        <h1 className={`${s.chatter}`}>{chatbotName}</h1>
        <h2 className={`${s.chatter_statement}`}>
          {determineAppropriatePrompt()}
        </h2>
      </div>
      <div className={`${s.suggestions_container}`}>
        {!currentTopic ? (
          <>
            {topicsData && topicsData.topics ? (
              topicsData.topics.map((topic, idx) => {
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
                      {topic.title}
                    </div>
                  </div>
                );
              })
            ) : (
              <h1 className={`${s.loading_message}`}>
                Please wait while topics are loading...
              </h1>
            )}
            {topicsData && topicsData.topics && !usingCustomQuestion && (
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
            )}
          </>
        ) : (
          <>
            {queriesData &&
              queriesData[currentTopic.title] &&
              queriesData[currentTopic.title].map((query, idx) => {
                return (
                  <div
                    key={`qn-${idx}`}
                    className={`${s.question_outer_container}`}
                  >
                    <div
                      className={`${s.question_inner_container}`}
                      onClick={() => {
                        addToChatHistory("You", query.question);
                        addToChatHistory(chatbotName, query.answer);
                        setCurrentTopic(null);
                        setUsingCustomQuestion(false);
                        setIsFirstQuestion(false);
                      }}
                    >
                      {query.question}
                    </div>
                  </div>
                );
              })}
            {!usingCustomQuestion && (
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
            )}
            <div className={`${s.question_outer_container}`}>
              <div
                className={`${s.back_to_suggestions_button}`}
                onClick={() => {
                  setCurrentTopic(null);
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
