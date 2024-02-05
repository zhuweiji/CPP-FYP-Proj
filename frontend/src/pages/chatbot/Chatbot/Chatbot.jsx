import { useState } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";

import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ResponsiveAppBar from "../../../components/Nav";
import ChatBubble from "../ChatBubble/ChatBubble";
import { Button } from "@mui/material";
import QuerySuggestion from "../QuerySuggestion/QuerySuggestions";

const dummyData = [
  {
    chatter: "You",
    text: "What is 1 + 1?",
  },
  {
    chatter: "Dan",
    text: "1 + 1 = 2",
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

  function chatSubmitHandler() {
    // TODO:
    // Add qn to chat history
    // send qn to BE for response generation
    // Add response to chat history
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
          />
          <div className={`${!usingCustomQuestion && s.hidden}`}>
            <textarea
              className={`${s.user_query}`}
              placeholder="Ask me a question about OOP or C++!"
              value={inputValue}
              onChange={inputChangeHandler}
            />
            <Button
              onClick={chatSubmitHandler}
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
