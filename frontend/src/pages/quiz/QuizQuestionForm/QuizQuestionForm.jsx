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
  const { setQuestions, currQuestionIdx, questions } = props;
  const [errorMessage, setErrorMessage] = useState("");
  const { sendRequest } = useHttpClient();
  // const [formState, setFormState] = useState({

  // });

  // CHECKPOINT: USE setQuestions instead of setFormState
  // const formState = questions[questionIdx];

  // useEffect(() => {
  //   console.log(solution);
  // }, [solution]);

  // useEffect(() => {
  //   setQuestions((prev) => {
  //     return prev.map((qn, qnIdx) => {
  //       if (qnIdx !== currQuestionIdx) {
  //         return qn;
  //       }
  //       return {
  //         ...qn,
  //         solution: questions[currQuestionIdx].questionType === "0" ? [0] : [],
  //       };
  //     });
  //   });
  //   // setFormState((prev) => {
  //   //   return {
  //   //     ...prev,
  //   //     solution: formState.questionType === "0" ? [0] : [],
  //   //   };
  //   // });
  // }, [questions[currQuestionIdx].questionType]);
  // }, [formState.questionType]);

  // const optionComponents = formState.options.map((option, optionIdx) => {
  const optionComponents = questions[currQuestionIdx].options.map(
    (option, optionIdx) => {
      return (
        <div key={`option-${optionIdx}`} className={s.option_container}>
          {/* {formState.questionType === "0" ? ( */}
          {questions[currQuestionIdx].questionType === "0" ? (
            // radio
            <FormControlLabel value={optionIdx} control={<Radio />} />
          ) : (
            // checkbox
            <FormControlLabel
              control={
                <Checkbox
                  id={`option-${optionIdx}`}
                  value={optionIdx}
                  className={s.option_text}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setQuestions((prev) => {
                        return prev.map((qn, qnIdx) => {
                          if (qnIdx !== currQuestionIdx) {
                            return qn;
                          }
                          return {
                            ...qn,
                            solution: [...qn.solution, optionIdx].sort(
                              (a, b) => {
                                return a - b;
                              }
                            ),
                          };
                        });
                      });
                      // setFormState((prev) => {
                      //   return {
                      //     ...prev,
                      //     solution: [...prev.solution, idx].sort((a, b) => {
                      //       return a - b;
                      //     }),
                      //   };
                      // });
                    } else {
                      setQuestions((prev) => {
                        return prev.map((qn, qnIdx) => {
                          if (qnIdx !== currQuestionIdx) {
                            return qn;
                          }
                          return {
                            ...qn,
                            solution: qn.solution.filter((item) => {
                              return item !== optionIdx;
                            }),
                          };
                        });
                      });
                      // setFormState((prev) => {
                      //   return {
                      //     ...prev,
                      //     solution: prev.solution.filter((item) => {
                      //       return item !== idx;
                      //     }),
                      //   };
                      // });
                    }
                  }}
                />
              }
            />
          )}
          <input
            type="text"
            placeholder={`Option ${optionIdx + 1}`}
            className={`${s.option_input}`}
            value={option}
            onChange={(event) => {
              setQuestions((prev) => {
                return prev.map((qn, qnIdx) => {
                  if (qnIdx !== currQuestionIdx) {
                    return qn;
                  }
                  return {
                    ...qn,
                    options: qn.options.map((currOption, currIdx) => {
                      if (optionIdx !== currIdx) {
                        return currOption;
                      }
                      return event.target.value;
                    }),
                  };
                });
              });
              // setFormState((prev) => {
              //   return {
              //     ...prev,
              //     options: prev.options.map((currOption, currIdx) => {
              //       if (optionIdx !== currIdx) {
              //         return currOption;
              //       }
              //       return event.target.value;
              //     }),
              //   };
              // });
            }}
          />

          {
            // only allow delete if more than 2 options
            // formState.options.length > 2 && (
            questions[currQuestionIdx].options.length > 2 && (
              <div
                className={`${s.icon_container}`}
                onClick={() => {
                  setQuestions((prev) => {
                    return prev.map((qn, qnIdx) => {
                      if (qnIdx !== currQuestionIdx) {
                        return qn;
                      }
                      const newOptions = qn.options.filter((_, currIdx) => {
                        return currIdx !== optionIdx;
                      });
                      return {
                        ...qn,
                        options: newOptions,
                        solution: qn.solution.filter((item) => {
                          return item < newOptions.length;
                        }),
                      };
                    });
                  });
                  // setFormState((prev) => {
                  //   const newOptions = prev.options.filter((_, currIdx) => {
                  //     return currIdx !== optionIdx;
                  //   });
                  //   return {
                  //     ...prev,
                  //     options: newOptions,
                  //     solution: prev.solution.filter((item) => {
                  //       return item < newOptions.length;
                  //     }),
                  //   };
                  // });
                }}
              >
                <DeleteIcon />
              </div>
            )
          }
        </div>
      );
    }
  );

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
          // value={formState.title}
          value={questions[currQuestionIdx].title}
          onChange={(event) => {
            // setFormState((prev) => {
            //   return {
            //     ...prev,
            //     title: event.target.value,
            //   };
            // });
            setQuestions((prev) => {
              return prev.map((qn, idx) => {
                if (idx !== currQuestionIdx) {
                  return qn;
                }
                return {
                  ...qn,
                  title: event.target.value,
                };
              });
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
          onChange={(event) => {
            setQuestions((prev) => {
              return prev.map((qn, qnIdx) => {
                if (qnIdx !== currQuestionIdx) {
                  return qn;
                }
                return {
                  ...qn,
                  questionType: event.target.value,
                  solution: event.target.value === "0" ? [0] : [],
                };
              });
            });
            // setFormState((prev) => {
            //   return {
            //     ...prev,
            //     questionType: event.target.value,
            //   };
            // });
          }}
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
        {/* {formState.questionType === "0" ? ( */}
        {questions[currQuestionIdx].questionType === "0" ? (
          <FormControl>
            <RadioGroup
              // value={`${formState.solution[0]}`}
              value={`${questions[currQuestionIdx].solution[0]}`}
              onChange={(e) => {
                setQuestions((prev) => {
                  return prev.map((qn, qnIdx) => {
                    if (qnIdx !== currQuestionIdx) {
                      return qn;
                    }
                    return {
                      ...qn,
                      solution: [Number(e.target.value)],
                    };
                  });
                });
                // setFormState((prev) => {
                //   return {
                //     ...prev,
                //     solution: [Number(e.target.value)],
                //   };
                // });
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
          setQuestions((prev) => {
            return prev.map((qn, qnIdx) => {
              if (qnIdx !== currQuestionIdx) {
                return qn;
              }
              return {
                ...qn,
                options: [...qn.options, ""],
              };
            });
          });

          // setFormState((prev) => {
          //   return {
          //     ...prev,
          //     options: [...prev.options, ""],
          //   };
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
          // value={formState.score}
          value={questions[currQuestionIdx].score}
          onChange={(event) => {
            setQuestions((prev) => {
              return prev.map((qn, qnIdx) => {
                if (qnIdx !== currQuestionIdx) {
                  return qn;
                }
                return {
                  ...qn,
                  score: event.target.value,
                };
              });
            });
            // setFormState((prev) => {
            //   return {
            //     ...prev,
            //     score: event.target.value,
            //   };
            // });
          }}
        />
      </div>

      {/* The file input */}
      <div className={`${s.input_container}`}>
        <h1 className={`${s.input_label}`}>Image</h1>
        <FileUpload
          validExtensions={".png,.jpg,.jpeg"}
          onInput={(pickedFile) => {
            setQuestions((prev) => {
              return prev.map((qn, qnIdx) => {
                if (qnIdx !== currQuestionIdx) {
                  return qn;
                }
                return {
                  ...qn,
                  imageFile: pickedFile,
                };
              });
            });
            // setFormState((prev) => {
            //   return {
            //     ...prev,
            //     imageFile: pickedFile,
            //   };
            // });
          }}
        />
      </div>

      {questions.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {/* <Button
          sx={{
            mr: "10px",
          }}
          variant="outlined"
          color="success"
          onClick={() => {
            setQuestions((prev) => {
              return prev.map((question, idx) => {
                if (idx !== currQuestionIdx) {
                  return question;
                }
                return formState;
              });
            });
          }}
        >
          SAVE
        </Button> */}
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setQuestions((prev) => {
                return prev.filter((qn, idx) => {
                  return idx !== currQuestionIdx;
                });
              });
            }}
          >
            <DeleteIcon />
          </Button>
        </div>
      )}

      {/* {errorMessage && (
          <div className={`${s.error_container}`}>
            <p>{`${errorMessage}`}</p>
          </div>
        )} */}
    </div>
  );
}

export default QuizQuestionForm;
