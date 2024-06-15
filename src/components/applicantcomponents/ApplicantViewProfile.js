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
import Resume from '../../images/icons/resume.png';
import mortarboard1 from '../../images/icons/mortarboard1.png';

import pencil1 from '../../images/icons/pencil1.png';
import UploadImageComponent from './UploadImageComponent';
import BasicDetailsEditPopup from './BasicDetailsEditPopup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import './modalpopup.css'; // Import the CSS file
import ProfessionalDetailsPopup from './ProfessionalDetailsPopup';
import ResumeEditPopup from './ResumeEditPopup';

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
  const [edit1ModalIsOpen, setEdit1ModalIsOpen] = useState(false);
  const [resumeModalIsOpen, setResumeModalIsOpen] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');
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
        const resumeResponse = await axios.get(`${apiUrl}/resume/pdf/${id}`);
          console.log('resumeResponse:', resumeResponse);

          if (resumeResponse.data && resumeResponse.data.fileName) {
            setResumeFileName(resumeResponse.data.fileName);
          } else {
            console.error('No resume fileName found:', resumeResponse.data);
          }
        
  
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
  const handleResumeClick = () => {
    setResumeModalIsOpen(true);
  };

  
  const handleEdit1Click = () => {
    setEdit1ModalIsOpen(true);
  };

  const closeCameraModal = () => {
    setCameraModalIsOpen(false);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
  };
  const closeResumeModal = () => {
    setResumeModalIsOpen(false);
  };
  const closeEdit1Modal = () => {
    setEdit1ModalIsOpen(false);
  };

  return (
    <div className="dashboard__content">
      <section className="page-title-dashboard">
   
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
              <Link>
              <img
                src={Camera}
                alt="Upload Profile Picture"
                onClick={handleCameraClick}
                className="camera-icon"
              />
              </Link>
              <Modal
                isOpen={cameraModalIsOpen}
                onRequestClose={closeCameraModal}
                contentLabel="Upload Photo"
                className="modal-content1"
                overlayClassName="modal-overlay"
              >
                <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
                  <FontAwesomeIcon icon={faTimes} onClick={closeCameraModal} style={{ cursor: 'pointer', color: '#333' }} />
                </div>
                <UploadImageComponent id={id}/> {/* Pass the actual userId */}
              </Modal>  
            </div>
            <Link><img src={Edit} alt="Edit" className="edit-icon" onClick={handleEditClick} /></Link>
            <Modal
              isOpen={editModalIsOpen}
              onRequestClose={closeEditModal}
              contentLabel="Edit Details"
              className="modal-content2"
              overlayClassName="modal-overlay"
            >
              <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
                <FontAwesomeIcon icon={faTimes} onClick={closeEditModal} style={{ cursor: 'pointer', color: '#333' }} />
              </div>
              <BasicDetailsEditPopup applicantDetails={profileData.basicDetails} />
            </Modal>
            <div className="content">
            <h3 style={{ color: 'white', fontWeight: 'bold', marginBottom: '10px' }}>
                {(profileData.basicDetails && profileData.basicDetails.firstName) || ''}{' '}
                {(profileData.basicDetails && profileData.basicDetails.lastName) || ''}
              </h3>
              <div className="details1">
                <img src={Mail} alt="Email" className="icon1" />
                {profileData.basicDetails && profileData.basicDetails.email || ''}
              </div>
              <div className="details1">
                <img src={Phone} alt="Phone" className="icon1" />
                {profileData.basicDetails && profileData.basicDetails.alternatePhoneNumber || ''}
              </div>
            </div>
          </div>
        </div>
      </div>
      </section> 
      <div className="features-job-view1">
        {/* <div className="wd-author-page-title">
          <div className="author-archive-header"></div>
          </div>  */}
          <div className='prof-container'>
           <div class="professional-details-container">
    <span > <img src={mortarboard1} alt="mortarboard1" class="icon-prof"  /></span> 
    <span class="text">Professional Details</span>
    </div>
     <div className='icon-prof'>
      <Link>
     <img src={pencil1} alt="pencil1"  onClick={handleEdit1Click} /></Link>
     </div>
    <Modal
              isOpen={edit1ModalIsOpen}
              onRequestClose={closeEdit1Modal}
              contentLabel="Edit Details"
              className="modal-content"
              overlayClassName="modal-overlay"
            >
              <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
                <FontAwesomeIcon icon={faTimes} onClick={closeEdit1Modal} style={{ cursor: 'pointer', color: '#333' }} />
              </div>
              <ProfessionalDetailsPopup applicantDetails={profileData} />
            </Modal>
            </div>

          <div className="content-tab-prof">
                  <div className="inner-content">
                  
                    <div className="inner-profdata">
                   
                      <div className="inner">
                
                        <div className="text-heading-profdata">Qualification</div>
                          
                       <div >
                        <p style={{
                          color:'black',
                          fontWeight:'bold'
                          }}> {profileData.qualification} </p></div>
                        
                      </div>
                      <div className="inner">
                
                <div className="text-heading-profdata">Specialization</div>
                  
                <p style={{
                          color:'black',
                          fontWeight:'bold'
                          }}> {profileData.specialization}</p>
                
              </div>
              <div className="inner">
                
                <div className="text-heading-profdata">Skills</div>
                <div><ul className="author-list">
              <li className='skills-list'>  {profileData.skillsRequired && profileData.skillsRequired.map((skill, index) => (
  <React.Fragment key={skill.id}>
    <span>
      <a>
        <ul className="skill-but">
          <li >  {skill.skillName}</li>
        </ul>
        </a>
    </span>
    {index < profileData.skillsRequired.length - 1 && " "}
  </React.Fragment>
))}           </li>
            </ul>
            </div>
                  
             
              </div>
              
              <div className="inner">
                
                <div className="text-heading-profdata">Experience</div>
                  
                <p style={{
                          color:'black',
                          fontWeight:'bold'
                          }}> {profileData.experience}</p>
                
              </div>
              <div className="inner">
                
                <div className="text-heading-profdata">preferred Locations</div>
                  
                <p style={{
                          color:'black',
                          fontWeight:'bold'
                          }}> {profileData.preferredJobLocations.join(', ')}</p>
                
              </div>
                    
                    </div>
                    
                  </div> 
                </div>
          </div>
          
      {/* <section className="candidates-section">
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
      </section> */}
      <div className="features-job-view2">
      <div className='prof-container'>
           <div class="professional-details-container">
    <span > <img src={Resume} alt="mortarboard1" class="icon-prof"  /></span> 
    <span class="text">Resume</span>
    <div className="resume-text" onClick={handleResumeClick}>{resumeFileName || 'Resume'}</div>
        
    </div>
     <div className='icon-prof'>
      <Link>
     <img src={pencil1} alt="pencil1"  onClick={handleResumeClick} /></Link>
     </div>
     <Modal
              isOpen={resumeModalIsOpen}
              onRequestClose={closeResumeModal}
              contentLabel="Edit Details"
              className="modal-content3"
              overlayClassName="modal-overlay"
            >
              <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
                <FontAwesomeIcon icon={faTimes} onClick={closeResumeModal} style={{ cursor: 'pointer', color: '#333' }} />
              </div>
              <ResumeEditPopup  id={id} />
            </Modal> 
            </div>

      </div>
    </div>
    
  );
};

export default ApplicantViewProfile;
