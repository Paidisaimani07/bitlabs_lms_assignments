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
        <p className="acknowledgment-text" style={{ color: '#8C8C8C', fontSize: '24px',marginTop:'-10px' }}>
           Congratulations! You’re now verified for the General Aptitude Test
        </p>
        <p className="acknowledgment-subtext">
          You are now eligible to take the technical test
        </p>
        <div className='but-link'>
        <button
          className="acknowledgment-btn"
          onClick={() => handleTakeTest('Technical Test')}
        >
          Take Test
        </button>
        <Link
        className='link-but'
          onClick={handleTakeTest1} // Use the same handle to close and navigate
          style={{ color: '#0D4CC5', fontSize: '20px', textDecoration: 'underline', fontWeight: 'bold' }}
        >
          I’ll take later
        </Link>
        </div>
      </div>
    </div>
  );
};

export default TestPassAcknowledgment;
