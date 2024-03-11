import React, { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";
import FileUpload from "../../../components/FileUpload/FileUpload";

const questionTypes = ["radio", "checkbox"];

function QuizQuestionForm(props) {
  const { setQuestions, questionIdx } = props;
  const [errorMessage, setErrorMessage] = useState("");
  const { sendRequest } = useHttpClient();
  const [formState, setFormState] = useState({
    title: "",
    options: ["", ""],
    solution: [0],
    score: "1",
    questionType: "0", // radio
    imageLink: "",
    imageFile: null,
  });

  // useEffect(() => {
  //   console.log(solution);
  // }, [solution]);

  useEffect(() => {
    setFormState((prev) => {
      return {
        ...prev,
        solution: formState.questionType === "0" ? [0] : [],
      };
    });
  }, [formState.questionType]);

  const optionComponents = formState.options.map((option, idx) => {
    return (
      <div key={`option-${idx}`} className={s.option_container}>
        {formState.questionType === "0" ? (
          // radio
          <FormControlLabel value={idx} control={<Radio />} />
        ) : (
          // checkbox
          <FormControlLabel
            control={
              <Checkbox
                id={`option-${idx}`}
                value={idx}
                className={s.option_text}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormState((prev) => {
                      return {
                        ...prev,
                        solution: [...prev.solution, idx].sort((a, b) => {
                          return a - b;
                        }),
                      };
                    });
                  } else {
                    setFormState((prev) => {
                      return {
                        ...prev,
                        solution: prev.solution.filter((item) => {
                          return item !== idx;
                        }),
                      };
                    });
                  }
                }}
              />
            }
          />
        )}
        <input
          type="text"
          placeholder={`Option ${idx + 1}`}
          className={`${s.option_input}`}
          value={option}
          onChange={(event) => {
            setFormState((prev) => {
              return {
                ...prev,
                options: prev.options.map((currOption, currIdx) => {
                  if (idx !== currIdx) {
                    return currOption;
                  }
                  return event.target.value;
                }),
              };
            });
          }}
        />

        {
          // only allow delete if more than 2 options
          formState.options.length > 2 && (
            <div
              className={`${s.icon_container}`}
              onClick={() => {
                setFormState((prev) => {
                  const newOptions = prev.options.filter((_, currIdx) => {
                    return currIdx !== idx;
                  });
                  return {
                    ...prev,
                    options: newOptions,
                    solution: prev.solution.filter((item) => {
                      return item < newOptions.length;
                    }),
                  };
                });
              }}
            >
              <DeleteIcon />
            </div>
          )
        }
      </div>
    );
  });

  return (
    <div className={`${s.main_container}`}>
      {/* The title input */}
      <div className={`${s.input_container}`}>
        <h1 className={`${s.input_label}`}>Question</h1>
        <input
          id="title"
          type="text"
          placeholder="Question"
          className={`${s.question_input}`}
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
          defaultValue={"0"}
          // value={formState.questionType}
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
              value={`${formState.solution[0]}`}
              onChange={(e) => {
                setFormState((prev) => {
                  return {
                    ...prev,
                    solution: [Number(e.target.value)],
                  };
                });
              }}
            >
              {optionComponents}
            </RadioGroup>
          </FormControl>
        ) : (
          <>{optionComponents}</>
        )}
      </div>

      <Button
        sx={{
          mt: "15px",
        }}
        variant="outlined"
        onClick={() => {
          setFormState((prev) => {
            return {
              ...prev,
              options: [...prev.options, ""],
            };
          });
          // setOptions((prev) => {
          //   return [...prev, ""];
          // });
        }}
      >
        ADD OPTION
      </Button>

      {/* The score input */}
      <div className={`${s.input_container}`}>
        <h1 className={`${s.input_label}`}>Score</h1>
        <input
          id="score"
          type="number"
          min={1}
          max={10}
          placeholder="Score"
          className={`${s.form_input} ${s.score_input}`}
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

      {/* The file input */}
      <div className={`${s.input_container}`}>
        <h1 className={`${s.input_label}`}>Image</h1>
        <FileUpload
          validExtensions={".png,.jpg,.jpeg"}
          onInput={(pickedFile) => {
            setFormState((prev) => {
              return {
                ...prev,
                imageFile: pickedFile,
              };
            });
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          onClick={() => {
            setQuestions((prev) => {
              return prev.map((question, idx) => {
                if (idx !== questionIdx) {
                  return question;
                }
                return formState;
              });
            });
          }}
        >
          SAVE
        </Button>
      </div>

      {/* {errorMessage && (
          <div className={`${s.error_container}`}>
            <p>{`${errorMessage}`}</p>
          </div>
        )} */}
    </div>
  );
}

export default QuizQuestionForm;
