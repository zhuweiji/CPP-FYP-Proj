import { useEffect, useState, useCallback } from "react";

import s from "./style.module.css";
import { useHttpClient } from "../../../hooks/http-hook";

// import EmptyResource from "../EmptyResource/EmptyResource";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ResponsiveAppBar from "../../../components/Nav";
import Faq from "../Faq/Faq";
import FaqForm from "../FaqForm/FaqForm";
// import PageNotFound from "../../pages/PageNotFound/PageNotFound";

function FaqBrowse() {
  const { sendRequest } = useHttpClient();
  const [faqsData, setFaqsData] = useState();

  // The faq currently selected for edit
  // -1: none
  // 0: new Faq
  // other IDs: Edit existing
  const [selectedFaq, setSelectedFaq] = useState("-1");
  const [faqForDeletion, setFaqForDeletion] = useState("-1");

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/chat-queries`
          // `${process.env.REACT_APP_BACKEND_URL}/faqs`
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setFaqsData(responseData);
      } catch (err) {
        // TODO: handle error when fetching from backend
        console.log(err.message);
      }
    };
    fetchFaqs();
  }, [sendRequest]);

  useEffect(() => {
    const deleteFaq = async (id) => {
      try {
        const response = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/chat-queries/${id}`,
          "DELETE"
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.detail);
        }

        alert("FAQ successfully deleted");
        window.location.reload(false); // reload to see changes
      } catch (err) {
        alert(err.message);
      }
    };
    if (faqForDeletion !== "-1") {
      deleteFaq(faqForDeletion);
    }
  }, [sendRequest, faqForDeletion]);

  // if (courseId === "INVALID") {
  //   return <PageNotFound />;
  // }

  const closeForm = useCallback(() => {
    setSelectedFaq("-1");
  }, []);

  const openForm = useCallback((id) => {
    setSelectedFaq(id);
  }, []);

  const removeFaq = useCallback((id) => {
    setFaqForDeletion(id);
  }, []);

  if (!faqsData) {
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
          <h1 className={s.section_title}>{`FAQs`}</h1>
          <div>
            {selectedFaq === "0" ? (
              <FaqForm
                question=""
                answer=""
                topic="Encaps"
                topicId=""
                id="-1"
                closeForm={closeForm}
              />
            ) : (
              <div
                title="add a FAQ"
                className={`${s.add_qn_btn}`}
                onClick={() => {
                  setSelectedFaq("0");
                }}
              >
                +
              </div>
            )}
            {!faqsData.queries || faqsData.queries.length === 0 ? (
              <h4>Empty Resource</h4>
            ) : (
              faqsData.queries.map((faq, idx) => {
                return faq.id !== selectedFaq ? (
                  <Faq
                    key={`faq-${idx}`}
                    question={faq.question}
                    answer={faq.answer}
                    topic={faq.chat_topic_title}
                    topicId={faq.chat_topic}
                    id={faq.id}
                    openForm={() => {
                      openForm(faq.id);
                    }}
                    removeFaq={removeFaq}
                  />
                ) : (
                  <FaqForm
                    key={`faq-${idx}`}
                    question={faq.question}
                    answer={faq.answer}
                    topic={faq.chat_topic_title}
                    topicId={faq.chat_topic}
                    id={faq.id}
                    closeForm={closeForm}
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

export default FaqBrowse;
