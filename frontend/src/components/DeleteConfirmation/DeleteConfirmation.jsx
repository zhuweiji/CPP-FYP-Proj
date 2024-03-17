import React, { useState } from "react";
import Button from "@mui/material/Button";

import s from "./style.module.css";
import UserDataService from "../../services/UserService";

function DeleteConfirmation(props) {
  const { isOpen, closeForm, triggerDelete, message } = props;

  return (
    <>
      <div className={`${s.modal} ${!isOpen && s.hidden}`}>
        <button className={`${s.close_modal}`} onClick={closeForm}>
          &times;
        </button>

        <h1 className={`${s.delete_title}`}>Confirm to Delete</h1>
        <h2 className={`${s.delete_message}`}>{message}</h2>
        <div className={`${s.buttons_container}`}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              triggerDelete();
            }}
            size="small"
          >
            DELETE
          </Button>
          <Button variant="outlined" onClick={closeForm} size="small">
            CANCEL
          </Button>
        </div>
      </div>

      {/* Background Blurrer */}
      <div className={`${s.overlay} ${!isOpen && s.hidden}`}></div>
    </>
  );
}

export default DeleteConfirmation;
