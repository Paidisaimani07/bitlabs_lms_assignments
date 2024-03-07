import React, { useState,useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useUserContext } from '../common/UserProvider';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useGoogleLogin } from '@react-oauth/google'; // Import GoogleLoginButton
import jwt_decode from "jwt-decode";
import OTPVerification from '../applicantcomponents/OTPVerification';
 
function LoginBody({ handleLogin }) {
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePassword, setCandidatePassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();
  const registrationSuccess = location.state?.registrationSuccess;
  const navigate = useNavigate();
  const { setUser, setUserType } = useUserContext();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('Candidate');
  const [candidateEmailError, setCandidateEmailError] = useState('');
  const [candidatePasswordError, setCandidatePasswordError] = useState('');
  const [recruiterEmailError, setRecruiterEmailError] = useState('');
  const [recruiterPasswordError, setRecruiterPasswordError] = useState('');
 const [candidateLoginInProgress, setCandidateLoginInProgress] = useState(false);
 const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState('');
 
 
const login = useGoogleLogin({
  // clientId: "435586738795-9tuq57be4e92djg8d8ol1sn1h6a9mm6c.apps.googleusercontent.com", // Pass the clientId here
  onSuccess: async (response) => {
    try {
      console.log('First API');
      const res = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        }
      );
      console.log(res);
      const email1 = res.data.email;
      console.log('Second API');
      let loginEndpoint = `${apiUrl}/applicant/applicantLogin`;
      const response1 = await axios.post(loginEndpoint, {
        email: email1,
      });
     
      console.log(response1);
      if (response1.status === 200) {
        setErrorMessage('');
        const userData = response1.data; // Change `response` to `response1`
        console.log('This is response: ', userData);
        console.log('This is token: ', userData.data.jwt);
        localStorage.setItem('jwtToken', userData.data.jwt);
 
        let userType1;
        if (userData.message.includes('ROLE_JOBAPPLICANT')) {
          userType1 = 'jobseeker';
        } else if (userData.message.includes('ROLE_JOBRECRUITER')) {
          userType1 = 'employer';
        } else {
          userType1 = 'unknown';
        }
        console.log('This userType: ', userType1);
        localStorage.setItem('userType', userType1);
 
        setErrorMessage('');
        handleLogin();
 
        setUser(userData);
        setUserType(userType1); // Change `userData.userType` to `userType1`
        console.log('Login successful', userData);
 
        navigate('/applicant-find-jobs');
      }
    } catch (err) {
      console.log(err);
    }
  },
});
 
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
 
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
  };
  let userType1;
  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    if (!isCandidateFormValid()) {
      return;
    }
 
    try {
      let loginEndpoint = `${apiUrl}/applicant/applicantLogin`;
      const response = await axios.post(loginEndpoint, {
        email: candidateEmail,
        password: candidatePassword,
      });
 
            if (response.status === 200) {
        setErrorMessage('');
        const userData = response.data;
        console.log('this is response ', userData);
        console.log('this is token ', userData.data.jwt);
        localStorage.setItem('jwtToken', userData.data.jwt);
 
       
 
        if (userData.message.includes('ROLE_JOBAPPLICANT')) {
          userType1 = 'jobseeker';
        } else if (userData.message.includes('ROLE_JOBRECRUITER')) {
          userType1 = 'employer';
        } else {
          userType1 = 'unknown';
        }
        console.log('this userType ', userType1);
        localStorage.setItem('userType', userType1);
 
        setErrorMessage('');
        handleLogin();
 
        setUser(userData);
        setUserType(userData.userType);
        console.log('Login successful', userData);
       
        // console.log("candidateOTPSent:", candidateOTPSent); // Add this line
        // console.log("candidateOTPVerified:", candidateOTPVerified); // Add this line
 
        // if (candidateOTPSent && candidateOTPVerified) {
        //   await handleSubmit(); // Trigger registration after OTP verification
        //   return; // Exit the function to prevent further execution
        // }
 
        // Navigate to the applicant home page
        
        navigate('/applicant-find-jobs');
            }
 
    } catch (error) {
      console.log(error.response.data);
      if(error.response.data==="Incorrect password") {
        setErrorMessage('Incorrect password.');
        console.error('login failed');
      }
      else if(error.response.data==="No account found with this email address") {
        setErrorMessage('No account found with this email address.');
        console.error('login failed');
      }
      else{
        setErrorMessage('login failed. Please check your user name and password.');
      }
      console.error('Login failed', error);
    }
  };

  const isCandidateFormValid = () => {
    const emailError = validateEmail(candidateEmail);
    setCandidateEmailError(emailError);
    const passwordError = validatePassword(candidatePassword);
    setCandidatePasswordError(passwordError);
    if (!candidateEmail.trim()) {
      setCandidateEmailError('Email is required.');
    }
    if (!candidatePassword.trim()) {
      setCandidatePasswordError('Password is required.');
    }
    if (emailError || passwordError) {
      return false;
    }
    return true;
  };
 
  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address.';
  };
  const validatePassword = (password) => {
    if (!password.trim()) {
      return 'Password is required.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return 'Password must contain at least one special character (non-alphanumeric).';
    }
    if (/\s/.test(password)) {
      return 'Password cannot contain spaces.';
    }
    return '';
  };
 
 
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail1, setCandidateEmail1] = useState('');
  const [candidateMobileNumber, setCandidateMobileNumber] = useState('');
  const [candidatePassword1, setCandidatePassword1] = useState('');
 
