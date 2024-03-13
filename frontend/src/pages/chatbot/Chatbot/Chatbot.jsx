import { useState } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";

import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ResponsiveAppBar from "../../../components/Nav";
import ChatBubble from "../ChatBubble/ChatBubble";
import { Button } from "@mui/material";
import QuerySuggestion from "../QuerySuggestion/QuerySuggestions";

const chatbotName = "Dan";

const chatbotIntro = [
  {
    chatter: chatbotName,
    text: `Hi! I am ${chatbotName}, and I'm here to assist you with queries relating to C++ and OOP.`,
  },
];

function Chatbot() {
  const { sendRequest } = useHttpClient();
  const [chatHistory, setChatHistory] = useState(chatbotIntro);
  const [inputValue, setInputValue] = useState("");
  const [usingCustomQuestion, setUsingCustomQuestion] = useState(false);

  // set to the topic the user selects from the suggested topics, or null if none is selected
  const [currentTopic, setCurrentTopic] = useState(null);

  // isLoading is true when awaiting Dan's response from the backend
  const [isLoading, setIsLoading] = useState(false);

  // set to true until the first valid GPT response is received from the backend
  const [isFirstPrompt, setIsFirstPrompt] = useState(true);

  // set to true until the the first valid GPT or hard-coded response is received from the backend
  const [isFirstQuestion, setIsFirstQuestion] = useState(true);

  function inputChangeHandler(e) {
    setInputValue(e.target.value);
  }

  async function chatSubmitHandler(userPrompt) {
    let responseData;
    let response;

    // addToChatHistory(chatbotName, testText);
    // setIsFirstPrompt(false);
    // setIsFirstQuestion(false);
    // setIsLoading(false);
    // setCurrentTopic(null);
    // setUsingCustomQuestion(false);
    // setInputValue("");
    // return;

    try {
      response = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/chatbot/generate`,
        "POST",
        JSON.stringify({
          user_prompt: userPrompt,
          is_first_prompt: isFirstPrompt,
        }),
        {
          "Content-Type": "application/json",
        }
      );

      responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail);
      }

      // console.log(responseData.answer);
      addToChatHistory(chatbotName, responseData.answer);
      setIsFirstPrompt(false);
      setIsFirstQuestion(false);
    } catch (err) {
      console.log(err.message);
      if (response.status === 429) {
        addToChatHistory(
          chatbotName,
          "Too many requests! Try again in a while."
        );
      } else if (response.status >= 500) {
        addToChatHistory(
          chatbotName,
          "An unknown error has occurred :( Do try again in the near future!"
        );
      }
    } finally {
      setIsLoading(false);
      setCurrentTopic(null);
      setUsingCustomQuestion(false);
      setInputValue("");
    }
  }

  function addToChatHistory(chatter, text) {
    setChatHistory((prev) => {
      return [
        ...prev,
        {
          chatter: chatter,
          text: text,
        },
      ];
    });
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
          <h1 className={s.section_title}>{`Chatbot`}</h1>
          <div>
            {chatHistory.map((item, idx) => {
              return (
                <ChatBubble
                  key={`faq-${idx}`}
                  chatter={item.chatter}
                  text={item.text}
                  setUsingCustomQuestion={setUsingCustomQuestion}
                  setInputValue={setInputValue}
                />
              );
            })}
          </div>
          {!isLoading && (
            <QuerySuggestion
              usingCustomQuestion={usingCustomQuestion}
              setUsingCustomQuestion={setUsingCustomQuestion}
              addToChatHistory={addToChatHistory}
              currentTopic={currentTopic}
              setCurrentTopic={setCurrentTopic}
              isFirstQuestion={isFirstQuestion}
              setIsFirstQuestion={setIsFirstQuestion}
              chatbotName={chatbotName}
            />
          )}
          <div className={`${!usingCustomQuestion && s.hidden}`}>
            <textarea
              className={`${s.user_query}`}
              placeholder="Ask me a question about OOP or C++!"
              value={inputValue}
              onChange={inputChangeHandler}
              maxLength={200}
              rows={5}
            />
            <Button
              onClick={() => {
                setIsLoading(true);
                addToChatHistory("You", inputValue);
                chatSubmitHandler(inputValue);
              }}
              size="medium"
              className={`${s.button}`}
              variant="contained"
            >
              GO
            </Button>
          </div>

          {/* <form className={`${s.chat_form}`} onSubmit={chatSubmitHandler}>
            
          </form> */}
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
