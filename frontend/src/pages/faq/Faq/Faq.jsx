import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import s from "./style.module.css";

function Faq(props) {
  const { question, answer, topic, topicId, id, openForm, removeFaq } = props;

  return (
    <div className={`${s.container}`}>
      <h1 className={`${s.faq_question}`}>{`Topic: ${topic}`}</h1>
      <h1 className={`${s.faq_question}`}>{`Q: ${question}`}</h1>
      <h2 className={`${s.faq_answer}`}>{`A: ${answer}`}</h2>
      <div className={`${s.icons_container}`}>
        <EditIcon
          className={`${s.icon}`}
          titleAccess="edit"
          onClick={openForm}
        />
        <DeleteIcon
          className={`${s.icon}`}
          titleAccess="delete"
          onClick={() => {
            removeFaq(id);
          }}
        />
      </div>
    </div>
  );
}

export default Faq;
