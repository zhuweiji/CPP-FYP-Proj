import React, { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";
import FileUpload from "../../../components/FileUpload/FileUpload";
import UserDataService from "../../../services/UserService";

const questionTypes = ["radio", "checkbox"];
const resourcePaths = [
  "notes",
  "exam-papers",
  "exam-solutions",
  "video-resources",
];
const uploadTypes = ["Link", "File"];

// CHECKPOINT

function QuizQuestionForm(props) {
  const { setQuestions } = props;
  const [errorMessage, setErrorMessage] = useState("");
  const { sendRequest } = useHttpClient();
  const [formState, setFormState] = useState({
    title: "",
    options: [],
    solution: [],
    score: 1,
    questionType: "0", // radio
    imageLink: "",
    imageFile: null,
  });
  const [options, setOptions] = useState([""]);
  const [solution, setSolution] = useState([]);

  // useEffect(() => {
  //   console.log(solution);
  // }, [solution]);

  useEffect(() => {
    setSolution([]);
  }, [formState.questionType]);

  const optionComponents = options.map((option, idx) => {
    return (
      <div key={`option-${idx}`} className={s.option_container}>
        {formState.questionType === "0" ? (
          // radio
          <FormControlLabel
            value={option}
            control={<Radio />}
            // label={`${option}`}
          />
        ) : (
          // checkbox
          <FormControlLabel
            // label={`${option}`}
            control={
              <Checkbox
                id={`option-${idx}`}
                value={option}
                className={s.option_text}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSolution((prev) => {
                      return [...prev, option];
                    });
                  } else {
                    setSolution((prev) => {
                      return prev.filter((item) => {
                        return item !== option;
                      });
                    });
                  }
                }}
              />
            }
          />
        )}
        <input
          type="text"
          placeholder="Question"
          className={`${s.option_input}`}
          value={option}
          onChange={(event) => {
            setOptions((prev) => {
              const newOptions = [...prev];
              newOptions[idx] = event.target.value;
              return newOptions;
            });
          }}
        />
        <Button variant="contained">DELETE</Button>
      </div>
    );
  });

  return (
    <div className={`${s.main_container}`}>
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

      {/* The dropdown to select the question type */}
      <div className={`${s.input_container}`}>
        <label htmlFor="question-type" className={`${s.label}`}>
          Question Type:
        </label>
        <select
          id="question-type"
          onChange={(event) =>
            setFormState((prev) => {
              // console.log(event.target.value);
              return {
                ...prev,
                questionType: event.target.value,
              };
            })
          }
          // defaultValue={0}
          value={formState.questionType}
        >
          {questionTypes.map((questionType, idx) => {
            return (
              <option
                key={`resource-${idx}`}
                value={idx}
                className={`${s.dropdown_option}`}
              >
                {questionType}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        {formState.questionType === "0" ? (
          <FormControl>
            <RadioGroup
              onChange={(e) => {
                // updateSelected(qnNumber - 1, e.target.value, true, true);
                setSolution([e.target.value]);
              }}
            >
              {optionComponents}
            </RadioGroup>
          </FormControl>
        ) : (
          <>{optionComponents}</>
        )}
      </div>

      <Button variant="contained">ADD OPTION</Button>

      {/* The score input */}
      <div className={`${s.input_container}`}>
        <h1 className={`${s.input_label}`}>Score</h1>
        <input
          id="score"
          type="number"
          min={1}
          max={8}
          placeholder="Score"
          className={`${s.form_input}`}
          value={formState.score}
          onChange={(event) => {
            setFormState((prev) => {
              return {
                ...prev,
                score: event.target.value,
              };
            });
          }}
        />
      </div>

      {/* The description input */}
      {/* {(formState.resourceType === "0" || formState.resourceType === "3") && (
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
      )} */}

      {/* The dropdown to select the upload type */}
      {/* {formState.resourceType !== "3" && (
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
      )} */}

      {/* The link input */}
      {/* {(formState.resourceType === "3" || formState.uploadType === "0") && (
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
      )} */}

      {/* The file input */}
      {/* {formState.resourceType !== "3" && formState.uploadType === "1" && (
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
      )} */}

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
    </div>
  );
}

export default QuizQuestionForm;
