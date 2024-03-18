import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";

import s from "./style.module.css";
import DeleteConfirmation from "../../../components/DeleteConfirmation/DeleteConfirmation";
import UserDataService from "../../../services/UserService";
import { useHttpClient } from "../../../hooks/http-hook";

function QuizResource(props) {
  const { title, quizId, idx } = props;
  const { sendRequest } = useHttpClient();
  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);
  const [toDelete, setToDelete] = useState(false);

  const showDelete = UserDataService.getUserPrivilege() === "admin";

  const triggerDelete = useCallback(() => {
    setToDelete(true);
  }, []);

  useEffect(() => {
    const deleteResource = async () => {
      try {
        const response = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/quizzes/${quizId}`,
          "DELETE",
          JSON.stringify({
            user_id: UserDataService.getUserId(),
          }),
          {
            "Content-Type": "application/json",
          }
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.detail);
        }

        alert("Quiz successfully deleted");
        window.location.reload(false); // reload to see changes
      } catch (err) {
        alert(err.message);
      }
    };
    if (toDelete) {
      deleteResource();
    }
  }, [sendRequest, toDelete, quizId]);

  return (
    <div className={`${s.container}`}>
      <div>
        <h1 className={`${s.quiz_title}`}>{`${idx + 1}. ${title}`}</h1>
        <span className={`${s.quiz_link}`}>
          <Link to={`quiz/${quizId}`}>{`Try the quiz!`}</Link>
        </span>
        {showDelete && (
          <>
            <DeleteConfirmation
              isOpen={deleteConfirmationIsOpen}
              closeForm={() => {
                setDeleteConfirmationIsOpen(false);
              }}
              triggerDelete={triggerDelete}
              message={
                "Are you sure you want to delete this? This action cannot be undone"
              }
            />
            <div className={`${s.icon_container}`}>
              <DeleteIcon
                className={`${s.icon}`}
                titleAccess="delete"
                onClick={() => {
                  setDeleteConfirmationIsOpen(true);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default QuizResource;
