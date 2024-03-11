import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

import s from "./style.module.css";
// import { useHttpClient } from "../../hooks/http-hook";
import { useState, useEffect } from "react";

function QuizQuestion(props) {
  const {
    qnNumber, // int
    question, // string
    options, // arr
    updateSelected, // func
    type, // radio or checkbox
    imageSrc,
  } = props;

  // const { sendRequest } = useHttpClient();

  // const [imageUrl, setImageUrl] = useState();
  // const [imageUrl, setImageUrl] = useState(imageSrc);

  /* Fetch image associated with the quiz question */
  // useEffect(() => {
  //   const createTempUrl = async () => {
  //     try {
  //       const response = await sendRequest(
  //         `${process.env.REACT_APP_ASSET_URL}/${imageSrc}`
  //       );

  //       if (response.ok) {
  //         const blob = await response.blob();
  //         const url = window.URL.createObjectURL(blob);
  //         setImageUrl(url);
  //       }
  //     } catch (err) {}
  //   };
  //   if (imageSrc) {
  //     createTempUrl();
  //   }
  // }, [imageSrc, sendRequest, setImageUrl]);

  const optionComponents = options.map((option, idx) => {
    return (
      <div key={`option-${idx}`} className={s.option_container}>
        {type === "radio" ? (
          <FormControlLabel
            value={idx}
            control={<Radio />}
            label={`${option}`}
          />
        ) : (
          <FormControlLabel
            label={`${option}`}
            control={
              <Checkbox
                id={`option-${idx}`}
                value={idx}
                className={s.option_text}
                onChange={(e) => {
                  updateSelected(qnNumber - 1, idx, e.target.checked, false);
                }}
              />
            }
          />
        )}
      </div>
    );
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div className={s.container}>
        <h2 className={s.question}>{`${qnNumber}. ${question}`}</h2>
        {imageSrc && (
          <div>
            <img
              src={
                imageSrc.substring(0, 4) === "http"
                  ? imageSrc
                  : `${process.env.REACT_APP_BACKEND_URL}/${imageSrc}`
              }
              alt={`quiz question`}
              className={`${s.img}`}
            />
          </div>
        )}
        {type === "radio" ? (
          <FormControl>
            <RadioGroup
              onChange={(e) => {
                updateSelected(qnNumber - 1, e.target.value, true, true);
              }}
            >
              {optionComponents}
            </RadioGroup>
          </FormControl>
        ) : (
          <>{optionComponents}</>
        )}
      </div>
    </div>
  );
}

export default QuizQuestion;
