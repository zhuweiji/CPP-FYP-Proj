import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@mui/material";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";
import Comment from "../Comment/Comment";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import NotesResource from "../../resource_page/NotesResource/NotesResource";
import ExamResourse from "../../resource_page/ExamResource/ExamResource";
import VideoResource from "../../resource_page/VideoResource/VideoResource";
import ResponsiveAppBar from "../../../components/Nav";
import UserDataService from "../../../services/UserService";

function calculateAverageRating(count, total) {
  if (!count || !total) {
    return 0;
  }

  return total / count;
}

const validResourceTypes = [
  "notes",
  "exam_paper",
  "exam_solution",
  "video_resource",
];

function CommentBrowse() {
  const { sendRequest } = useHttpClient();
  const [commentsData, setCommentsData] = useState();
  const { resourceId } = useParams();
  const [comment, setComment] = useState("");
  const resourceType = localStorage.getItem("cppFyp-resource-type");
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to resource page if resource type is not set
    if (!resourceType || validResourceTypes.indexOf(resourceType) === -1) {
      navigate("./../..");
    }
  }, [navigate, resourceType]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await sendRequest(
          `${
            process.env.REACT_APP_BACKEND_URL
          }/resource-comments/?resource_id=${encodeURIComponent(
            resourceId
          )}&resource_type=${encodeURIComponent(resourceType)}`
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.detail);
        }

        const sortedComments = [...responseData.comments];
        sortedComments.sort((a, b) => {
          return new Date(a.time_stamp) > new Date(b.time_stamp) ? -1 : 1;
        });

        setCommentsData({
          ...responseData,
          comments: sortedComments,
        });
      } catch (err) {
        // TODO: handle error when fetching from backend
        console.log(err.message);
      }
    };
    fetchComments();
  }, [sendRequest]);

  async function submitComment() {
    if (!UserDataService.isLoggedIn()) {
      alert("You must log in to comment!");
      return;
    }

    const userId = UserDataService.getUserId();
    let response;
    let responseData;

    try {
      response = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/resource-comments/`,
        "POST",
        JSON.stringify({
          user_id: userId,
          resource_id: resourceId,
          resource_type: resourceType,
          text: comment,
        }),
        {
          "Content-Type": "application/json",
        }
      );

      responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail);
      }

      setCommentsData((prev) => {
        const updatedComments = [...prev.comments];
        updatedComments.unshift({
          user_id: userId,
          user_name: responseData.userName,
          resource_id: resourceId,
          text: responseData.text,
          time_stamp: responseData.timeStamp,
        });
        return {
          ...prev,
          comments: updatedComments,
        };
      });
    } catch (err) {
      console.log(err.message);
      response && console.log(response.status);
      alert("Something went wrong. Try again later!");
    } finally {
      setComment("");
    }
  }

  function getAppropriateResource() {
    if (resourceType === "notes") {
      return (
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
      );
    } else if (resourceType === "exam_paper") {
      return (
        <ExamResourse
          title={commentsData.resource.title}
          examLink={commentsData.resource.link}
          examFile={commentsData.resource.file}
          rating={calculateAverageRating(
            commentsData.resource.rating_count,
            commentsData.resource.rating_total
          )}
          id={resourceId}
        />
      );
    } else if (resourceType === "exam_solution") {
      return (
        <ExamResourse
          title={commentsData.resource.title}
          examLink={commentsData.resource.link}
          examFile={commentsData.resource.file}
          rating={calculateAverageRating(
            commentsData.resource.rating_count,
            commentsData.resource.rating_total
          )}
          id={resourceId}
          isSolution
        />
      );
    } else {
      return (
        <VideoResource
          title={commentsData.resource.title}
          description={commentsData.resource.description}
          videoLink={commentsData.resource.link}
          rating={calculateAverageRating(
            commentsData.resource.rating_count,
            commentsData.resource.rating_total
          )}
          id={resourceId}
        />
      );
    }
  }

  // useEffect(() => {
  //   setCommentsData(dummyComments);
  // }, []);

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
          <div style={{ marginBottom: "20px" }}>{getAppropriateResource()}</div>

          <Link to="./../../">Back to Resource Page</Link>
          <h1 className={s.section_title}>{`Comments (${
            commentsData.comments ? commentsData.comments.length : 0
          })`}</h1>
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
            {commentsData.comments &&
              commentsData.comments.length > 0 &&
              commentsData.comments.map((comment, idx) => {
                return (
                  <Comment
                    key={`comment-${idx}`}
                    userName={comment.user_name}
                    text={comment.text}
                    timeStamp={new Date(comment.time_stamp).toLocaleString()}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentBrowse;
