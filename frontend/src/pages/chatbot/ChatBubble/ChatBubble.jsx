import s from "./style.module.css";

import { CodeBlock, atomOneDark } from "react-code-blocks";

// const cppCode =
//   "Here is an example of a simple class in Python:\n\n```python\nclass Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n    \n    def area(self):\n        return self.width * self.height\n    \n    def perimeter(self):\n        return 2 * (self.width + self.height)\n```\n\nIn this example, we have defined a class called `Rectangle`. It has two attributes: `width` and `height`, which are initialized in the constructor method `__init__`. \n\nThe class also has two methods: `area` and `perimeter`. The `area` method calculates and returns the area of the rectangle by multiplying its width and height. The `perimeter` method calculates and returns the perimeter of the rectangle by adding twice its width and height.\n\nTo create an instance of this class and use its methods, we can do the following:\n\n```python\n# Create a rectangle object with width 5 and height 3\nmy_rectangle = Rectangle(5, 3)\n\n# Call the area method\nprint(my_rectangle.area())  # Output: 15\n\n# Call the perimeter method\nprint(my_rectangle.perimeter())  # Output: 16\n```\n\nIn this example, we create an instance of the `Rectangle` class called `my_rectangle` with a width of 5 and height of 3. We then call the `area` and `perimeter` methods on `my_rectangle` to calculate and print the area and perimeter of the rectangle.";

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
