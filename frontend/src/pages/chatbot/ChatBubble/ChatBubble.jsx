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

function ChatBubble(props) {
  const { chatter, text } = props;

  return (
    <div
      className={`${s.container} ${
        chatter === "You" ? s.user_bg : s.chatbot_bg
      }`}
    >
      <div>
        <h1 className={`${s.chatter}`}>{`${chatter}`}</h1>
        {extractCppCode(text).map((block, idx) => {
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
      </div>
    </div>
  );
}

/*
  CodeBlock themes reference:
  https://github.com/rajinwonderland/react-code-blocks/blob/master/THEMES.md
*/

export default ChatBubble;
