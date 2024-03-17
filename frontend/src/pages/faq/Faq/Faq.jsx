import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import s from "./style.module.css";
import UserDataService from "../../../services/UserService";
import DeleteConfirmation from "../../../components/DeleteConfirmation/DeleteConfirmation";
import { useState } from "react";

function Faq(props) {
  const { question, answer, topic, topicId, id, openForm, removeFaq } = props;
  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);

  const isAdmin = UserDataService.getUserPrivilege() === "admin";

  return (
    <div className={`${s.container}`}>
      <DeleteConfirmation
        isOpen={deleteConfirmationIsOpen}
        closeForm={() => {
          setDeleteConfirmationIsOpen(false);
        }}
        triggerDelete={() => {
          removeFaq(id);
        }}
        message={
          "Are you sure you want to delete this? This action cannot be undone"
        }
      />
      <h1 className={`${s.faq_question}`}>{`Topic: ${topic}`}</h1>
      <h1 className={`${s.faq_question}`}>{`Q: ${question}`}</h1>
      <h2 className={`${s.faq_answer}`}>{`A: ${answer}`}</h2>
      {isAdmin && (
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
              setDeleteConfirmationIsOpen(true);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Faq;
