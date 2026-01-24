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
  const [fieldErrors, setFieldErrors] = useState({});
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
            if (question.questionType === 'CHECKBOX') {
              initialFormData[question.questionNo] = [];
            } else if (question.questionType === 'TEXTAREA' || question.questionType === 'TEXT' || question.questionType === 'EMAIL' || question.questionType === 'PHONE') {
              initialFormData[question.questionNo] = '';
            } else if (question.questionType === 'NUMBER') {
              initialFormData[question.questionNo] = '';
            } else {
              // RADIO, REVIEW
              initialFormData[question.questionNo] = '';
            }
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

  const handleInputChange = (questionNo, value, questionType, isChecked = null) => {
    setFormData(prev => {
      const updated = { ...prev };
      
      if (questionType === 'CHECKBOX') {
        // Handle checkbox array values
        const currentValues = prev[questionNo] || [];
        if (isChecked) {
          updated[questionNo] = [...currentValues, value];
        } else {
          updated[questionNo] = currentValues.filter(item => item !== value);
        }
      } else if (questionType === 'NUMBER') {
        // Handle number type
        updated[questionNo] = value === '' ? '' : Number(value);
      } else {
        // Handle all other types (TEXT, EMAIL, PHONE, TEXTAREA, RADIO, REVIEW)
        updated[questionNo] = value;
      }
      
      return updated;
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: '' });
  };

  const validateForm = () => {
    const errors = {};
    
    if (formDetails && formDetails.questions) {
      const questions = JSON.parse(formDetails.questions);
      questions.forEach(question => {
        const value = formData[question.questionNo];
        
        if (question.isRequired) {
          if (question.questionType === 'CHECKBOX') {
            // Check if at least one checkbox is selected
            if (!Array.isArray(value) || value.length === 0) {
              errors[question.questionNo] = `Please select at least one option`;
            }
          } else if (question.questionType === 'RADIO' || question.questionType === 'REVIEW') {
            // Check if a radio or review option is selected
            if (!value || value === '') {
              errors[question.questionNo] = `Please select an option`;
            }
          } else if (!value || (typeof value === 'string' && value.trim() === '')) {
            // Check for TEXT, EMAIL, PHONE, TEXTAREA, NUMBER
            errors[question.questionNo] = `This field is required`;
          }
        }
      });
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      setSubmitting(false);
      return;
    }

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
                  />
                  <span className="feedback-radio-text">{option}</span>
                </label>
              ))}
            </div>
            {fieldErrors[questionNo] && (
              <span className="feedback-error-message">{fieldErrors[questionNo]}</span>
            )}
          </div>
        );

      case 'CHECKBOX':
        return (
          <div key={questionNo} className="feedback-question">
            <label className="feedback-question-label">
              {questionText} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <div className="feedback-checkbox-group">
              {options.map((option, index) => (
                <label key={index} className="feedback-checkbox-option">
                  <input
                    type="checkbox"
                    name={`question-${questionNo}-${index}`}
                    value={option}
                    checked={Array.isArray(value) ? value.includes(option) : false}
                    onChange={(e) => handleInputChange(questionNo, option, questionType, e.target.checked)}
                  />
                  <span className="feedback-checkbox-text">{option}</span>
                </label>
              ))}
            </div>
            {fieldErrors[questionNo] && (
              <span className="feedback-error-message">{fieldErrors[questionNo]}</span>
            )}
          </div>
        );

      case 'REVIEW':
        return (
          <div key={questionNo} className="feedback-question">
            <label className="feedback-question-label">
              {questionText} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <div className="feedback-review-group">
              {options.map((option, index) => (
                <label key={index} className="feedback-review-option">
                  <input
                    type="radio"
                    name={`question-${questionNo}`}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleInputChange(questionNo, e.target.value, questionType)}
                  />
                  <span className="feedback-review-star">
                    {parseInt(option) <= parseInt(value) ? '★' : '☆'}
                  </span>
                  <span className="feedback-review-label">{option}</span>
                </label>
              ))}
            </div>
            {fieldErrors[questionNo] && (
              <span className="feedback-error-message">{fieldErrors[questionNo]}</span>
            )}
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
              className="feedback-number-input"
              min="1"
              placeholder="Enter a number..."
            />
            {fieldErrors[questionNo] && (
              <span className="feedback-error-message">{fieldErrors[questionNo]}</span>
            )}
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
              className="feedback-textarea"
              rows={4}
              placeholder="Enter your response here..."
            />
            {fieldErrors[questionNo] && (
              <span className="feedback-error-message">{fieldErrors[questionNo]}</span>
            )}
          </div>
        );

      case 'EMAIL':
        return (
          <div key={questionNo} className="feedback-question">
            <label className="feedback-question-label">
              {questionText} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <input
              type="email"
              value={value}
              onChange={(e) => handleInputChange(questionNo, e.target.value, questionType)}
              className="feedback-email-input"
              placeholder="Enter your email address..."
            />
            {fieldErrors[questionNo] && (
              <span className="feedback-error-message">{fieldErrors[questionNo]}</span>
            )}
          </div>
        );

      case 'TEXT':
        return (
          <div key={questionNo} className="feedback-question">
            <label className="feedback-question-label">
              {questionText} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(questionNo, e.target.value, questionType)}
              className="feedback-text-input"
              placeholder="Enter your response..."
            />
            {fieldErrors[questionNo] && (
              <span className="feedback-error-message">{fieldErrors[questionNo]}</span>
            )}
          </div>
        );

      case 'PHONE':
        return (
          <div key={questionNo} className="feedback-question">
            <label className="feedback-question-label">
              {questionText} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <input
              type="tel"
              value={value}
              onChange={(e) => handleInputChange(questionNo, e.target.value, questionType)}
              className="feedback-phone-input"
              placeholder="Enter your phone number..."
              pattern="[0-9]{10}"
            />
            {fieldErrors[questionNo] && (
              <span className="feedback-error-message">{fieldErrors[questionNo]}</span>
            )}
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
