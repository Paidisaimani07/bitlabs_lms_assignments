import React from 'react'
import { useState, useEffect } from 'react';
import { useUserContext } from '../common/UserProvider';
import ApplicantAPIService,{ apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';
import { Link } from 'react-router-dom';
import BackButton from '../common/BackButton';
 
function RecruiterMyOrganization() {
   
    const [companyName, setCompanyName] = useState('');
    const [website, setWebsite] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [verificationStatus, setVerificationStatus] = useState(false);
    const [photoFile,setPhotoFile]=useState(null);
    const [isProfileSubmitted, setIsProfileSubmitted] = useState(localStorage.getItem('isProfileSubmitted') === 'true');
    const [socialProfiles, setSocialProfiles] = useState({
      twitter: '',
      instagram: '',
      youtube: '',
    });
    const [token, setToken] = useState('');
    const [headOffice, setHeadOffice] = useState('');
    const [twitter, setTwitter] = useState('');
    const [instagram, setInstagram] = useState('');
    const [youtube, setYoutube] = useState('');
    const [formErrors, setFormErrors] = useState({
      companyName: '',
      website: '',
      phoneNumber: '',
      email: '',
      headOffice: '',
      instagram: '',
    });
 
    const user1 = useUserContext();
    const user = user1.user;
 
    useEffect(() => {
      const storedToken = localStorage.getItem('jwtToken');
      if (storedToken) {
        setToken(storedToken);
      }
    }, []);
 
 
    const handleCompanyNameChange = (e) => {
      setCompanyName(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        companyName: '', 
      }));
    };
    const handleWebsiteChange = (e) => {
      setWebsite(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        website: '', 
      }));
    };
    const handlePhoneNumberChange = (e) => {
      setPhoneNumber(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        phoneNumber: '',
      }));
    };
    const handleHeadOfficeChange = (e) => {
      setHeadOffice(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        headOffice: '', 
      }));
    };
    const handleTwitterChange = (e) => {
      setTwitter(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        twitter: '', 
      }));
    };
    const handleInstagramChange = (e) => {
      setInstagram(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        instagram: '', 
      }));
    };
    const handleYoutubeChange = (e) => {
      setYoutube(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        youtube: '', 
      }));
    };
    const handleEmailChange = (e) => {
      setEmail(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        email: '', 
      }));
    };
    const validateForm = () => {
      let isValid = true;
      const errors = {};
      if (!companyName.trim()) {
        errors.companyName = 'Company name is required';
        isValid = false;
      } else if (companyName.trim().length < 3) {
        errors.companyName = 'Company name must be at least 3 characters';
        isValid = false;
      }
      if (!website.trim()) {
        errors.website = 'Website is required';
        isValid = false;
      } else {
        const websiteRegex = /\.(com|in|org)$/;
        if (!websiteRegex.test(website.trim())) {
          errors.website = 'Website should end with .com, .in, or .org';
          isValid = false;
        }
      }
      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = 'Invalid email address';
        isValid = false;
      }
      if (phoneNumber.trim() && !/^[6-9]\d{9}$/.test(phoneNumber.trim())) {
        errors.phoneNumber = 'Invalid phone number';
        isValid = false;
      }
      if (!headOffice.trim()) {
        errors.headOffice = 'Head office address is required';
        isValid = false;
      }
      else if (headOffice.trim().length < 3) {
        errors.headOffice = 'Head office address must be at least 3 characters';
        isValid = false;
    }
      if (instagram.trim() && !/^[a-zA-Z0-9_]+$/.test(instagram.trim())) {
        errors.instagram = 'Invalid Instagram handle';
        isValid = false;
      }
      if (twitter.trim() && !/^[a-zA-Z0-9_]+$/.test(twitter.trim())) {
        errors.twitter = 'Invalid twitter handle';
        isValid = false;
      }
      if (youtube.trim() && !/^[a-zA-Z0-9_]+$/.test(youtube.trim())) {
        errors.youtube = 'Invalid youtube handle';
        isValid = false;
      }
      setFormErrors(errors);
      return isValid;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
         if (!validateForm()) {
          return;
        }
        try {
          const requestData = {
            companyName,
            website,
            phoneNumber,
            email,
            socialProfiles: [
                twitter,
                instagram,
                youtube,
            ],
            headOffice,
          };
          const response = await fetch(`${apiUrl}/companyprofile/recruiters/company-profiles/${user.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestData),
          });
          if (response.status === 200) {
            const responseData = await response.text();
            console.log('Success:', responseData);
            if (responseData === 'CompanyProfile was already updated.') {
              window.alert('CompanyProfile was already updated.');
              setCompanyName('');
              setWebsite('');
              setPhoneNumber('');
              setEmail('');
              setHeadOffice('');
              setTwitter('');
              setInstagram('');
              setYoutube('');
              setFormErrors({
                companyName: '',
                website: '',
                phoneNumber: '',
                email: '',
                headOffice: '',
                instagram: '',
              });
            } else {
              window.alert('Profile saved successfully');
              setIsProfileSubmitted(true);
              setVerificationStatus(false);
              localStorage.setItem('isProfileSubmitted', 'true'); 
              setCompanyName('');
        setWebsite('');
        setPhoneNumber('');
        setEmail('');
        setHeadOffice('');
        setTwitter('');
        setInstagram('');
        setYoutube('');
        setFormErrors({
          companyName: '',
          website: '',
          phoneNumber: '',
          email: '',
          headOffice: '',
          instagram: '',
        });
            }
          } else {
            console.error('API request failed');
          }
        } catch (error) {
          console.error('An error occurred:', error);
        }
      };
    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      setPhotoFile(file);
    };
    const uploadPhoto = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const formData = new FormData();
        formData.append('logoFile', photoFile);
   
        const response = await axios.post(
          `${apiUrl}/recruiters/companylogo/upload/${user.id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        console.log(response.data);
        window.alert(response.data);
        window.location.reload();
      } catch (error) {
        console.error('Error uploading photo:', error);
        window.alert('Error in uploading profile');
      }
    };
  return (
    <div>
<div className="dashboard__content">
  <section className="page-title-dashboard">
    <div className="themes-container">
      <div className="row">
        <div className="col-lg-12 col-md-12 ">
          <div className="title-dashboard">
          <BackButton />
            <div className="title-dash flex2">My Organization</div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section className="flat-dashboard-post flat-dashboard-setting">
    <form name="f1">
    <div className="themes-container">
      <div className="row">
        <div className="col-lg-12 col-md-12 ">
          <div className="profile-setting bg-white">
            <div className="author-profile flex2 border-bt">
              <div className="wrap-img flex2">
                <div id="upload-profile">
    <h5 class="fw-6">Upload Company Logo: </h5>
    <h6>JPG or PNG</h6>
    <input
      class="up-file"
      id="tf-upload-img"
      type="file"
      name="logoFile"
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
        borderRadius: '5px',
        cursor: 'pointer',
        marginLeft:'5px',
        marginTop:'5px'
      }}
    >
      Upload Photo
    </button>
  </div>
              </div>
              <div className="wrap-img flex2">
              </div>
              <div className="tt-button button-style">
                  <button type="submit" onClick={handleSubmit} className="button-status">Save Profile</button>
              </div>
            </div>
            <div className="form-infor-profile">
              <h3 className="title-info">Information</h3>
              <div className="row">
              <div className="col-lg-6 col-md-6">
              <div className="dropdown titles-dropdown info-wd">
                    <label className="title-user fw-7">Company Full Name<span className="color-red">*</span></label>
                    <input
                  type="text"
                  id="companyName"
                  className="input-form"
                  placeholder="ABC Company Pvt. Ltd"
                  value={companyName}
                 onChange={handleCompanyNameChange}
                  required
                />
                {formErrors.companyName && (
                      <div className="error-message">{formErrors.companyName}</div>
                    )}
                  </div>
                </div>
                <div className="col-lg-6 col-md-6">
                <div className="dropdown titles-dropdown info-wd">
                    <label className="title-user fw-7">Alternate Phone Number</label>
                    <input
                             type="text"
                            id="phoneNumber"
                            className="input-form"
                           placeholder="Alternate Phone Number"
                          value={phoneNumber}
                      onChange={handlePhoneNumberChange}  
                />
                {formErrors.phoneNumber && (
                      <div className="error-message">{formErrors.phoneNumber}</div>
                    )}
                  </div>
                </div>
                <div className="col-lg-6 col-md-6">
                <div className="dropdown titles-dropdown info-wd">
                  <fieldset>
                    <label className="title-user fw-7">Alternate Email</label>
                    <input
                  type="text"
                  id="email"
                  className="input-form"
                  placeholder="support@abc.com"
                  value={email}
                  onChange={ handleEmailChange}
                />
                {formErrors.email && (
                      <div className="error-message">{formErrors.email}</div>
                    )}
                  </fieldset>
                  </div>
                  </div>
                  <div className="col-lg-6 col-md-6">
                  <div className="dropdown titles-dropdown info-wd">
                    <label className="title-user fw-7">Website<span className="color-red">*</span></label>
                    <input
                  type="text"
                  id="website"
                  className="input-form"
                  placeholder="www.abc.com"
                  value={website}
                  onChange={handleWebsiteChange}
                  required
                />
                 {formErrors.website && (
                      <div className="error-message">{formErrors.website}</div>
                    )}
                  </div>
                </div>               
            <div className="col-lg-6 col-md-6">
              <div className="text-editor-wrap border-bt">
                <label className="title-user fw-7">Head Office Address<span className="color-red">*</span></label>
                <fieldset className="info-wd">
                <input
                  type="text"
                  id="address"
                  className="input-form"
                  placeholder="Head Office Address"
                  value={headOffice}
                  onChange={handleHeadOfficeChange}
                  required
                />
                 {formErrors.headOffice && (
                      <div className="error-message">{formErrors.headOffice}</div>
                    )}
                    </fieldset>
              </div>
             </div>
             <div className="row">
              <div className="social-wrap">
                <h3>Social Network</h3>
                <div className="form-box info-wd wg-box">
                  <div className="col-lg-6 col-md-6">
                    <fieldset className="flex2">
                    <span className="icon-youtube" />
                    <input
                    type="text"
                    id="youtube"
                    className="input-form2"
                    placeholder="YouTube"
                    value={youtube}
                    onChange={handleYoutubeChange}
                  />
                    </fieldset>
                  </div>
                  <div className="col-lg-6 col-md-6">
                    <fieldset className="flex2">
                      <span className="icon-twitter" />
                      <input
                    type="text"
                    id="twitter"
                    className="input-form2"
                    placeholder="Twitter"
                    value={twitter}
                    onChange={handleTwitterChange }
                  />
                  {formErrors.twitter && (
                      <div className="error-message">{formErrors.twitter}</div>
                    )}
                    </fieldset>
                  </div>
                  <div className="col-lg-6 col-md-6">
                    <fieldset className="flex2">
                      <span className="icon-instagram1" />
                      <input
                    type="text"
                    id="instagram"
                    className="input-form2"
                    placeholder="Instagram"
                    value={instagram}
                    onChange={handleInstagramChange}
                    required
                  />
                  {formErrors.instagram && (
                      <div className="error-message">{formErrors.instagram}</div>
                    )}
                    </fieldset>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
    </form>
  </section>
 </div>      
</div>
  )
}
export default RecruiterMyOrganization;