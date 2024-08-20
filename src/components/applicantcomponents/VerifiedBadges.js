import React from 'react';
import './VerifiedBadges.css';

const VerifiedBadges = () => {
  return (
    <div className="verified-badges-container">
      <h1 className="title">Verified Badges</h1>

      <div className="pre-screened-badge">
        <h2 className="subtitle">Pre-Screened badge</h2>
        <p className="description">
          Achieve your dream job faster by demonstrating your aptitude and technical skills
        </p>

        <div className="progress-bar">
          <div className="step active">
            <div className="circle">1</div>
            <p>General Aptitude Test</p>
          </div>
          <div className="step">
            <div className="circle">2</div>
            <p>Technical Test</p>
          </div>
          <div className="step">
            <div className="circle">P</div>
            <p>Verification done</p>
          </div>
        </div>

        <div className="test-card">
          <div className="test-info">
            <h3>General Aptitude Test</h3>
            <p>A Comprehensive Assessment to Measure Your Analytical and Reasoning Skills</p>
          </div>
          <div className="test-action">
            <button className="take-test-button">Take Test</button>
          </div>
          <div className="test-image">
            <img src="/path-to-your-image.png" alt="Test Badge" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifiedBadges;
