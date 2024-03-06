import React, { useState } from "react";

import { Button } from "@mui/material";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";
import FileUpload from "../../../components/FileUpload/FileUpload";

const resourceTypes = ["Notes", "Exam Paper", "Exam Solution", "Video"];
const resourcePaths = [
  "notes",
  "exam-papers",
  "exam-solutions",
  "video-resources",
];
const uploadTypes = ["Link", "File"];

// CHECKPOINT

function ContributeForm(props) {
  const [errorMessage, setErrorMessage] = useState("");
  const { sendRequest } = useHttpClient();
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    resourceType: "0",
    uploadType: "0",
    link: "",
    file: null,
  });

  async function formSubmitHandler(event) {
    setErrorMessage("");
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", formState.title);

    if (formState.resourceType === "0" || formState.resourceType === "3") {
      formData.append("description", formState.description);
    }

    if (formState.resourceType === "3" || formState.uploadType === "0") {
      formData.append("link", formState.link);
    } else {
      formData.append("file", formState.file);
    }

    try {
      const resourcePath = resourcePaths[Number(formState.resourceType)];
      const response = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/${resourcePath}/create`,
        "POST",
        formData
      );
      const responseData = await response.json();
      if (!response.ok) {
        console.log(responseData.message);
      } else {
        alert("Your contribution has been uploaded! Thank you!");
        setFormState({
          title: "",
          description: "",
          resourceType: "0",
          uploadType: "0",
          link: "",
          file: null,
        });
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  return (
    <div className={`${s.main_container}`}>
      {/* <div className={`${s.header_container}`}>
        <h1 className={`${s.header}`}>{`New Task`}</h1>
      </div> */}

      <form onSubmit={formSubmitHandler}>
        {/* The dropdown to select the resource type */}
        <div className={`${s.input_container}`}>
          <label htmlFor="resource-type" className={`${s.label}`}>
            Resource Type:
          </label>
          <select
            id="resource-type"
            onChange={(event) =>
              setFormState((prev) => {
                console.log(event.target.value);
                return {
                  ...prev,
                  resourceType: event.target.value,
                };
              })
            }
            defaultValue={0}
            value={formState.resourceType}
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

        {/* The title input */}
        <div className={`${s.input_container}`}>
          <h1 className={`${s.input_label}`}>Title</h1>
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

        {/* The description input */}
        {(formState.resourceType === "0" || formState.resourceType === "3") && (
          <div className={`${s.input_container}`}>
            <h1 className={`${s.input_label}`}>Description</h1>
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
        )}

        {/* The dropdown to select the upload type */}
        {formState.resourceType !== "3" && (
          <div className={`${s.input_container}`}>
            <label htmlFor="upload-type" className={`${s.label}`}>
              Upload Type:
            </label>
            <select
              id="upload-type"
              onChange={(event) =>
                setFormState((prev) => {
                  return {
                    ...prev,
                    uploadType: event.target.value,
                  };
                })
              }
              defaultValue={0}
              value={formState.uploadType}
            >
              {uploadTypes.map((uploadType, idx) => {
                return (
                  <option
                    key={`resource-${idx}`}
                    value={idx}
                    className={`${s.dropdown_option}`}
                  >
                    {uploadType}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* The link input */}
        {(formState.resourceType === "3" || formState.uploadType === "0") && (
          <div className={`${s.input_container}`}>
            <h1 className={`${s.input_label}`}>Link</h1>
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
        )}

        {/* The file input */}
        {formState.resourceType !== "3" && formState.uploadType === "1" && (
          <div className={`${s.input_container}`}>
            <h1 className={`${s.input_label}`}>File</h1>
            <FileUpload
              validExtensions={".pdf"}
              onInput={(pickedFile) => {
                setFormState((prev) => {
                  return {
                    ...prev,
                    file: pickedFile,
                  };
                });
              }}
            />
          </div>
        )}

        {/* {errorMessage && (
          <div className={`${s.error_container}`}>
            <p>{`${errorMessage}`}</p>
          </div>
        )} */}

        <div className={`${s.button_container}`}>
          <Button type="submit" variant="contained" color="success">
            ADD
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ContributeForm;
