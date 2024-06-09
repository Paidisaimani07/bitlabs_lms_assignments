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
const ApplicantViewProfile = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileid1, setprofileid] = useState(0);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertShown, setAlertShown] = useState(false);
  const[experience,setExperience]=useState();
  const[basicDetails,setBasicDetails]=useState();
   const[qualification,setQualification]=useState();
   const[specialization,setSpecialization]=useState();
   const[preferredJobLocations,setpreferredJobLocations]=useState([]);
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
<div className="themes-container">
<div className="row">
<div className="col-lg-12 col-md-12 ">
<div className="title-dashboard">
{/* <BackButton /> */}
<div className="title-dash flex2">My Profile</div>
</div>
</div>
</div>
</div>
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
         className="camera-icon"/>
           <Modal
        isOpen={cameraModalIsOpen}
        onRequestClose={closeCameraModal}
        contentLabel="Upload Photo"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark background for better visibility
            zIndex: 1000, // Ensure the overlay covers other content
          },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1001, // Ensure the modal content is above the overlay
          },
        }}
      >
         <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <FontAwesomeIcon icon={faTimes} onClick={closeCameraModal} style={{ cursor: 'pointer', color: '#333' }} />
        </div>
        <UploadImageComponent id={id}/> {/* Pass the actual userId */}
        
      </Modal>

         
        
          
        
      </div>
      <div className="content">
        <h4>{/* Content here */}</h4>
        <div className='details1'>
       
  {profileData.basicDetails.firstName + ' ' + profileData.basicDetails.lastName}
 
  </div>
       
            
            <img src={Edit} alt="Edit" className="edit-icon"  onClick={handleEditClick}  />
            <Modal
        isOpen={editModalIsOpen}
        RequestClose={closeEditModal}
        contentLabel="Upload Photo"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark background for better visibility
            zIndex: 1000, // Ensure the overlay covers other content
          },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1001, // Ensure the modal content is above the overlay
          },
        }}
      >
         <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <FontAwesomeIcon icon={faTimes} onClick={closeEditModal} style={{ cursor: 'pointer', color: '#333' }} />
        </div>
        <BasicDetailsEditPopup applicantDetails={profileData.basicDetails} /> {/* Pass the actual userId */}
        
      </Modal>
      
        <div className="details1">
          <img src={Mail} alt="Email" className="icon" />
          {profileData.basicDetails.email}
        </div>
        <div className="details1">
          <img src={Phone} alt="Phone" className="icon" />
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
              {/* <li className="ct-tab">Portfolio</li>
              <li className="ct-tab">Contact</li> */}
            </ul>
            <div className="content-tab">
              <div className="inner-content">
                <h5>Education</h5>
                <div className="group-infor">
                  <div className="inner">
                    <div className="heading">
                      Graduation 
                    </div>
                    <div className="row">
  <div className="col">
    <div className="subtitle-1 fw-7">University:<br/> {(profileData.graduationDetails && profileData.graduationDetails.gboard) || ''}</div>
  </div>
  <div className="col">
    <div className="subtitle-1 fw-7">
      Branch:<br /> {(profileData.graduationDetails && profileData.graduationDetails.gprogram) || <span style={{ color: '#808080' }}></span>}
    </div>
  </div>
  <div className="col">
    <div className="subtitle-2 fw-7 fw-5">
      Percentage: <br /> {(profileData.graduationDetails && profileData.graduationDetails.gpercentage) || <span style={{ color: '#808080',textAlign:'center'}}></span>}
    </div>
  </div>
  <div className="col">
    <div className="subtitle-2 fw-7 fw-5">
      Year of Passing:<br />  {(profileData.graduationDetails && profileData.graduationDetails.gyearOfPassing) || <span style={{ color: '#808080' }}></span>}
    </div>
  </div>
