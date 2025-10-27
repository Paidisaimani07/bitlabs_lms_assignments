import React, { useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import Snackbar from "../../components/common/Snackbar";
import "./MentorConnectFeedbackForm.css";

const MentorConnectFeedbackForm = () => {
  const [formData, setFormData] = useState({
    collegeName: "",
    mentorName: "",
    sessionTitle: "",
    ratingOverall: 0,
    ratingDelivery: 0,
    ratingContent: 0,
    ratingClarity: 0,
    comments: "",
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "" });
  const [submitted, setSubmitted] = useState(false);
  const [commentError, setCommentError] = useState("");

  const handleStarClick = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "comments") {
      if (value.length < 10) {
        setCommentError("Comments must be at least 10 characters long.");
      } else {
        setCommentError("");
      }
    }
  };

  const validateRatings = () => {
    const { ratingOverall, ratingDelivery, ratingContent, ratingClarity } = formData;
    return ratingOverall && ratingDelivery && ratingContent && ratingClarity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateRatings()) {
      setSnackbar({
        open: true,
        message: "Please provide all four ratings before submitting.",
        type: "error",
      });
      return;
    }

    if (formData.comments.length < 10) {
      setCommentError("Comments must be at least 10 characters long.");
      setSnackbar({
        open: true,
        message: "Please provide at least 10 characters in the comments field.",
        type: "error",
      });
      return;
    }

    try {
      await axios.post(`${apiUrl}/mentorfeedback/feedback`, formData);
      setSubmitted(true);
      setSnackbar({
        open: true,
        message: "Thank you! Your feedback has been submitted successfully.",
        type: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error submitting feedback. Please try again later.",
        type: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", type: "" });
  };

  if (submitted) {
    return (
      <div className="feedback-success">
        <div className="success-card">
          <h2 className="success-title">Thank You for Your Feedback!</h2>
          <p className="success-message">
            Your response has been recorded successfully. Your feedback helps us
            improve our mentorship sessions and make them even better!
          </p>
          <button
            className="success-btn"
            onClick={() => {
              setSubmitted(false);
              setSnackbar({ open: false, message: "", type: "" });
              setFormData({
                collegeName: "",
                mentorName: "",
                sessionTitle: "",
                ratingOverall: 0,
                ratingDelivery: 0,
                ratingContent: 0,
                ratingClarity: 0,
                comments: "",
              });
            }}
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  const renderStars = (field, value) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${value >= star ? "filled" : ""}`}
          onClick={() => handleStarClick(field, star)}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <h2 className="feedback-title">Mentor Connect Feedback Form</h2>
        <p className="feedback-subtitle">
          We value your input! Please share your honest thoughts below.
        </p>

        <form onSubmit={handleSubmit} className="feedback-form">
          <label>
            College Name <span className="required-star">*</span>
          </label>
          <input
            type="text"
            name="collegeName"
            value={formData.collegeName}
            onChange={handleChange}
            required
          />

          <label>
            Mentor Name <span className="required-star">*</span>
          </label>
          <input
            type="text"
            name="mentorName"
            value={formData.mentorName}
            onChange={handleChange}
            required
          />

          <label>
            Session Title <span className="required-star">*</span>
          </label>
          <input
            type="text"
            name="sessionTitle"
            value={formData.sessionTitle}
            onChange={handleChange}
            required
          />

          <div className="rating-section">
            <div className="rating-field">
              <label>Overall Rating <span className="required-star">*</span></label>
              {renderStars("ratingOverall", formData.ratingOverall)}
            </div>

            <div className="rating-field">
              <label>Delivery Rating <span className="required-star">*</span></label>
              {renderStars("ratingDelivery", formData.ratingDelivery)}
            </div>

            <div className="rating-field">
              <label>Content Rating <span className="required-star">*</span></label>
              {renderStars("ratingContent", formData.ratingContent)}
            </div>

            <div className="rating-field">
              <label>Clarity Rating <span className="required-star">*</span></label>
              {renderStars("ratingClarity", formData.ratingClarity)}
            </div>
          </div>

          <label>
            Comments <span className="required-star">*</span>
          </label>
          <textarea
            name="comments"
            rows="4"
            value={formData.comments}
            onChange={handleChange}
            required
          ></textarea>
          {commentError && <p className="error-text">{commentError}</p>}

          <button type="submit" className="submit-btn">
            Submit Feedback
          </button>
        </form>
      </div>

      {snackbar.open && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
        />
      )}
    </div>
  );
};

export default MentorConnectFeedbackForm;
