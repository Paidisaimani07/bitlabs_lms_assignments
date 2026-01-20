import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useNavigate, useParams } from 'react-router-dom';
import Snackbar from '../common/Snackbar';
import BackButton from '../common/BackButton';
import './FeedbackFormFill.css';

const FeedbackFormFill = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { formId } = useParams();
  const [formData, setFormData] = useState({});
  const [formDetails, setFormDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
  const applicantId = user?.id;

  useEffect(() => {
    const fetchFormDetails = async () => {
      try {
        setLoading(true);
        const jwtToken = localStorage.getItem('jwtToken');

        const response = await axios.get(
          `${apiUrl}/api/feedback-forms/applicant/${applicantId}/getFormById/${formId}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        setFormDetails(response.data);
        setError(null);

        const initialFormData = {};
        if (response.data.questions) {
          const questions = JSON.parse(response.data.questions);
          questions.forEach(question => {
            initialFormData[question.questionNo] = question.questionType === 'TEXTAREA' ? '' :
              question.questionType === 'NUMBER' ? '' : null;
          });
        }
        setFormData(initialFormData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load feedback form. Please try again later.');
        setLoading(false);
      }
    };

    if (formId && applicantId) {
      fetchFormDetails();
    } else {
      setError('Form ID or user information missing.');
      setLoading(false);
    }
  }, [formId, applicantId]);

  const handleInputChange = (questionNo, value, questionType) => {
    setFormData(prev => ({
      ...prev,
      [questionNo]: questionType === 'NUMBER' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const answers = Object.keys(formData).map(questionNo => ({
        answer: formData[questionNo],
        questionNo: parseInt(questionNo)
      }));
      
      await axios.post(
        `${apiUrl}/api/feedback-forms/applicant/${applicantId}/submitFeedback/${formId}`,
        answers,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSnackbar({ open: true, message: 'Feedback form submitted successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/applicant-feedback-forms');
      }, 1000);

    } catch (err) {
      let errorMessage = err.response?.data?.message || err.message || 'Failed to submit feedback form. Please try again.';
      
      if (errorMessage.includes('Feedback already submitted for this form by the applicant')) {
        errorMessage = 'You have already submitted feedback for this form.';
      }
      
      setSnackbar({ open: true, message: errorMessage, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const { questionNo, questionText, questionType, options, isRequired } = question;
    const value = formData[questionNo] || '';

    switch (questionType) {
      case 'RADIO':
        return (
          <div key={questionNo} className="feedback-question">
            <label className="feedback-question-label">
              {questionText} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <div className="feedback-radio-group">
              {options.map((option, index) => (
                <label key={index} className="feedback-radio-option">
                  <input
                    type="radio"
                    name={`question-${questionNo}`}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleInputChange(questionNo, e.target.value, questionType)}
                    required={isRequired}
                  />
                  <span className="feedback-radio-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'NUMBER':
        return (
          <div key={questionNo} className="feedback-question">
            <label className="feedback-question-label">
              {questionText} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(questionNo, e.target.value, questionType)}
              required={isRequired}
              className="feedback-number-input"
              min="1"
              max="10"
            />
          </div>
        );

      case 'TEXTAREA':
        return (
          <div key={questionNo} className="feedback-question">
            <label className="feedback-question-label">
              {questionText} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(questionNo, e.target.value, questionType)}
              required={isRequired}
              className="feedback-textarea"
              rows={4}
              placeholder="Enter your response here..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="border-style">
      <div className="blur-border-style"></div>
      <div className="dashboard__content">
        <div className="row mr-0 ml-10 extraSpace" style={{ marginLeft: "1%" }}>
          <div className="main-header-row">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <BackButton />
              <h1 className="main-heading">Fill Feedback Form</h1>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="feedback-form-wrapper">
            {/* Skeleton Card 1 - Form Details */}
            <div className="newCard skeleton-card">
              <div className="card-header">
                <div className="skeleton skeleton-title"></div>
                <div className="card-details">
                  <div className="skeleton skeleton-meta-item"></div>
                  <div className="skeleton skeleton-meta-item"></div>
                </div>
                <div className="skeleton skeleton-description"></div>
              </div>
            </div>
            
            {/* Skeleton Card 2 - Multiple Input Fields */}
            <div className="newCard skeleton-card">
              <div className="card-body">
                {/* Row 1 - Two fields */}
                <div className="skeleton-row">
                  <div className="skeleton-col">
                    <div className="skeleton skeleton-label"></div>
                    <div className="skeleton skeleton-input-field"></div>
                  </div>
                  <div className="skeleton-col">
                    <div className="skeleton skeleton-label"></div>
                    <div className="skeleton skeleton-input-field"></div>
                  </div>
                </div>
                
                {/* Row 2 - Two fields */}
                <div className="skeleton-row">
                  <div className="skeleton-col">
                    <div className="skeleton skeleton-label"></div>
                    <div className="skeleton skeleton-input-field"></div>
                  </div>
                  <div className="skeleton-col">
                    <div className="skeleton skeleton-label"></div>
                    <div className="skeleton skeleton-input-field"></div>
                  </div>
                </div>

                {/* Row 3 - Radio Group */}
                <div className="skeleton-row">
                  <div className="skeleton-col-full">
                    <div className="skeleton skeleton-label"></div>
                    <div className="radio-group">
                      <div className="skeleton skeleton-radio-option"></div>
                      <div className="skeleton skeleton-radio-option"></div>
                      <div className="skeleton skeleton-radio-option"></div>
                      <div className="skeleton skeleton-radio-option"></div>
                    </div>
                  </div>
                </div>

                {/* Row 4 - Textarea */}
                <div className="skeleton-row">
                  <div className="skeleton-col-full">
                    <div className="skeleton skeleton-label"></div>
                    <div className="skeleton skeleton-textarea"></div>
                  </div>
                </div>

                {/* Row 5 - Radio Group */}
                <div className="skeleton-row">
                  <div className="skeleton-col-full">
                    <div className="skeleton skeleton-label"></div>
                    <div className="radio-group">
                      <div className="skeleton skeleton-radio-option"></div>
                      <div className="skeleton skeleton-radio-option"></div>
                      <div className="skeleton skeleton-radio-option"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="feedback-error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="feedback-retry-btn">
              Retry
            </button>
          </div>
        ) : !formDetails ? (
          <div className="feedback-error-state">
            <p>Feedback form not found.</p>
          </div>
        ) : (
          <div className="feedback-form-wrapper">
            <div className="feedback-form-header">
              <h2 className="feedback-form-title">{formDetails.formName}</h2>
              <div className="feedback-form-meta">
                <span className="feedback-meta-item">Mentor: {formDetails.mentorName}</span>
                <span className="feedback-meta-item">College: {formDetails.collegeName}</span>
              </div>
              {formDetails.description && (
                <p className="feedback-form-description">{formDetails.description}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="feedback-form">
              {JSON.parse(formDetails.questions).map((question) => renderQuestion(question))}
              <div className="feedback-submit-section">
                <button
                  type="submit"
                  className="feedback-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        )}
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

export default FeedbackFormFill;
