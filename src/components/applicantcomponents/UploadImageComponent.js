import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate, useLocation,useParams  } from 'react-router-dom';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';

Modal.setAppElement('#root'); // This is required by react-modal for accessibility

const UploadImageComponent = ({ id}) => {
  const [photoFile, setPhotoFile] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(true);
  

  const handleFileSelect = (event) => {
    setPhotoFile(event.target.files[0]);
  };

  const uploadPhoto = async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await axios.post(
        `${apiUrl}/applicant-image/${id}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      console.log('Photo uploaded successfully:', response.data);
      window.alert('Photo uploaded successfully:');
      window.location.reload();
      // Handle the response as needed

    } catch (error) {
      console.error('Error uploading photo:', error);
      // Handle the error as needed
    }
  };

  return (
    <div id="upload-profile">
      <div className='popup-heading'>Upload your profile picture:JPG or PNG
      
      </div>
    
      <input
        className="up-file"
        id="tf-upload-img"
        type="file"
        name="profile"
        required=""
        onChange={handleFileSelect}
      />
      <button
        type="button"
        onClick={uploadPhoto}
        className="btn-3"
        style={{
          backgroundColor: '#F97316',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginLeft: '5px',
          marginTop: '5px',
          textTransform:'capitalize'
        }}
      >
        Upload Photo
      </button>
    </div>
  );
};

export default UploadImageComponent;