</div>
                    
                  </div>
                  <div className="inner">
                    <div className="heading">
                    Intermediate Details:
                    </div>
                    <div className="row">
                    
  <div className="col">
  <div className="subtitle-1 fw-7">
  Board: <br /> {(profileData.intermediateDetails && profileData.intermediateDetails.iboard) || <span style={{ color: '#808080' }}></span>}
  </div>
  </div>
  <div className="col">
    <div className="subtitle-1 fw-7">
    Branch: <br />{(profileData.intermediateDetails && profileData.intermediateDetails.iprogram) || <span style={{ color: '#808080' }}></span>}
    </div>
  </div>
  <div className="col">
    <div className="subtitle-2 fw-7 fw-5">
    Percentage:<br /> {(profileData.intermediateDetails && profileData.intermediateDetails.ipercentage) || <span style={{ color: '#808080'}}></span>}
    </div>
  </div>
  <div className="col">
    <div className="subtitle-2 fw-7 fw-5">
    Year of Passing: <br />{(profileData.intermediateDetails && profileData.intermediateDetails.iyearOfPassing) || <span style={{ color: '#808080' }}></span>}
    </div>
  </div>
</div>
                  </div>
                  <div className="inner">
                    <div className="heading">
                    SSC Details:
                    </div>
                    <div className="row">
  <div className="col">
  <div className="subtitle-1 fw-7">
  Board:<br /> {(profileData.xClassDetails && profileData.xClassDetails.xboard) || <span style={{ color: '#808080' }}></span>}
</div>
  </div>
  <div className="col">
  <div className="subtitle-1 fw-7">
  Percentage:<br /> {(profileData.xClassDetails && profileData.xClassDetails.xpercentage) || <span style={{ color: '#808080' }}></span>}
</div>
  </div>
  <div className="col">
  <div className="subtitle-1 fw-7">
  Year of Passing:<br /> {(profileData.xClassDetails && profileData.xClassDetails.xyearOfPassing) || <span style={{ color: '#808080' }}></span>}
</div>
  </div>
  <div className="col">
    {/* <div className="subtitle-2 fw-7 fw-5">
    Year of Passing: {(profileData.intermediateDetails && profileData.intermediateDetails.iyearOfPassing) || <span style={{ color: '#808080' }}></span>}
    </div> */}
  </div>
</div>
                  </div>
                </div>
                <h5>Experience</h5>
                <div className="group-infor">
  {profileData && profileData.experienceDetails && profileData.experienceDetails.map((experience, index) => (
  <div className="inner" key={index}>
    <div className="row">
      <div className="col">
        <div className="subtitle-1 fw-7">
          Company: <br /> {experience.company || ""}
        </div>
      </div>
      <div className="col">
        <div className="subtitle-1 fw-7">
          Position: <br /> {experience.position || ""}
        </div>
      </div>
      <div className="col">
        <div className="subtitle-2 fw-7 fw-5">
          Start Date: <br /> {experience.startDate || ""}
        </div>
      </div>
      <div className="col">
        <div className="subtitle-2 fw-7 fw-5">
          End Date: <br /> {experience.endDate || ""}
        </div>
      </div>
    </div>
  </div>
))}
</div>
              </div>
              </div>
          </article>
        </div>
        <div className="col-lg-4 ">
          <div className="cv-form-details stc2 po-sticky">
            <ul className="list-infor">
            <li>
                <div className="category">Email</div>
                <div className="detail">
                {profileData.applicant.email}
                </div>
              </li>
              <li>
                <div className="category">Phone Number</div>
                <div className="detail">{profileData.applicant.mobilenumber} </div>
              </li>
              <li>
                <div className="category">Preferred Job Location</div>
                <div className="detail">{profileData && profileData.preferredJobLocations && profileData.preferredJobLocations.map((location, index) => (
    <span key={index}>
      {location}
      {index !== profileData.preferredJobLocations.length - 1 && ', '}
    </span>
  ))}
  
  {(profileData.basicDetails && profileData.basicDetails.city) || ''}
  </div>
              </li>
              <li>
                <div className="category">Experience</div>
                <div className="detail">{profileData.experience}</div>
              </li>
              {/* <li>
                <div className="category">Language</div>
                <div className="detail">English, Vietnamese </div>
              </li>
              <li>
                <div className="category">Age</div>
                <div className="detail">26 Years Old</div>
              </li> */}
              <li>
                <div className="category">Qualification</div>
                <div className="detail">{profileData && profileData.qualification|| ''}</div>
              </li>
            </ul>
            {/* <div className="preview-cv mgt-32">
              <div className="title">Samle_cv_jobitex</div>
              <div className="category">PDF</div>
              <div className="icon icon-file-pdf" />
            </div> */}
            {/* <a href="#" className="btn-dowload">
              <i className="icon-download" /> Download CV
            </a> */}
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
  ); 
}; 
export default ApplicantViewProfile;