//  const [errorMessage, setErrorMessage] = useState('');
 const [allErrors, setAllErrors] = useState(false);
const [candidateNameError, setCandidateNameError] = useState('');
const [candidateEmailError1, setCandidateEmailError1] = useState('');
const [candidateMobileNumberError, setCandidateMobileNumberError] = useState('');
const [candidatePasswordError1, setCandidatePasswordError1] = useState('');
 
//  const [showPassword, setShowPassword] = useState(false);
 const [candidateOTPSent, setCandidateOTPSent] = useState(false);
 const [candidateOTPVerified, setCandidateOTPVerified] = useState(false);
 const [candidateOTPVerifyingInProgress, setCandidateOTPVerifyingInProgress] = useState(false);
 const [candidateOTPSendingInProgress, setCandidateOTPSendingInProgress] = useState(false);
 const [candidateRegistrationSuccess, setCandidateRegistrationSuccess] = useState(false);
 const [candidateRegistrationInProgress, setCandidateRegistrationInProgress] = useState(false);
 const [allFieldsDisabled, setAllFieldsDisabled] = useState(false);
 const [resendOtpMessage, setResendOtpMessage] = useState('');
//  const handleTogglePassword = () => {
//    setShowPassword(!showPassword);
//  };
//  const handleTabClick = (tab) => {
//    setActiveTab(tab);
//  };
 const handleSendOTP = async () => {
   if (!isFormValid1()) {
     setAllErrors(true);
     return;
   }
   try {
     setCandidateOTPSendingInProgress(true);
     console.log("email is:", candidateEmail1);
     const response=await axios.post(`${apiUrl}/applicant/applicantsendotp`, { email: candidateEmail1 , mobilenumber: candidateMobileNumber});
     console.log("email is:", candidateEmail1);
     setCandidateOTPSent(true);
     setCandidateOTPSendingInProgress(false);
    //  if (response.data === "Email already registered recruiter"){
      if (response.data === "Email is already registered as a Recruiter."){
       setCandidateOTPSent(false);
   
       window.alert('Email already registered as recruiter, please try to login');
      }
      // if(response.data === ('Email already registered as applicant')){
        if(response.data === ('Email is already registered as an Applicant.')){
       setCandidateOTPSent(false);
   
       window.alert('Email already registered as candidate, please try to login');
      }
      // if(response.data === "Mobile number already existed in recruiter"){
        if(response.data === "Mobile number is already registered as a Recruiter."){
       setCandidateOTPSent(false);
   
       window.alert('Mobile number already existed as recruiter');
      }
      // if(response.data === 'Mobile number already existed in applicant'){
        if(response.data === 'Mobile number is already registered as an Applicant.'){
       setCandidateOTPSent(false);
   
       window.alert('Mobile number already existed as candidate');
      }
   } catch (error) {
     console.error('Error sending OTP:', error);
     if (error.response && error.response.status === 400) {
      //  window.alert('Email is already registered.');
      // Server responded with a 400 status code
    if (error.response.data === 'Email is already registered as a Recruiter.') {
      window.alert('Email already registered as recruiter, please try to login');
    } else if (error.response.data === 'Email is already registered as an Applicant.') {
      window.alert('Email already registered as candidate, please try to login');
    } else if (error.response.data === 'Mobile number is already registered as a Recruiter.') {
      window.alert('Mobile number already existed as recruiter');
    } else if (error.response.data === 'Mobile number is already registered as an Applicant.') {
      window.alert('Mobile number already existed as candidate');
    } else {
      window.alert('Email is already registered.'); // Default message for other 400 errors
    }
     } else {
       window.alert('An error occurred while sending OTP.');
     }
     setCandidateOTPSendingInProgress(false);
   }
 };
 
 // Define a function to check if all form fields are valid
