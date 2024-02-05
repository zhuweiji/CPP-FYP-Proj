import s from "./style.module.css";

function ChatBubble(props) {
  const { chatter, text } = props;

  return (
    <div className={`${s.container}`}>
      <div>
        <h1 className={`${s.chatter}`}>{`${chatter}`}</h1>
        <h2 className={`${s.text}`}>{`${text}`}</h2>
      </div>
    </div>
  );
}

export default ChatBubble;
