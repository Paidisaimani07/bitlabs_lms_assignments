import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TestPass from '../../images/testpassed.png';
import './css/TestAcknowledgment.css';

const TestPassAcknowledgment = ({ score, testName, handleTakeTest }) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const handleTakeTest1 = () => {
    navigate(-1); // Navigate back to the previous page
  };

  // Handle closing the popup
  const handleExit = () => {
    setIsVisible(false); // Close the popup
    navigate(-1)
  };

  // Conditionally render content based on the testName
  const renderContent = () => {
    if (testName === 'General Aptitude Test') {
      return (
        <div className="acknowledgment-content">
          <img src={TestPass} className="acknowledgment-image" alt="Test Passed" />
          <p className="acknowledgment-score">You Scored {score}%</p>
          <p style={{ color: '#8C8C8C', fontSize: '24px', lineHeight: '30px' }}>
            Congratulations! You have successfully<br />
            completed the General Aptitude Test.
          </p>
          <p className="acknowledgment-subtext">
            Now you are eligible for the Technical Test.
          </p>
          <button
            className="acknowledgment-btn"
            onClick={() => handleTakeTest('Technical Test')}
          >
            Take Test
          </button>
          <Link
            onClick={handleTakeTest1}
            style={{
              color: '#0D4CC5',
              fontSize: '20px',
              marginLeft: '20px',
              textDecoration: 'underline',
              fontWeight: 'bold'
            }}
          >
            I’ll take it later
          </Link>
        </div>
      );
    } else if (testName === 'Technical Test') {
      return (
        <div className="acknowledgment-content">
          <img src={TestPass} className="acknowledgment-image" alt="Test Passed" />
          <p className="acknowledgment-score">You Scored {score}%</p>
          <p style={{ color: '#8C8C8C', fontSize: '24px', lineHeight: '30px' }}>
            Congratulations! You have successfully<br />
            completed the Technical Test.
          </p>
          <p className="acknowledgment-subtext">
            You are now eligible for the next step in the process.
          </p>
          <button
            className="acknowledgment-btn"
            onClick={() => handleTakeTest('Next Step')}
          >
            Proceed to Next Step
          </button>
          <Link
            onClick={handleTakeTest1}
            style={{
              color: '#0D4CC5',
              fontSize: '20px',
              marginLeft: '20px',
              textDecoration: 'underline',
              fontWeight: 'bold'
            }}
          >
            I’ll take it later
          </Link>
        </div>
      );
    } else {
      return (
        <div className="acknowledgment-content">
          <img src={TestPass} className="acknowledgment-image" alt="Test Passed" />
          <p className="acknowledgment-score">You Scored {score}%</p>
          <p style={{ color: '#8C8C8C', fontSize: '24px', lineHeight: '30px' }}>
            Congratulations! You have successfully<br />
            completed the {testName} test.
          </p>
          <button
            className="acknowledgment-btn"
            onClick={handleExit} // Close the popup on exit
          >
            Exit
          </button>
        </div>
      );
    }
  };

  // Only render the popup if it is visible
  return (
    isVisible && (
      <div className="acknowledgment-container">
        {renderContent()}
      </div>
    )
  );
};

export default TestPassAcknowledgment;
