import s from "./style.module.css";

import { Link } from "react-router-dom";

function EmptyQuiz() {
  // TODO: replace bootstrap card with custom card
  return (
    <div className={`${s.container}`}>
      <div className={`card col-sm-12 col-md-8 col-lg-6`}>
        <div className="card-body">
          <h1 className={`card-title ${s.title}`}>{`No Questions Found`}</h1>
          <p
            className={`card-text ${s.message}`}
          >{`There are currently no questions available for this quiz. Come back in the near future!`}</p>
          <span className={`${s.home_link}`}>
            <Link to={`./../..`}>Back to Quizzes Page</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default EmptyQuiz;
