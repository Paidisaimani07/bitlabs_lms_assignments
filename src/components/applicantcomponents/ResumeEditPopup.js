import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import File from '../../images/icons/file.png';
import { useUserContext } from '../common/UserProvider';


Modal.setAppElement('#root'); // This is required by react-modal for accessibility

const ResumeEditPopup = ({ id,resumeFileName }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [fileName, setFileName] = useState(''); // New state for file name
  const [modalIsOpen, setModalIsOpen] = useState(true);
  const [error, setError] = useState('');
  const [requestData, setRequestData] = useState(null);
  const [loginUrl, setLoginUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUserContext();
  const [resumeName, setResumeName] = useState('');
  useState(() => {
    setResumeName(resumeFileName);
  }, [resumeFileName]);

  const handleInputChange = (event) => {
    setResumeName(event.target.value);
  };
 
  const handleResumeSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResumeFile(file);
      setFileName(file.name); // Set file name
      setError('');
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

  const handleResumeBuilder = async () => {
    const apiUrl1 = 'https://resume.bitlabs.in:5173/api/auth/login';
    if (requestData) {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      };
      fetch(apiUrl1, requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          const loginUrl = `https://resume.bitlabs.in:5173/auth/login?identifier=${encodeURIComponent(requestData.identifier)}&password=${encodeURIComponent(requestData.password)}`;
          setLoginUrl(loginUrl);
          // window.open(loginUrl, '_blank');
          setIsModalOpen(true);
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
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
          accept="application/pdf" // Accept only PDF files
          required=""
          onChange={handleResumeSelect}
        />
      </div>
      <div className="row-editprofile">
        <i className="file-icon"></i>
        <input
          type="text"
          value={resumeName} onChange={handleInputChange}
          readOnly
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
          onClick={handleResumeBuilder}
          className="build-btn-resume"
        >
          Build Your Resume
        </button>
      </div>

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
