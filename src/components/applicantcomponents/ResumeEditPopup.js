import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useUserContext } from '../common/UserProvider';
import ModalWrapper from './ModalWrapper';
import ResumeBuilder from './ResumeBuilder';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';

Modal.setAppElement('#root'); // This is required by react-modal for accessibility

const ResumeEditPopup = ({ id, resumeFileName }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [fileName, setFileName] = useState(resumeFileName || ''); // Use resumeFileName as the initial state
  const [modalIsOpen, setModalIsOpen] = useState(true);
  const [error, setError] = useState('');
  const [requestData, setRequestData] = useState(null);
  const [loginUrl, setLoginUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUserContext();

  const openModal = () => setIsModalOpen(true);
 const closeModal = () => {
    setIsModalOpen(false);
    window.location.reload(); // Reload the page when closing the modal
  };

  const handleInputChange = (event) => {
    setFileName(event.target.value);
  };

  const handleResumeSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1048576) { // Check if file size is greater than 1MB (1MB = 1048576 bytes)
        setError('File size should be less than 1MB.');
        setResumeFile(null);
        setFileName(''); // Clear file name if file is too large
      } else {
        setResumeFile(file);
        setFileName(file.name); // Set file name
        setError('');
      }
    } else {
      setError('Only PDF files are allowed.');
      setResumeFile(null);
      setFileName(''); // Clear file name if invalid file
    }
  };


  const triggerFileInputClick = () => {
    document.getElementById('tf-upload-resume').click();
  };

  const handleResumeUpload = async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const response = await axios.post(
        `${apiUrl}/resume/upload/${user.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      console.log(response.data);
      window.alert(response.data);
      window.location.reload();
    } catch (error) {
      console.error('Error uploading resume:', error);
      window.alert('Error uploading resume. Please try again.');
    }
  };

 
  return (
    <div id="upload-resume-editprofile">
      <div className="popup-heading-editprofile1">Resume</div>
      <div className="file-upload">
        <input
          className="up-file"
          id="tf-upload-resume"
          type="file"
          name="resume"
          accept="application/pdf"
          required=""
          onChange={handleResumeSelect}
        />
               
      </div>
      <div className="row-editprofile">
        <i className="file-icon"></i>
        <input
          type="text"
          value={fileName} // Display fileName state
          onChange={handleInputChange}
          className="file-name-input-resume"
          placeholder="No file selected"
        />
        <button
          type="button"
          onClick={triggerFileInputClick}
          className="browse-btn-resume"
        >
          Browse
        </button>
        <span className="separator">Or</span>
        <button
          type="button"
          onClick={openModal}
          className="build-btn-resume"
        >
          Build Your Resume
        </button>
      </div>
      <ModalWrapper isOpen={isModalOpen} onClose={closeModal} title="Build Your Resume">
        <ResumeBuilder />
      </ModalWrapper>
      {error && <div className="error-message">{error}</div>}
      <div className="save-resume">
        <button
          type="button"
          onClick={handleResumeUpload}
          className="save-btn-resume"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ResumeEditPopup;