//  const isFormValidForOTP = () => {
//   return candidateName.trim() !== '' && candidateEmail1.trim() !== '' && candidateMobileNumber.trim() !== '' && candidatePassword1.trim() !== '';
// };
 
// const isFormValidForOTP = () => {
//   return (
//     !candidateNameError &&
//     !candidateEmailError1 &&
//     !candidateMobileNumberError &&
//     !candidatePasswordError1
//   );
// };
 
 const handleSubmit = async (e) => {
   //e.preventDefault();
   if (!isFormValid1()) {
     return;
   }
   try {
     setCandidateRegistrationInProgress(true);
     const response = await axios.post(`${apiUrl}/applicant/saveApplicant`, {
       name: candidateName,
       email: candidateEmail1,
       mobilenumber: candidateMobileNumber,
       password: candidatePassword1,
     });
    if (response.data === 'Email is already registered.') {
       window.alert('Email is already registered.');
     }
     setErrorMessage('');
     setCandidateRegistrationSuccess(true);
     setRegistrationSuccessMessage('Registration successful!');
     setActiveTab('Candidate');
     console.log('Registration successful', response.data);
     setCandidateName('');
     setCandidateEmail1('');
     setCandidateMobileNumber('');
     setCandidatePassword1('');
     setCandidateRegistrationInProgress(false);
     if (candidateOTPSent && candidateOTPVerified) {
       navigate('/candidate', { state: { registrationSuccess: true } });
     }
   } catch (error) {
     setErrorMessage('Registration failed. Please try again later.');
     setCandidateRegistrationInProgress(false);
       console.error('Registration failed', error);
       if (error.response && error.response.status === 400) {
         if (error.response.data === 'Email already registered') {
           window.alert('Registration failed! User with this email already exists');
         } else if (error.response.data === 'Mobile number already existed') {
           window.alert('Registration failed! Mobile number already exists');
         }
       }
   }
 };
 const isFullNameValid = (fullName) => {
   if (!fullName.trim()) {
     return 'Full name is required.';
   }
   if (!/^[a-zA-Z\s]+$/.test(fullName)) {
     return 'Please enter a valid full name and should not have any numbers and special char.';
   }
   if (fullName.trim().length < 3) {
     return 'Full name should be at least three characters long.';
   }
   return '';
 };
 
 const isEmailValid = (email) => {
   if (!email.trim()) {
     return 'Email is required.';
   }
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return emailRegex.test(email) ? '' : 'Please enter a valid email address.';
 };  
 const isEmailValid1 = (email) => {
   if (!email.trim()) {
     return 'Email is required.';
   }
   const excludedDomains = [
     'gmail.com',
     'yahoo.com',
     'outlook.com',
     'aol.com',
     'mail.com',
     'icloud.com',
     'zoho.com',
     'yandex.com',
     'protonmail.com',
     'tutanota.com',
   ];
   const domain = email.split('@')[1];
   if (excludedDomains.includes(domain)) {
     return 'Please enter your official email ID.';
   }
   return '';
 };
 const isPasswordValid = (password) => {
   if (!password.trim()) {
     return 'Password is required.';
   }
   if (password.length < 6) {
     return 'Password must be at least 6 characters long.';
   }
   if (!/[A-Z]/.test(password)) {
     return 'Password must contain at least one uppercase letter.';
   }
   if (!/[^A-Za-z0-9]/.test(password)) {
     return 'Password must contain at least one special character (non-alphanumeric).';
   }
   if (/\s/.test(password)) {
     return 'Password cannot contain spaces.';
   }
   return '';
 };
 const isMobileNumberValid = (mobilenumber) => {
   if (!mobilenumber.trim()) {
     return 'Mobile number is required.';
   }
   if (!/^\d+$/.test(mobilenumber)) {
     return 'Mobile number must contain only numeric digits.';
   }
   if (mobilenumber.length !== 10) {
     return 'Mobile number must have a specific length (e.g., 10 digits).';
   }
   if (/\s/.test(mobilenumber)) {
     return 'Mobile number cannot contain spaces.';
   }
   const firstDigit = mobilenumber.charAt(0);
   if (!['6', '7', '8', '9'].includes(firstDigit)) {
     return 'Mobile number should begin with 6, 7, 8, or 9.';
   }
   return '';
 };
 const isFormValid = () => {
   setAllErrors(false);
   const nameError = isFullNameValid(candidateName);
   const emailError = isEmailValid(candidateEmail);
   const mobileNumberError = isMobileNumberValid(candidateMobileNumber);
   const passwordError = isPasswordValid(candidatePassword);
   setCandidateNameError(nameError);
   setCandidateEmailError(emailError);
   setCandidateMobileNumberError(mobileNumberError);
   setCandidatePasswordError(passwordError);
   return !(nameError || emailError || mobileNumberError || passwordError);
 };
 
 const isFormValid1 = () => {
  setAllErrors(false);
  const nameError = isFullNameValid(candidateName);
  const emailError = isEmailValid(candidateEmail1);
  const mobileNumberError = isMobileNumberValid(candidateMobileNumber);
  const passwordError = isPasswordValid(candidatePassword1);
  setCandidateNameError(nameError);
  setCandidateEmailError1(emailError);
  setCandidateMobileNumberError(mobileNumberError);
  setCandidatePasswordError1(passwordError);
  return !(nameError || emailError || mobileNumberError || passwordError);
};
 
 const handleOTPSendSuccess = () => {
  window.alert('OTP Resend successfully');
  setResendOtpMessage('OTP Resent successfully. Check your email.');
 };
 const handleOTPSendFail = () => {
  window.alert('Failed to Resend OTP. Please try again.');
  setResendOtpMessage('Failed to Resent OTP. Please try again.');
 };
 
  return (
    <div>
      <section className="account-section">
        <div className="tf-container">
          <div className="row">
            <div className="wd-form-login tf-tab">
              <section className="account-section">
                {registrationSuccess && (
                  <div className="success-message">
                    Registration successful! Please log in to continue.
                  </div>
                )}
                {/* <h4>Candidate </h4> */}
 
                <ul className="menu-tab">
                  <li className={`ct-tab ${activeTab === 'Candidate' ? 'active' : ''}`} onClick={() => handleTabClick('Candidate')}>
                    Login
                  </li>
                  <li className={`ct-tab ${activeTab === 'Employer' ? 'active' : ''}`} onClick={() => handleTabClick('Employer')}>
                    Sign Up
                  </li>
                </ul>
                <a href="#" class="btn-social" onClick={() => login()}> <img src="images/review/google.png" alt="images" /> Continue with Google</a>
                    <br />
                   
                <div className="content-tab">
               
                  <div className="inner" style={{ display: activeTab === 'Candidate' ? 'block' : 'none' }}>
                  <p class="line-ip"><span>or Log in using </span></p>
                  <p><span>  {registrationSuccessMessage && (
              <div style={{ color: 'green', marginBottom: '10px' }}>{registrationSuccessMessage}</div>
            )}</span></p>
                    <form onSubmit={handleCandidateSubmit}>
                      <div className="ip">
                        <label>Email Address<span>*</span></label>
                        <input
                  type="text"
                  placeholder="Email"
                  value={candidateEmail}
                  onChange={(e) => {
                    setCandidateEmail(e.target.value);
                    setCandidateEmailError('');
                  }}
                 
                />
                        {candidateEmailError && <div className="error-message">{candidateEmailError}</div>}
                      </div>
                      <div className="ip">
                        <label>Password<span>*</span></label>
                        <div className="inputs-group auth-pass-inputgroup">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={candidatePassword}
                            onChange={(e) => {
                              setCandidatePassword(e.target.value);
                               setCandidatePasswordError('');
                                }}
                           
                       />
                          <div className="password-toggle-icon" onClick={handleTogglePassword} id="password-addon">
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                          </div>
                        </div>
                        {candidatePasswordError && <div className="error-message">{candidatePasswordError}</div>}
                      </div>
                      <div className="group-ant-choice">
                        <div className="sub-ip"></div>
                        <a href="/applicant-forgot-password" className="forgot">
                          Forgot password?
                        </a>
                      </div>
                      <button type="submit">Login</button>
                      {errorMessage && <div className="error-message">{errorMessage}</div>}
                      {/* <div className="sign-up">
                        Not registered yet? <a href="/register">Sign Up</a>
                      </div> */}
       
                    </form>
                    <br></br>
                    {/* <button onClick={() => login()}>Sign in with Google 🚀</button> */}
                    {/* <a href="#" class="btn-social" onClick={() => login()}> <img src="images/review/google.png" alt="images" /> Continue with Google</a> */}
                    {/* <button onClick={googleLogin}>Sign in with Google</button> */}
                  </div>
 
                  <div className="inner" style={{ display: activeTab === 'Employer' ? 'block' : 'none' }}>
                  <p class="line-ip"><span>or Log in using</span></p>
                   
                  <form onSubmit={handleSubmit}>
                <div className="ip">
                    <label>Full Name<span>*</span></label>
                    <input
                      type="text"
                      placeholder="Name"
                      onChange={(e) => {
                        setCandidateName(e.target.value);
                        setCandidateNameError('');
                      }}
                      required
                      disabled={allFieldsDisabled}
                    />
                    {candidateNameError && <div className="error-message">{candidateNameError}</div>}
                  </div>
                  <div className="ip">
                    <label>Email Address<span>*</span></label>
                <input
                  type="email"
                  placeholder="Email"
                  value={candidateEmail1}
                  onChange={(e) => {
                    setCandidateEmail1(e.target.value);
                    setCandidateEmailError1('');
                  }}
                  required
                  disabled={allFieldsDisabled}
                />
                    {candidateEmailError1 && <div className="error-message">{candidateEmailError1}</div>}
                  </div>
                  <div className="ip">
                    <label>Mobile Number<span>*</span></label>
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={candidateMobileNumber}
                    onChange={(e) => {
                      setCandidateMobileNumber(e.target.value);
                      setCandidateMobileNumberError('');
                      }}
                      required
                      disabled={allFieldsDisabled}
                    />
                    {candidateMobileNumberError && <div className="error-message">{candidateMobileNumberError}</div>}
                  </div>
                  <div className="ip">
                    <label>Password<span>*</span></label>
                    <div className="inputs-group auth-pass-inputgroup">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={candidatePassword1}
                         onChange={(e) => {
                         setCandidatePassword1(e.target.value);
                          setCandidatePasswordError1('');
                           }}
                        required
                        disabled={allFieldsDisabled}
                  />
                       <div className="password-toggle-icon" onClick={handleTogglePassword} id="password-addon">
        {showPassword ? <FaEye /> : <FaEyeSlash />}
      </div>
                    </div>
                    {candidatePasswordError1 && <div className="error-message">{candidatePasswordError1}</div>}
                  </div>
                  {candidateOTPSent && !candidateOTPVerified ? (
  <div>
    <p style={{ color: 'green' }}>OTP sent to your email. Please check and enter below:</p>
    <OTPVerification
            email={candidateEmail1}
            onOTPVerified={() => {
              setTimeout(() => {
                setCandidateOTPVerified(true);
                setAllFieldsDisabled(true);
              }, 0);
              setTimeout(() => {console.log(candidateOTPVerified);
                handleSubmit();
              }, 10);
            }}
            onOTPSendSuccess={handleOTPSendSuccess}
            onOTPSendFail={handleOTPSendFail}
            candidateOTPVerifyingInProgress={candidateOTPVerifyingInProgress}
            setCandidateOTPVerifyingInProgress={setCandidateOTPVerifyingInProgress}
          />
  </div>
) : (
  <div>
    {candidateOTPVerified ? (
      <div style={{ color: 'green' }}>
        {/* <p >OTP verified successfully! Click on Register to proceed</p> */}
      </div>
    ) : (
      <div>
        <div className="helpful-line">Click on send OTP to verify your email</div>
        {/* {isFormValidForOTP() && ( */}
        <button
          type="button"
          onClick={handleSendOTP}
          disabled={candidateOTPSent || candidateRegistrationSuccess || candidateOTPSendingInProgress}
        >
          {candidateOTPSendingInProgress ? (
             <div className="status-container">
             <div className="spinner"></div>
             <div className="status-text">Sending OTP</div>
           </div>
          ) : (
            'Send OTP'
          )}
         
        </button>
        {/* )} */}
      </div>
    )}
  </div>
)}
 
{/* {candidateOTPVerified && (
  <button type="submit" onClick={handleSubmit}>
    {candidateRegistrationInProgress ? (
       <div className="status-container">
       <div className="spinner"></div>
       <div className="status-text">Registering</div>
     </div>
    ) : (
      'Register'
    )}
  </button>
)} */}
                </form>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
 
export default LoginBody;