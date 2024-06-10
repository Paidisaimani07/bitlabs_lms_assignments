import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { Link } from 'react-router-dom';
import BackButton from '../common/BackButton';
import { useNavigate } from "react-router-dom";
import Phone from '../../images/icons/phone.png';
import Mail from '../../images/icons/mail.png';
import Edit from '../../images/icons/edit.png';
import Camera from '../../images/icons/camera.png';
import Ellipse from '../../images/icons/Ellipse.png';
import UploadImageComponent from './UploadImageComponent';
import BasicDetailsEditPopup from './BasicDetailsEditPopup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import './modalpopup.css'; // Import the CSS file

const ApplicantViewProfile = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileid1, setprofileid] = useState(0);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertShown, setAlertShown] = useState(false);
  const [experience, setExperience] = useState();
  const [basicDetails, setBasicDetails] = useState();
  const [qualification, setQualification] = useState();
  const [specialization, setSpecialization] = useState();
  const [preferredJobLocations, setpreferredJobLocations] = useState([]);
  const [cameraModalIsOpen, setCameraModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useUserContext();
  const id = user.id;
  const userId = user.id;
  
  const checkAndShowAlert = (message) => {
    const alertShownBefore = localStorage.getItem('alertShown');
    if (!alertShownBefore && !loading) {
      const userResponse = window.confirm(message);
      if (userResponse) {
        localStorage.setItem('alertShown', 'true');
        setAlertShown(true);
      }
    }
  };

  useEffect(() => {
    let count = 0;
    let profileResponse = null;
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        profileResponse = await axios.get(`${apiUrl}/applicantprofile/${id}/profile-view`);
        setProfileData(profileResponse.data);
        setBasicDetails(profileResponse.data.basicDetails);
        setExperience(profileResponse.data.experience);
        setQualification(profileResponse.data.qualification);
        setSpecialization(profileResponse.data.specialization);
        setpreferredJobLocations(profileResponse.data.preferredJobLocations);
        const profileId = profileResponse.data;
        setprofileid(profileId);
        console.log('profileData:', profileData);
        count = 1;
        const imageResponse = await axios.get(`${apiUrl}/applicant-image/getphoto/${id}`, { responseType: 'arraybuffer' });
        const base64Image = btoa(
          new Uint8Array(imageResponse.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        setImageSrc(`data:${imageResponse.headers['content-type']};base64,${base64Image}`);
  
        setLoading(false);
        
      } catch (error) {
        setLoading(false);
        if (count === -1 && isMounted) {
          window.alert('Profile not found. Please fill in your profile');
          window.location.href = '/applicant-update-profile';
        }
        
      }
    };
  
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [user]);  

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!profileData ||  alertShown) {
    return (
      <div>
        {(!profileData ) && <p>Please fill in your bio data and upload a profile pic.</p>}
        {alertShown && <p>Alert already shown.</p>}
      </div>
    );
  }
  
  const handleCameraClick = () => {
    setCameraModalIsOpen(true);
  };

  const handleEditClick = () => {
    setEditModalIsOpen(true);
  };

  const closeCameraModal = () => {
    setCameraModalIsOpen(false);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
  };

  return (
    <div className="dashboard__content">
      <section className="page-title-dashboard">
      </section>
      <div className="features-job-view">
        <div className="wd-author-page-title">
          <div className="author-archive-header">
            <div className="profile-picture-container">
              <img
                width="100px"
                height="100px"
                src={imageSrc || '../images/user/avatar/profile-pic.png'}
                alt="Profile"
                onError={() => setImageSrc('../images/user/avatar/profile-pic.png')}
                style={{ borderRadius: '100px', position: 'relative' }}
              />
              <img
                src={Camera}
                alt="Upload Profile Picture"
                onClick={handleCameraClick}
                className="camera-icon"
              />
              <Modal
                isOpen={cameraModalIsOpen}
                onRequestClose={closeCameraModal}
                contentLabel="Upload Photo"
                className="modal-content"
                overlayClassName="modal-overlay"
              >
                <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
                  <FontAwesomeIcon icon={faTimes} onClick={closeCameraModal} style={{ cursor: 'pointer', color: '#333' }} />
                </div>
                <UploadImageComponent id={id}/> {/* Pass the actual userId */}
              </Modal>  
            </div>
            <img src={Edit} alt="Edit" className="edit-icon" onClick={handleEditClick} />
            <Modal
              isOpen={editModalIsOpen}
              onRequestClose={closeEditModal}
              contentLabel="Edit Details"
              className="modal-content"
              overlayClassName="modal-overlay"
            >
              <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
                <FontAwesomeIcon icon={faTimes} onClick={closeEditModal} style={{ cursor: 'pointer', color: '#333' }} />
              </div>
              <BasicDetailsEditPopup applicantDetails={profileData.basicDetails} />
            </Modal>
            <div className="content">
              <h3 style={{ color: 'white', fontWeight: 'bold', marginBottom: '10px' }}>
                {profileData.basicDetails.firstName} {profileData.basicDetails.lastName}
              </h3>
              <div className="details1">
                <img src={Mail} alt="Email" className="icon1" />
                {profileData.basicDetails.email}
              </div>
              <div className="details1">
                <img src={Phone} alt="Phone" className="icon1" />
                {profileData.basicDetails.alternatePhoneNumber}
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="candidates-section">
        <div className="tf-container">
          <div className="row">
            <div className="col-lg-8">
              <article className="job-article tf-tab single-job stc2">
                <ul className="menu-tab">
                  <li className="ct-tab active"> Education & Experience Details</li>
                </ul>
                <div className="content-tab">
                  <div className="inner-content">
                    <h5>Education</h5>
                    <div className="group-infor">
                      <div className="inner">
                        <div className="heading">Graduation Details</div>
                        <div className="row">
                          <div className="col">
                            <div className="subtitle-1 fw-7">University:</div>
                          </div>
                          <div className="col">
                            <div className="subtitle-2 fw-7">Degree:</div>
                          </div>
                          <div className="col">
                            <div className="subtitle-2 fw-7">Year of Passing:</div>
                          </div>
                        </div>
                        {profileData.graduationDetails && profileData.graduationDetails.map((graduation, index) => (
                          <div className="row" key={index}>
                            <div className="col">{graduation.university}</div>
                            <div className="col">{graduation.degree}</div>
                            <div className="col">{graduation.yearOfPassing}</div>
                          </div>
                        ))}
                      </div>
                      <div className="inner">
                        <div className="heading">Intermediate Details</div>
                        <div className="row">
                          <div className="col">
                            <div className="subtitle-1 fw-7">Board Name:</div>
                          </div>
                          <div className="col">
                            <div className="subtitle-2 fw-7">Percentage:</div>
                          </div>
                          <div className="col">
                            <div className="subtitle-2 fw-7">Year of Passing:</div>
                          </div>
                        </div>
                        {profileData.intermediateDetails && profileData.intermediateDetails.map((intermediate, index) => (
                          <div className="row" key={index}>
                            <div className="col">{intermediate.boardName}</div>
                            <div className="col">{intermediate.percentage}</div>
                            <div className="col">{intermediate.yearOfPassing}</div>
                          </div>
                        ))}
                      </div>
                      <div className="inner">
                        <div className="heading">Class X Details</div>
                        <div className="row">
                          <div className="col">
                            <div className="subtitle-1 fw-7">Board Name:</div>
                          </div>
                          <div className="col">
                            <div className="subtitle-2 fw-7">Percentage:</div>
                          </div>
                          <div className="col">
                            <div className="subtitle-2 fw-7">Year of Passing:</div>
                          </div>
                        </div>
                        {profileData.xDetails && profileData.xDetails.map((x, index) => (
                          <div className="row" key={index}>
                            <div className="col">{x.boardName}</div>
                            <div className="col">{x.percentage}</div>
                            <div className="col">{x.yearOfPassing}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <h5>Experience</h5>
                    <div className="group-infor">
                      {profileData.experienceDetails && profileData.experienceDetails.map((experience, index) => (
                        <div className="inner" key={index}>
                          <div className="heading">Job {index + 1}</div>
                          <div className="row">
                            <div className="col">
                              <div className="subtitle-1 fw-7">Company Name:</div>
                            </div>
                            <div className="col">
                              <div className="subtitle-1 fw-7">Role:</div>
                            </div>
                            <div className="col">
                              <div className="subtitle-2 fw-7">Duration:</div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col">{experience.companyName}</div>
                            <div className="col">{experience.role}</div>
                            <div className="col">{experience.duration}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApplicantViewProfile;
