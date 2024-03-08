import { useEffect, useState } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";
import Comment from "../Comment/Comment";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import NotesResource from "../../resource_page/NotesResource/NotesResource";
import ExamResourse from "../../resource_page/ExamResource/ExamResource";
import VideoResource from "../../resource_page/VideoResource/VideoResource";
import ResponsiveAppBar from "../../../components/Nav";
import { useParams } from "react-router-dom";
import { Button } from "@mui/material";

const dummyComments = {
  resource: {
    title: "Xd",
    description: "???",
    link: "",
    file: "",
    rating_count: 1,
    rating_total: 4,
  },
  comments: [
    {
      user_id: "",
      user_name: "Abeforth",
      resource_id: "",
      text: "This is a dummy comment xd xd",
      time_stamp: new Date(2024, 5, 4, 23, 59, 0).toLocaleString(),
    },
    {
      user_id: "",
      user_name: "Bronnick",
      resource_id: "",
      text: "This is a dummy comment xd xd This is a dummy comment xd xd",
      time_stamp: new Date(2024, 5, 4, 23, 59, 0).toLocaleString(),
    },
    {
      user_id: "",
      user_name: "Charles",
      resource_id: "",
      text: "This is a dummy comment xd xd This is a dummy comment xd xd",
      time_stamp: new Date(2024, 5, 4, 23, 59, 0).toLocaleString(),
    },
  ],
};

function calculateAverageRating(count, total) {
  if (!count || !total) {
    return 0;
  }

  return total / count;
}

function CommentBrowse() {
  const { sendRequest } = useHttpClient();
  const [commentsData, setCommentsData] = useState();
  const { resourceType, resourceId } = useParams();
  const [comment, setComment] = useState("");

  // useEffect(() => {
  //   const fetchComments = async () => {
  //     try {
  //       const response = await sendRequest(
  //         `${process.env.REACT_APP_BACKEND_URL}/faqs`
  //       );

  //       const responseData = await response.json();

  //       if (!response.ok) {
  //         throw new Error(responseData.message);
  //       }

  //       setCommentsData(responseData);
  //     } catch (err) {
  //       // TODO: handle error when fetching from backend
  //       console.log(err.message);
  //     }
  //   };
  //   fetchComments();
  // }, [sendRequest]);

  async function submitComment() {
    setCommentsData((prev) => {
      const updatedComments = [...prev.comments];
      updatedComments.unshift({
        user_id: "",
        user_name: "Muqs",
        resource_id: resourceId,
        text: comment,
        time_stamp: new Date().toLocaleString(),
      });
      return {
        ...prev,
        comments: updatedComments,
      };
    });
  }

  useEffect(() => {
    setCommentsData(dummyComments);
  }, []);

  if (!commentsData) {
    return (
      <div className="center">
        <LoadingSpinner asOverlay />
      </div>
    );
  }

  return (
    <div>
      <ResponsiveAppBar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className={`${s.container}`}>
          <NotesResource
            title={commentsData.resource.title}
            description={commentsData.resource.description}
            notesLink={commentsData.resource.link}
            notesFile={commentsData.resource.file}
            rating={calculateAverageRating(
              commentsData.resource.rating_count,
              commentsData.resource.rating_total
            )}
            id={resourceId}
          />
          <h1 className={s.section_title}>{`Comments`}</h1>
          <div className={`${s.input_container}`}>
            <textarea
              id="comment"
              rows={3}
              placeholder="Add a comment..."
              className={`${s.form_text_area}`}
              value={comment}
              onChange={(event) => {
                setComment(event.target.value);
              }}
            />
            <div className={`${s.btn_container}`}>
              <Button onClick={submitComment}>COMMENT</Button>
            </div>
          </div>
          <div>
            {!commentsData.comments || commentsData.comments.length === 0 ? (
              <h4>Empty Resource</h4>
            ) : (
              commentsData.comments.map((comment, idx) => {
                return (
                  <Comment
                    key={`comment-${idx}`}
                    userName={comment.user_name}
                    text={comment.text}
                    timeStamp={comment.time_stamp}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentBrowse;
