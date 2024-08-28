import React from 'react';

const TestExitPopup = ({ onConfirm, onCancel }) => {
  return (
    <div className="exit-popup">
      <p>Do you really want to exit?</p>
      <p>Exiting will erase your progress and prevent retaking the test for 7 days. Proceed?</p>
      <button onClick={onCancel}>No</button>
      <button onClick={onConfirm}>Yes</button>
    </div>
  );
};

export default TestExitPopup;
