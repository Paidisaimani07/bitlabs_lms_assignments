import React from 'react';
import Modal from 'react-modal';
import { useHistory, useNavigate } from 'react-router-dom';

Modal.setAppElement('#root');

const ModalComponent = ({ isOpen, onRequestClose, loginUrl }) => {
  const navigate=useNavigate();
  const handleClose = () => {
    onRequestClose();
    navigate('/applicant-find-jobs');
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Login Modal"
      style={{
        overlay: {
          zIndex: 1000, // Set a high z-index for the overlay
        },
        content: {
          width: '1366px', // Set the width to typical laptop screen width
          height: '768px', // Set the height to typical laptop screen height
          maxWidth: '100%', // Ensure the modal doesn't exceed the screen width
          maxHeight: '100%', // Ensure the modal doesn't exceed the screen height
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001, // Set a high z-index for the content
        },
      }}
      >
      <div>
        <iframe src={loginUrl} width="100%" height="500px" title="Login"></iframe>
        <button onClick={handleClose}>Close</button>
      </div>
    </Modal>
  );
};

export default ModalComponent;
