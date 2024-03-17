import AddCommentIcon from "@mui/icons-material/AddComment";
import ThumbsUpDownIcon from "@mui/icons-material/ThumbsUpDown";
import DeleteIcon from "@mui/icons-material/Delete";

import s from "./style.module.css";
import RatingForm from "../RatingForm/RatingForm";
import { useState } from "react";

import UserDataService from "../../../services/UserService";
import { useNavigate } from "react-router-dom";
import DeleteConfirmation from "../../../components/DeleteConfirmation/DeleteConfirmation";

function ResourceActions(props) {
  const { resourceId, resourceType, triggerDelete } = props;
  const navigate = useNavigate();

  const [ratingFormIsOpen, setRatingFormIsOpen] = useState(false);
  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);

  const showDelete = UserDataService.getUserPrivilege() === "admin";

  return (
    <div className={`${s.main_container}`}>
      <RatingForm
        resourceId={resourceId}
        resourceType={resourceType}
        isOpen={ratingFormIsOpen}
        closeForm={() => {
          setRatingFormIsOpen(false);
        }}
      />
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
      <ThumbsUpDownIcon
        onClick={() => {
          UserDataService.isLoggedIn()
            ? setRatingFormIsOpen(true)
            : alert("You must log in to submit a rating!");
        }}
        titleAccess="rate"
        fontSize="medium"
        className={`${s.icon}`}
      />
      <AddCommentIcon
        onClick={() => {
          localStorage.setItem("cppFyp-resource-type", resourceType);
          navigate(`./comment/${resourceId}`);
        }}
        titleAccess="leave a comment"
        fontSize="medium"
        sx={{ margin: "0 15px" }}
        className={`${s.icon}`}
      />
      {showDelete && (
        <DeleteIcon
          className={`${s.icon}`}
          titleAccess="delete"
          onClick={() => {
            setDeleteConfirmationIsOpen(true);
          }}
        />
      )}
    </div>
  );
}

export default ResourceActions;
