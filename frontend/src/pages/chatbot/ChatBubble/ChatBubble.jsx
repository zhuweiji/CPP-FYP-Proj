import s from "./style.module.css";

import { CodeBlock, atomOneDark } from "react-code-blocks";

/**
 * Splits a block of code-containing text into its text and code components
 * @param {string} text
 * @returns {List} A list of objects with 3 properties: text, isCode and lang
 */
function extractCppCode(text) {
  const res = [];
  let prev = 0;
  let i = text.indexOf("```", prev);
  let isCode = false;
  let lang = null;

  while (i !== -1) {
    res.push({
      text: text.substring(prev, i),
      isCode: isCode,
      lang: lang,
    });

    // find the start of code-block or non-code-block
    prev = text.indexOf("\n", i) + 1;

    if (prev === -1) {
      return [
        {
          text: text,
          isCode: false,
          lang: null,
        },
      ];
    }

    lang = isCode ? null : text.substring(i + 3, prev).trim();
    isCode = !isCode;
    i = text.indexOf("```", prev);
  }

  // unclosed code (bad format); return original text
  if (isCode) {
    return [
      {
        text: text,
        isCode: false,
        lang: null,
      },
    ];
  }

  if (prev !== -1) {
    res.push({
      text: text.substring(prev),
      isCode: isCode,
      lang: lang,
    });
  }

  return res;
}

/*
  Here are 3 follow-up questions: 
  1. Can you initialize the `name` and `age` members of the `person1` object? 
  2. How would you create another object of the `Person` class using dynamic memory allocation? 
  3. How can you access the `name` member of the `person1` object?
*/
function extractFollowUpQns(text) {
  const res = Array(2);
  const i = text.indexOf("2 follow-up questions:");

  if (i === -1) {
    return {
      cutOff: -1,
      followUpQns: [],
    };
  }

  const indices = Array(2).fill(-1);

  indices[0] = text.indexOf("1.", i + 22);
  indices[1] = text.indexOf("2.", indices[0] + 3);

  if (indices[0] === -1 || indices[1] === -1) {
    return {
      cutOff: -1,
      followUpQns: [],
    };
  }

  res[0] = text.substring(indices[0] + 3, indices[1]).trim();
  res[1] = text.substring(indices[1] + 3).trim();
  // console.log(res);
  return {
    cutOff: i - 9,
    followUpQns: res,
  };
}

function partitionResponse(text) {
  const response = extractCppCode(text);
  const finalPartOfResponse = response[response.length - 1];
  // console.log(response);

  if (!finalPartOfResponse.isCode) {
    const followUpQnsData = extractFollowUpQns(finalPartOfResponse.text);

    if (followUpQnsData.cutOff === -1) {
      return {
        response: response,
        followUpQns: [],
      };
    }

    if (followUpQnsData.cutOff === 0) {
      // remove the final part if it only contained the follow-up questions
      response.pop();
    } else {
      finalPartOfResponse.text = finalPartOfResponse.text.substring(
        0,
        followUpQnsData.cutOff
      );
    }

    // console.log(response);
    // console.log(followUpQnsData.followUpQns);
    return {
      response: response,
      followUpQns: followUpQnsData.followUpQns,
    };

    // const res = {
    //   response: response,
    //   followUpQns: followUpQnsData,
    // };

    // console.log(res);
    // return res;
  }

  return {
    response: response,
    followUpQns: [],
  };
}

function ChatBubble(props) {
  const { chatter, text, setUsingCustomQuestion, setInputValue } = props;

  // text = testText;
  const { response, followUpQns } = partitionResponse(text);

  return (
    <div
      className={`${s.container} ${
        chatter === "You" ? s.user_bg : s.chatbot_bg
      }`}
    >
      <div>
        <h1 className={`${s.chatter}`}>{`${chatter}`}</h1>
        {response.map((block, idx) => {
          return block.isCode ? (
            <CodeBlock
              key={`block-${idx}`}
              text={block.text}
              language={block.lang}
              showLineNumbers={true}
              theme={atomOneDark}
            />
          ) : (
            <h2
              key={`block-${idx}`}
              className={`${s.text}`}
            >{`${block.text}`}</h2>
          );
        })}
        {followUpQns.map((qn, idx) => {
          return (
            <div
              key={`follow-up-${idx}`}
              className={`${s.follow_up}`}
              onClick={() => {
                setUsingCustomQuestion(true);
                setInputValue(qn);
              }}
            >
              {qn}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/*
  CodeBlock themes reference:
  https://github.com/rajinwonderland/react-code-blocks/blob/master/THEMES.md
*/

export default ChatBubble;
