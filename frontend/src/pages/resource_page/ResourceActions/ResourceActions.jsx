import AddCommentIcon from "@mui/icons-material/AddComment";
import ThumbsUpDownIcon from "@mui/icons-material/ThumbsUpDown";

import s from "./style.module.css";
import RatingForm from "../RatingForm/RatingForm";
import { useState } from "react";

function ResourceActions(props) {
  const { resourceId } = props;

  const [ratingFormIsOpen, setRatingFormIsOpen] = useState(false);

  return (
    <div className={`${s.main_container}`}>
      <RatingForm
        isOpen={ratingFormIsOpen}
        closeForm={() => {
          setRatingFormIsOpen(false);
        }}
      />
      <ThumbsUpDownIcon
        onClick={() => {
          setRatingFormIsOpen(true);
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
