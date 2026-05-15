import React from 'react';
import './ScoreSystemModal.css';
import { HiX } from "react-icons/hi";

const ScoreSystemModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="score-modal-overlay" onClick={onClose}>
      <div className="score-modal" onClick={(e) => e.stopPropagation()}>
        <div className="score-modal-header">
          <h2>How do points work?</h2>
          <button className="score-modal-close" onClick={onClose}>
            <HiX />
          </button>
        </div>
        <div className="score-modal-content">
          <p className="score-intro-text">
            You can earn points by taking one of the actions below.
          </p>
          <ul className="score-list">

            <li>
              <div className="score-info">
                <span className="score-icon">🏆</span>
                <div className="score-text-group">
                  <span className="score-label">Conquer The Challenge</span>
                  <span className="score-subtext">Hackathon Submission</span>
                </div>
              </div>
              <span className="score-value">+25 Points</span>
            </li>
            <li>
              <div className="score-info">
                <span className="score-icon">🧠</span>
                <div className="score-text-group">
                  <span className="score-label">Prove Your Expertise</span>
                  <span className="score-subtext">Skill Validation Test</span>
                </div>
              </div>
              <span className="score-value">+20 Points</span>
            </li>
            <li>
              <div className="score-info">
                <span className="score-icon">🚀</span>
                <div className="score-text-group">
                  <span className="score-label">Ignite Your Journey</span>
                  <span className="score-subtext">Hackathon Registration</span>
                </div>
              </div>
              <span className="score-value">+5 Points</span>
            </li>
            <li>
              <div className="score-info">
                <span className="score-icon">🤝</span>
                <div className="score-text-group">
                  <span className="score-label">Link With Leaders</span>
                  <span className="score-subtext">Mentor Connect Registration</span>
                </div>
              </div>
              <span className="score-value">+5 Points</span>
            </li>
            <li>
              <div className="score-info">
                <span className="score-icon">📺</span>
                <div className="score-text-group">
                  <span className="score-label">Catch The Vibe</span>
                  <span className="score-subtext">
                    Watching Tech<br />
                    Buzz Shorts
                  </span>
                </div>
              </div>
              <span className="score-value">+2 Points</span>
            </li>
          </ul>
          <div className="score-modal-footer">
            <button className="score-got-it-btn" onClick={onClose}>Got it!</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreSystemModal;
