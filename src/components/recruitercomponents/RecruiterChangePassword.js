import React, { useState } from 'react';
import { useUserContext } from '../common/UserProvider';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import { Link } from 'react-router-dom';
import BackButton from '../common/BackButton';
 
function RecruiterChangePassword() {
  const { user } = useUserContext();
  const [oldpassword, setOldPassword] = useState('');
  const [newpassword, setNewPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmedPassword: '',
  });
 
  const validateForm = () => {
    let isValid = true;
    const errors = {};
 
    if (!oldpassword.trim()) {
      errors.oldPassword = 'Old password is required.';
      isValid = false;
    } else {
      errors.oldPassword = '';
    }
 
    if (!newpassword.trim()) {
      errors.newPassword = 'New password is required.';
      isValid = false;
    } else if (!isValidPassword(newpassword)) {
      errors.newPassword =
        'New password must be at least 6 characters long, contain one uppercase letter, one lowercase letter, one number, one special character, and no spaces.';
      isValid = false;
    } else {
      errors.newPassword = '';
    }
 
    if (!confirmedPassword.trim()) {
      errors.confirmedPassword = 'Confirm password is required.';
      isValid = false;
    } else if (newpassword !== confirmedPassword) {
      errors.confirmedPassword = 'Passwords do not match.';
      isValid = false;
    } else {
      errors.confirmedPassword = '';
    }
 
    setFormErrors(errors);
    return isValid;
  };
 
  const handleTogglePassword = (type) => {
    switch (type) {
      case 'old':
        setShowOldPassword(!showOldPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirmed':
        setShowConfirmedPassword(!showConfirmedPassword);
        break;
      default:
        break;
    }
  };
 
  const handleChangePassword = async (e) => {
    e.preventDefault();
 
    if (!validateForm()) {
      return;
    }
 
    const formData = {
      oldpassword,
      newpassword,
      confirmedPassword,
    };
 
    try {
      const response = await axios.post(`${apiUrl}/recuriters/authenticateRecruiter/${user.id}`, formData);
      if (response.data === 'Password updated and stored') {
        window.alert('Password Changed Successfully');
      } else if(response.data==='your new password should not be same as old password'){
        window.alert('New password should not be same as old password.');
      }
      else {
        window.alert('Password change failed. Old password is wrong.');
      }
    } catch (error) {
      console.error('Password change failed. Old password is wrong.:', error);
      window.alert('Password change failed. Old password is wrong.');
    }
  };
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };
  return (
    <div>
      <>
        <div class="dashboard__content">
        <section className="page-title-dashboard">
      <div className="themes-container">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <div className="title-dashboard">
            <BackButton />
              <div className="title-dash flex2">Change Password</div>
            </div>
          </div>
        </div>
      </div>
    </section>
          <section className="flat-dashboard-password">
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12 ">
                  <div className="change-password bg-white">
                    <form action="#">
                      <div className="form-password">
                        <div className="inner info-wd">
                          <label className="title-url fs-16">
                            Old Password<span className="color-red">*</span>
                          </label>
                          <div className="inputs-group auth-pass-inputgroup relative flex2">
                            <input
                              type={showOldPassword ? 'text' : 'password'}
                              className="input-form password-input"
                              value={oldpassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              onBlur={() => validateForm()}
                              required=""
                            />
                            
                            <div className="password-toggle-icon" onClick={() => handleTogglePassword('old')} id="password-addon">
          {showOldPassword ? <FaEye /> : <FaEyeSlash />}
        </div>
                          </div>
                          {formErrors.oldPassword && (
                            <div className="error-message">{formErrors.oldPassword}</div>
                          )}
                        </div>
                        <div className="inner info-wd">
                          <label className="title-url fs-16">
                            New Password <span className="color-red">*</span>
                          </label>
                          <div className="inputs-group auth-pass-inputgroup relative flex2">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              className="input-form"
                              value={newpassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              onBlur={() => validateForm()}
                              required=""
                            />
                           
                            <div className="password-toggle-icon" onClick={() => handleTogglePassword('new')} id="password-addon">
          {showNewPassword ? <FaEye /> : <FaEyeSlash />}
        </div>
                          </div>
                          {formErrors.newPassword && (
                            <div className="error-message">{formErrors.newPassword}</div>
                          )}
                        </div>
                        <div className="inner info-wd">
                          <label className="title-url fs-16">
                            Confirm Password<span className="color-red">*</span>
                          </label>
                          <div className="inputs-group auth-pass-inputgroup relative flex2">
                            <input
                              type={showConfirmedPassword ? 'text' : 'password'}
                              className="input-form password-input"
                              value={confirmedPassword}
                              onChange={(e) => setConfirmedPassword(e.target.value)}
                              onBlur={() => validateForm()}
                              required=""
                            />
                            
                            <div className="password-toggle-icon" onClick={() => handleTogglePassword('confirmed')} id="password-addon">
          {showConfirmedPassword ? <FaEye /> : <FaEyeSlash />}
        </div>
                          </div>
                          {formErrors.confirmedPassword && (
                            <div className="error-message">{formErrors.confirmedPassword}</div>
                          )}
                        </div>
                        <div>
                          <button type="button" class="button-status" onClick={handleChangePassword}>
                            Change Password
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section><br />
        </div>
      </>
    </div>
  );
} 
export default RecruiterChangePassword;
