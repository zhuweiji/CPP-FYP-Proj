import AddCommentIcon from "@mui/icons-material/AddComment";
import ThumbsUpDownIcon from "@mui/icons-material/ThumbsUpDown";

import s from "./style.module.css";
import RatingForm from "../RatingForm/RatingForm";
import { useState } from "react";

import UserDataService from "../../../services/UserService";

function ResourceActions(props) {
  const { resourceId, resourceType } = props;

  const [ratingFormIsOpen, setRatingFormIsOpen] = useState(false);

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
      <ThumbsUpDownIcon
        onClick={() => {
          UserDataService.isLoggedIn()
            ? setRatingFormIsOpen(true)
            : alert("You must log in to submit a rating!");
        }}
        titleAccess="rate"
        fontSize="medium"
        sx={{ margin: "0 15px" }}
        className={`${s.icon}`}
      />
      <AddCommentIcon
        titleAccess="leave a comment"
        fontSize="medium"
        className={`${s.icon}`}
      />
    </div>
  );
}

export default ResourceActions;
