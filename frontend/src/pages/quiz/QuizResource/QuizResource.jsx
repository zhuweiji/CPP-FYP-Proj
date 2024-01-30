import { Link } from "react-router-dom";

import s from "./style.module.css";

function QuizResource(props) {
  const { title, quizId, idx } = props;

  return (
    <div className={`${s.container}`}>
      <div>
        <h1 className={`${s.quiz_title}`}>{`${idx + 1}. ${title}`}</h1>
        <span className={`${s.quiz_link}`}>
          <Link to={`../quiz/${quizId}`}>{`Try the quiz!`}</Link>
        </span>
      </div>
    </div>
  );
}

export default QuizResource;
