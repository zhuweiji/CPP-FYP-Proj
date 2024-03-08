import React, { useState } from "react";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";
import UserDataService from "../../../services/UserService";

function RatingForm(props) {
  const { isOpen, closeForm, resourceId, resourceType } = props;
  const { sendRequest } = useHttpClient();
  const [rating, setRating] = useState(0);

  async function saveSettingsHandler(event) {
    event.preventDefault();
    let responseData;
    let response;

    try {
      response = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/resource-ratings/`,
        "POST",
        JSON.stringify({
          user_id: UserDataService.getUserId(),
          resource_id: resourceId,
          rating: rating,
          resource_type: resourceType,
        }),
        {
          "Content-Type": "application/json",
        }
      );

      responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail);
      }
      alert("Rating submitted successfully");
      closeForm();
      window.location.reload(false);
    } catch (err) {
      console.log(err.message);
      console.log("status code" + response.status);
      alert("An error occurred. Please try again later.-");
      closeForm();
    }
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
              name="resource-rating"
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
