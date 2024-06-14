import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';

Modal.setAppElement('#root'); // This is required by react-modal for accessibility

const ResumeEditPopup = ({ id }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [fileName, setFileName] = useState(''); // New state for file name
  const [modalIsOpen, setModalIsOpen] = useState(true);
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension === 'pdf') {
      setResumeFile(file);
      setFileName(file.name); // Set file name
      setError('');
    } else {
      setError('Only PDF files are allowed.');
      setResumeFile(null);
      setFileName(''); // Clear file name if invalid file
    }
  };

  const uploadResume = async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await axios.post(
        `${apiUrl}/applicant-resume/${id}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      console.log('Resume uploaded successfully:', response.data);
      window.alert('Resume uploaded successfully:');
      window.location.reload();
      // Handle the response as needed

    } catch (error) {
      console.error('Error uploading resume:', error);
      // Handle the error as needed
    }
  };

  return (
    <div id="upload-resume-editprofile">
      <div className="popup-heading-editprofile">Resume</div>
      <div className="file-upload">
        <input
          className="up-file"
          id="tf-upload-resume"
          type="file"
          name="resume"
          accept="application/pdf" // Accept only PDF files
          required=""
          onChange={handleFileSelect}
        />
      </div>
      <div className="row-editprofile">
        {fileName && <div className="file-name"><a href="#">{fileName}</a></div>}
        <button
          type="button"
          onClick={() => document.getElementById('tf-upload-resume').click()}
          className="btn browse-btn"
        >
          Browse
        </button>
        <span className="separator">Or</span>
        <button
          type="button"
          onClick={uploadResume}
          className="btn build-btn"
        >
          Build Your Resume
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="save-changes">
        <button
          type="button"
          onClick={uploadResume}
          className="btn save-btn-editprofile"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ResumeEditPopup;
