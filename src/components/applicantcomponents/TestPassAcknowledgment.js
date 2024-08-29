import React from 'react';
import { Link,useNavigate } from 'react-router-dom';
import TestPass from '../../images/testpassed.png';
import './css/TestAcknowledgment.css';


const TestPassAcknowledgment = ({ score, handleTakeTest }) => {
  const navigate = useNavigate();

  const handleTakeTest1 = () => {
   
    navigate(-1); // Then navigate to the test
  };

  return (
    <div className="acknowledgment-container">
      <div className="acknowledgment-content">
        <img src={TestPass} className="acknowledgment-image" alt="Test Passed"/>
        <p className="acknowledgment-score">You Scored {score}%</p>
        <p style={{ color: '#8C8C8C', fontSize: '24px', lineHeight: '30px' }}>
          Congratulations You have Successfully<br />
          Completed General Aptitude test
        </p>
        <p className="acknowledgment-subtext">
          Now you are eligible for Technical Test
        </p>
        <button
          className="acknowledgment-btn"
          onClick={() => handleTakeTest('Technical Test')}
        >
          Take Test
        </button>
        <Link
          onClick={handleTakeTest1} // Use the same handle to close and navigate
          style={{ color: '#0D4CC5', fontSize: '20px', marginLeft: '20px', textDecoration: 'underline', fontWeight: 'bold' }}
        >
          I’ll take later
        </Link>
      </div>
    </div>
  );
};

export default TestPassAcknowledgment;
