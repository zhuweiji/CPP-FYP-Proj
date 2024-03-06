import React, { useState } from "react";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";

function RatingForm(props) {
  const { isOpen, closeForm } = props;
  const { sendRequest } = useHttpClient();
  const [rating, setRating] = useState(0);

  async function saveSettingsHandler(event) {
    event.preventDefault();

    // TODO: save to DB via BE
  }

  return (
    <>
      <div className={`${s.modal} ${!isOpen && s.hidden}`}>
        <button className={`${s.close_modal}`} onClick={closeForm}>
          &times;
        </button>

        <form onSubmit={saveSettingsHandler}>
          <div className={`${s.input_container}`}>
            <Rating
              size="large"
              name="simple-controlled"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
            />
          </div>

          <div className={`${s.button_container}`}>
            <Button type="submit" variant="contained" size="small">
              SAVE
            </Button>
          </div>
        </form>
      </div>

      {/* Background Blurrer */}
      <div className={`${s.overlay} ${!isOpen && s.hidden}`}></div>
    </>
  );
}

export default RatingForm;
