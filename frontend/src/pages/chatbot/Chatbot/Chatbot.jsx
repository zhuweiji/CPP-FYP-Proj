import { useState } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";

import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ResponsiveAppBar from "../../../components/Nav";
import ChatBubble from "../ChatBubble/ChatBubble";
import { Button } from "@mui/material";
import QuerySuggestion from "../QuerySuggestion/QuerySuggestions";

const dummyData = [
  // {
  //   chatter: "You",
  //   text: "What is 1 + 1?",
  // },
  {
    chatter: "Dan",
    text: "Hi! I am Dan, and I'm here to assist you with queries relating to C++ and OOP.",
  },
];

function Chatbot() {
  const { sendRequest } = useHttpClient();
  const [chatHistory, setChatHistory] = useState(dummyData);
  const [inputValue, setInputValue] = useState("");
  const [usingCustomQuestion, setUsingCustomQuestion] = useState(false);

  function inputChangeHandler(e) {
    setInputValue(e.target.value);
  }

  async function chatSubmitHandler(userPrompt) {
    // TODO:
    // Add qn to chat history
    // send qn to BE for response generation
    // Add response to chat history

    try {
      console.log(userPrompt);
      const response = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/chatbot/generate`,
        "POST",
        JSON.stringify({
          user_prompt: userPrompt,
        }),
        {
          "Content-Type": "application/json",
        }
      );

      const responseData = await response.json();

      console.log(responseData);

      if (!response.ok) {
        throw new Error(responseData.message);
      }

      addToChatHistory("Dan", responseData.answer);
    } catch (err) {
      // TODO: handle error when fetching from backend
      console.log(err.message);
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
                />
              );
            })}
          </div>
          <QuerySuggestion
            usingCustomQuestion={usingCustomQuestion}
            setUsingCustomQuestion={setUsingCustomQuestion}
            addToChatHistory={addToChatHistory}
          />
          <div className={`${!usingCustomQuestion && s.hidden}`}>
            <textarea
              className={`${s.user_query}`}
              placeholder="Ask me a question about OOP or C++!"
              value={inputValue}
              onChange={inputChangeHandler}
              maxLength={200}
            />
            <Button
              onClick={() => {
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
