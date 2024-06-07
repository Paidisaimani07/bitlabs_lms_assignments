import React, { useEffect } from 'react';
import './Snackbar.css';
import { Link } from 'react-router-dom';
import successIcon from '../../images/accept.png'; // Ensure the path is correct
import errorIcon from '../../images/close.png'; // Ensure the path is correct

const Snackbar = ({ message, link, linkText, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`snackbar ${type}`}>
      <div className="snackbar-content">
        <div className="message-container">
          {type === 'success' ? (
            <div className="icon success-icon">
              <img src={successIcon} alt="Success" />
            </div>
          ) : (
            <div className="icon error-icon">
              <img src={errorIcon} alt="Error" />
            </div>
          )}
          <span className="snackbar-message">{message}</span>
          {link && (
            <Link to={link} className="snackbar-link">
              {linkText}
            </Link>
          )}
        </div>
        <button className="close-button custom-close-button" onClick={onClose}>
          &#x2716;
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
