import s from "./style.module.css";

function Faq(props) {
  const { question, answer } = props;

  return (
    <div className={`${s.container}`}>
      <div>
        <h1 className={`${s.faq_question}`}>{`Q: ${question}`}</h1>
        <h2 className={`${s.faq_answer}`}>{`A: ${answer}`}</h2>
      </div>
    </div>
  );
}

export default Faq;
