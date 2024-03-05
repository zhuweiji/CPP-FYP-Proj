import React, { useState } from "react";

import { Button } from "@mui/material";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";
import FileUpload from "../../../components/FileUpload/FileUpload";

const resourceTypes = ["Notes", "Exam Paper", "Exam Solution", "Video"];

// CHECKPOINT

function ContributeForm(props) {
  const [errorMessage, setErrorMessage] = useState("");
  const { sendRequest } = useHttpClient();
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    resourceType: 0,
    link: "",
    file: null,
  });

  async function formSubmitHandler(event) {
    setErrorMessage("");
    event.preventDefault();

    //   try {
    //     const response = await sendRequest(
    //       `${process.env.REACT_APP_BACKEND_URL}/users/login`,
    //       "POST",
    //       JSON.stringify({
    //         email: formState.email,
    //         password: formState.password,
    //       }),
    //       {
    //         "Content-Type": "application/json",
    //       }
    //     );
    //     const responseData = await response.json();
    //     if (!response.ok) {
    //     } else {
    //     }
    //   } catch (err) {
    //   }
  }

  return (
    <div className={`${s.main_container}`}>
      {/* <div className={`${s.header_container}`}>
        <h1 className={`${s.header}`}>{`New Task`}</h1>
      </div> */}

      <form onSubmit={formSubmitHandler}>
        <div className={`${s.input_container}`}>
          <label htmlFor="resource-type" className={`${s.label}`}>
            Resource Type:
          </label>
          <select
            id="resource-type"
            onChange={(event) =>
              setFormState((prev) => {
                return {
                  ...prev,
                  resourceType: event.target.value,
                };
              })
            }
            defaultValue={0}
          >
            {resourceTypes.map((resourceType, idx) => {
              return (
                <option
                  key={`resource-${idx}`}
                  value={idx}
                  className={`${s.dropdown_option}`}
                >
                  {resourceType}
                </option>
              );
            })}
          </select>
        </div>
        <div className={`${s.input_container}`}>
          <input
            id="title"
            type="text"
            placeholder="Title"
            className={`${s.form_input}`}
            value={formState.title}
            onChange={(event) => {
              setFormState((prev) => {
                return {
                  ...prev,
                  title: event.target.value,
                };
              });
            }}
          />
        </div>
        <div className={`${s.input_container}`}>
          <textarea
            id="description"
            rows={5}
            placeholder="Description"
            className={`${s.form_text_area}`}
            value={formState.description}
            onChange={(event) => {
              setFormState((prev) => {
                return {
                  ...prev,
                  description: event.target.value,
                };
              });
            }}
          />
        </div>
        <div className={`${s.input_container}`}>
          <input
            id="link"
            type="text"
            placeholder="Link"
            className={`${s.form_input}`}
            value={formState.link}
            onChange={(event) => {
              setFormState((prev) => {
                return {
                  ...prev,
                  link: event.target.value,
                };
              });
            }}
          />
        </div>
        <div className={`${s.input_container}`}>
          <FileUpload
            validExtensions={".pdf"}
            onInput={(pickedFile) => {
              console.log(pickedFile);
              setFormState((prev) => {
                return {
                  ...prev,
                  file: pickedFile,
                };
              });
            }}
          />
        </div>

        {/* {errorMessage && (
          <div className={`${s.error_container}`}>
            <p>{`${errorMessage}`}</p>
          </div>
        )} */}

        <div className={`${s.button_container}`}>
          <Button type="submit" variant="contained">
            ADD
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ContributeForm;
