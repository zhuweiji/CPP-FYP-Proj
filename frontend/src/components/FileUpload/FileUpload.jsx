import React, { useEffect, useRef, useState } from "react";

import { Button } from "@mui/material";
import s from "./style.module.css";

function FileUpload(props) {
  const { onInput, validExtensions } = props;
  const [file, setFile] = useState();
  const [isValid, setIsValid] = useState(false);

  const filePickerRef = useRef();

  const pickedHandler = (event) => {
    let pickedFile;
    let fileIsValid = isValid;

    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0]; // get the file uploaded by user
      setFile(pickedFile);
      console.log(pickedFile);
      fileIsValid = true;
    } else {
      fileIsValid = false;
    }

    setIsValid(fileIsValid);
    if (fileIsValid) {
      onInput(pickedFile);
    }
  };

  const pickImageHandler = () => {
    filePickerRef.current.click();
  };

  return (
    <div className={s.form_control}>
      <input
        id={props.id}
        ref={filePickerRef}
        style={{ display: "none" }}
        type="file"
        accept={validExtensions}
        onChange={pickedHandler}
      />
      <div>
        <Button variant="contained" onClick={pickImageHandler}>
          PICK FILE
        </Button>
        <h2 className={`${s.file_name}`}>
          {isValid ? file.name : "No file selected"}
        </h2>
      </div>
    </div>
  );
}

export default FileUpload;
