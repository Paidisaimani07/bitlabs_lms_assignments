import React, { useState } from 'react';
import ApplicantAPIService,{ apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';
import { useNavigate,useLocation } from 'react-router-dom';
import { useUserContext } from '../common/UserProvider';
import OTPVerification1 from '../recruitercomponents/OTPVerification1';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
 
 function RegisterBody({handleLogin}) {
  const [activeTab, setActiveTab] = useState('Candidate');
  const navigate = useNavigate();
   const [candidateName, setCandidateName] = useState('');
   const [candidateEmail, setCandidateEmail] = useState('');
   const [candidateMobileNumber, setCandidateMobileNumber] = useState('');
   const [candidatePassword, setCandidatePassword] = useState('');
   const [companyName, setCompanyName] = useState('');
   const [employerEmail, setEmployerEmail] = useState('');
   const [employerMobileNumber, setEmployerMobileNumber] = useState('');
   const [employerPassword, setEmployerPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [allErrors, setAllErrors] = useState(false);
const [candidateNameError, setCandidateNameError] = useState('');
const [candidateEmailError, setCandidateEmailError] = useState('');
const [candidateMobileNumberError, setCandidateMobileNumberError] = useState('');
const [candidatePasswordError, setCandidatePasswordError] = useState('');
const [employerNameError, setEmployerNameError] = useState('');
const [employerEmailError, setEmployerEmailError] = useState('');
const [employerMobileNumberError, setEmployerMobileNumberError] = useState('');
const [employerPasswordError, setEmployerPasswordError] = useState('');
  const [recruiterOTPSent, setRecruiterOTPSent] = useState(false);
  const [recruiterOTPVerified, setRecruiterOTPVerified] = useState(false);
  const [recruiterOTPVerifyingInProgress, setRecruiterOTPVerifyingInProgress] = useState(false);
  const [recruiterRegistrationSuccess, setRecruiterRegistrationSuccess] = useState(false);
  const [recruiterRegistrationInProgress, setRecruiterRegistrationInProgress] = useState(false);
  const [recruiterOTPSendingInProgress, setRecruiterOTPSendingInProgress] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [candidateOTPSent, setCandidateOTPSent] = useState(false);
  const [candidateOTPVerified, setCandidateOTPVerified] = useState(false);
  const [candidateOTPVerifyingInProgress, setCandidateOTPVerifyingInProgress] = useState(false);
  const [candidateOTPSendingInProgress, setCandidateOTPSendingInProgress] = useState(false);
  const [candidateRegistrationSuccess, setCandidateRegistrationSuccess] = useState(false);
  const [candidateRegistrationInProgress, setCandidateRegistrationInProgress] = useState(false);
  const [allFieldsDisabled, setAllFieldsDisabled] = useState(false);
  const [resendOtpMessage, setResendOtpMessage] = useState('');
 
  const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState('');
  // recruiter login
  // const [candidateEmail, setCandidateEmail] = useState('');
  // const [candidatePassword, setCandidatePassword] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [recruiterPassword, setRecruiterPassword] = useState('');
  // const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();
  const registrationSuccess = location.state?.registrationSuccess;
  // const navigate = useNavigate();
  const { setUser, setUserType } = useUserContext();
  // const [showPassword, setShowPassword] = useState(false);
  // const [activeTab, setActiveTab] = useState('Candidate');
  // const [candidateEmailError, setCandidateEmailError] = useState('');
  // const [candidatePasswordError, setCandidatePasswordError] = useState('');
  const [recruiterEmailError, setRecruiterEmailError] = useState('');
  const [recruiterPasswordError, setRecruiterPasswordError] = useState('');
 const [candidateLoginInProgress, setCandidateLoginInProgress] = useState(false);
 
 
 
 
 
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  const handleSendOTP = async () => {
    if (!isFormValid()) {
      setAllErrors(true);
      return;
    }
    try {
      setCandidateOTPSendingInProgress(true);
      console.log("email is:", candidateEmail);
      const response=await axios.post(`${apiUrl}/applicant/applicantsendotp`, { email: candidateEmail , mobilenumber: candidateMobileNumber});
      console.log("email is:", candidateEmail);
      setCandidateOTPSent(true);
      setCandidateOTPSendingInProgress(false);
      if (response.data === "Email already registered recruiter"){
        setCandidateOTPSent(false);
     
        window.alert('Email already registered as recruiter, please try to login');
       }
       if(response.data === ('Email already registered as applicant')){
        setCandidateOTPSent(false);
     
        window.alert('Email already registered as candidate, please try to login');
       }
       if(response.data === "Mobile number already existed in recruiter"){
        setCandidateOTPSent(false);
     
        window.alert('Mobile number already existed as recruiter');
       }
       if(response.data === 'Mobile number already existed in applicant'){
        setCandidateOTPSent(false);
     
        window.alert('Mobile number already existed as candidate');
       }
    } catch (error) {
      console.error('Error sending OTP:', error);
      if (error.response && error.response.status === 400) {
        window.alert('Email is already registered.');
      } else {
        window.alert('An error occurred while sending OTP.');
      }
      setCandidateOTPSendingInProgress(false);
    }
  };
  const handleSendOTP1 = async () => {
  if (!isFormValid1()) {
    setAllErrors(true);
    return;
  }
 
  try {
    setRecruiterOTPSendingInProgress(true);
 
    const response = await axios.post(`${apiUrl}/recuriters/registration-send-otp`, {
      email: employerEmail,
      mobilenumber: employerMobileNumber,
    });
 
    setRecruiterOTPSent(true);
    setRecruiterOTPSendingInProgress(false);
 
    if (response.data === "Email already registered recruiter") {
      setRecruiterOTPSent(false);
      window.alert('Email already registered as recruiter, please try to login');
    } else if (response.data === 'Email already registered as applicant') {
      setRecruiterOTPSent(false);
      window.alert('Email already registered as candidate, please try to login');
    } else if (response.data === "Mobile number already existed in recruiter") {
      setRecruiterOTPSent(false);
      window.alert('Mobile number already existed as recruiter');
    } else if (response.data === 'Mobile number already existed in applicant') {
      setRecruiterOTPSent(false);
      window.alert('Mobile number already existed as candidate');
    } else {
      // Proceed with registration since there's no separate OTP verification logic
      //handleSubmit1();
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    if (error.response && error.response.status === 400) {
      window.alert('Email is already registered.');
    } else {
      window.alert('An error occurred while sending OTP.');
    }
    setRecruiterOTPSendingInProgress(false);
  }
};
  const handleRecruiterSubmit = async (e) => {
    e.preventDefault();
    if (!isRecruiterFormValid()) {
      return;
    }
    try {
      let loginEndpoint = `${apiUrl}/recuriters/recruiterLogin`;
      const response = await axios.post(loginEndpoint, {
        email: recruiterEmail,
        password: recruiterPassword,
      });
 
      console.log('Response:', response);
 
      if (response && response.status === 200) {
        const userData = response.data;
 
        if (userData && userData.data && userData.data.jwt) {
          // Successful login
          setErrorMessage('');
          localStorage.setItem('jwtToken', userData.data.jwt);
 
          let userType1 = '';
          if (userData.message.includes('ROLE_JOBAPPLICANT')) {
            userType1 = 'jobseeker';
          } else if (userData.message.includes('ROLE_JOBRECRUITER')) {
            userType1 = 'employer';
          } else {
            userType1 = 'unknown';
          }
 
          localStorage.setItem('userType', userType1);
          setErrorMessage('');
          handleLogin();
          setUser(userData);
          setUserType(userType1);
          console.log('Recruiter Login successful', userData);
          navigate('/recruiterhome');
        } else {
          // Handle the case where the token is not present in the response
          console.error('Login failed. Token not found in response:', response);
          setErrorMessage('Login failed. Please check your user name and password.');
        }
      } else {
        // Handle other cases where the status code is not 200
        console.error('Login failed. Invalid response:', response);
        setErrorMessage('Login failed. Please check your user name and password.');
      }
    } catch (error) {
      console.error('Login failed', error);
      // Handle other error cases
      if(error.response.data==="No account found with this email address")
          setErrorMessage('No account found with this email address');
      if(error.response.data==="Incorrect password")
          setErrorMessage('Incorrect password');

      // setErrorMessage('Login failed. Please try again later.');
    }
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      return;
    }
    try {
      setCandidateRegistrationInProgress(true);
      const response = await axios.post(`${apiUrl}/applicant/saveApplicant`, {
        name: candidateName,
        email: candidateEmail,
        mobilenumber: candidateMobileNumber,
        password: candidatePassword,
      });
     if (response.data === 'Email is already registered.') {
        window.alert('Email is already registered.');
      }
      setErrorMessage('');
      setCandidateRegistrationSuccess(true);
      console.log('Registration successful', response.data);
      setCandidateName('');
      setCandidateEmail('');
      setCandidateMobileNumber('');
      setCandidatePassword('');
      setCandidateRegistrationInProgress(false);
      if (candidateOTPSent && candidateOTPVerified) {
        navigate('/recruiter', { state: { registrationSuccess: true } });
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
  const isCompanyNameValid = (companyName) => {
    if (!companyName.trim()) {
      return 'Company name is required.';
    }
    if (!/^[a-zA-Z\s]+$/.test(companyName)) {
      return 'Please enter a valid company name and should not have any numbers and special char.';
    }
    if (companyName.trim().length < 3) {
      return 'Company name should be at least three characters long.';
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
    const nameError = isCompanyNameValid(companyName);
    const emailError = isEmailValid1(employerEmail);
    const mobileNumberError = isMobileNumberValid(employerMobileNumber);
    const passwordError = isPasswordValid(employerPassword);
    setEmployerNameError(nameError);
    setEmployerEmailError(emailError);
    setEmployerMobileNumberError(mobileNumberError);
    setEmployerPasswordError(passwordError);
    return !(nameError || emailError || mobileNumberError || passwordError);
  };
  const handleCompanyNameChange = (e) => {
    setCompanyName(e.target.value);
    setEmployerNameError('');
  };
  const handleEmployerEmailChange = (e) => {
    setEmployerEmail(e.target.value);
    setEmployerEmailError('');
  };
  const handleEmployerMobileNumberChange = (e) => {
    setEmployerMobileNumber(e.target.value);
    setEmployerMobileNumberError('');
  };
  const handleEmployerPasswordChange = (e) => {
    setEmployerPassword(e.target.value);
    setEmployerPasswordError('');
  };
  const handleSubmit1 = async (e) => {
    //e.preventDefault();
    if (!isFormValid1()) {
      return;
    }
 
    try {
      setRecruiterRegistrationInProgress(true);
 
      //setRecruiterOTPVerified(true);
      // Check if OTP is verified before proceeding with registration
      // if (!recruiterOTPVerified) {
      //   window.alert('Please verify your email by entering the OTP.');
      //   return;
      // }
 
      // Proceed with registration
      const response = await axios.post(`${apiUrl}/recuriters/saverecruiters`, {
        companyname: companyName,
        mobilenumber: employerMobileNumber,
        email: employerEmail,
        password: employerPassword,
      });
 
      setErrorMessage('');
      setRecruiterRegistrationSuccess(true);
      setRegistrationSuccessMessage('Registration successful!');
      setActiveTab('Candidate');
      console.log('Registration successful', response.data);
 
      // Reset fields and states
      setCompanyName('');
      setEmployerEmail('');
      setEmployerMobileNumber('');
      setEmployerPassword('');
      setRecruiterRegistrationInProgress(false);
     
       // Set success message
      //setRecruiterOTPVerified(false); // Reset OTP verification status
 
      // Redirect to login page
 
      navigate('/recruiter', { state: { registrationSuccess: true } });
     // window.location.reload();
   
    } catch (error) {
      setErrorMessage('Registration failed. Please try again later.');
      window.alert('Registration failed! or User with this email already exists.');
      console.error('Registration failed', error);
 
      if (error.response && error.response.status === 400) {
        if (error.response.data === 'Email already registered') {
          window.alert('Registration failed! User with this email already exists');
        } else if (error.response.data === 'Mobile number already existed') {
          window.alert('Registration failed! Mobile number already exists');
        }
      }
      setRecruiterRegistrationInProgress(false);
    }
  };
  const handleOTPSendSuccess = () => {
   window.alert('OTP Resend successfully');
   setResendOtpMessage('OTP Resent successfully. Check your email.');
  };
  const handleOTPSendFail = () => {
   window.alert('Failed to Resend OTP. Please try again.');
   setResendOtpMessage('Failed to Resent OTP. Please try again.');
  };
  const isRecruiterFormValid = () => {
    const emailError = validateEmail(recruiterEmail);
    setRecruiterEmailError(emailError);
    const passwordError = validatePassword(recruiterPassword);
    setRecruiterPasswordError(passwordError);
    if (!recruiterEmail.trim()) {
      setRecruiterEmailError('Email is required.');
    }
    if (!recruiterPassword.trim()) {
      setRecruiterPasswordError('Password is required.');
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
  return (
    <div>
      <a id="scroll-top" />
    <section className="account-section">
      <div className="tf-container">
        <div className="row">
          <div className="wd-form-login tf-tab">
            <h4>Recruiter</h4>
           
            <ul className="menu-tab">
              <li className={`ct-tab ${activeTab === 'Candidate' ? 'active' : ''}`} onClick={() => handleTabClick('Candidate')}>
                Login
              </li>
              <li className={`ct-tab ${activeTab === 'Employer' ? 'active' : ''}`} onClick={() => handleTabClick('Employer')}>
               Sign Up
              </li>
            </ul>
            {/* <a href="#" class="btn-social" onClick={() => login()}> <img src="images/review/google.png" alt="images" /> Continue with Google</a>
                    <br /> */}
            <div className="content-tab">
              <div className="inner" style={{ display: activeTab === 'Candidate' ? 'block' : 'none' }}>
              <p><span>  {registrationSuccessMessage && (
              <div style={{ color: 'green', marginBottom: '10px' }}>{registrationSuccessMessage}</div>
            )}</span></p>
              <form onSubmit={handleRecruiterSubmit}>
                      <div className="ip">
                        <label>Email Address<span>*</span></label>
                        <input
                          type="text"
                          placeholder="Enter your Email"
                          value={recruiterEmail}
                          onChange={(e) => {
                            setRecruiterEmail(e.target.value);
                            setRecruiterEmailError('');
                          }}
                        />
                        {recruiterEmailError && <div className="error-message">{recruiterEmailError}</div>}
                      </div>
                      <div className="ip">
                        <label>Password<span>*</span></label>
                        <div className="inputs-group auth-pass-inputgroup">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={recruiterPassword}
                            onChange={(e) => {
                              setRecruiterPassword(e.target.value);
                               setRecruiterPasswordError('');
                                }}
                           
                       />
                          <div className="password-toggle-icon" onClick={handleTogglePassword} id="password-addon">
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                          </div>
                        </div>
                        {recruiterPasswordError && <div className="error-message">{recruiterPasswordError}</div>}
                      </div>
                      <div className="group-ant-choice">
                        <div className="sub-ip"></div>
                        <a href="/recruiter-forgot-password" className="forgot">
                          Forgot password?
                        </a>
                      </div>
                      <button type="submit">Login</button>
                      {errorMessage && <div className="error-message">{errorMessage}</div>}
                      {/* <div className="sign-up">
                        Not registered yet? <a href="/register">Sign Up</a>
                      </div> */}
                     
       
                    </form>
              </div>
            </div>
            <div className="content-tab">
              <div className="inner" style={{ display: activeTab === 'Employer' ? 'block' : 'none' }}>
              {/* <p class="line-ip"><span>or signup with</span></p> */}
                <form onSubmit={handleSubmit1}>
                <div className="ip">
                    <label>Company Name<span>*</span></label>
                    <input
                      type="text"
                      placeholder="Enter your company name"
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        setEmployerNameError('');
                      }}
                      disabled={allFieldsDisabled}
                    />
                     {employerNameError && <div className="error-message">{employerNameError}</div>}
                  </div>
                  <div className="ip">
                    <label>Email Address<span>*</span></label>
                    <input
                      type="email"
                      placeholder="Email"
                      value={employerEmail}
                     
                      onChange={(e) => {
                        setEmployerEmail(e.target.value);
                        setEmployerEmailError('');
                      }}
                      disabled={allFieldsDisabled}
                    />
                     {employerEmailError && <div className="error-message">{employerEmailError}</div>}
                  </div>
                  <div className="ip">
                    <label>Mobile Number<span>*</span></label>
                    <input
                      type="text"
                      placeholder="Mobile Number"
                      value={employerMobileNumber}
                     
                      onChange={(e) => {
                        setEmployerMobileNumber(e.target.value);
                        setEmployerMobileNumberError('');
                      }}
                      disabled={allFieldsDisabled}
                    />
                    {employerMobileNumberError && <div className="error-message">{employerMobileNumberError}</div>}
                  </div>
                  <div className="ip">
                    <label>Password<span>*</span></label>
                    <div className="inputs-group auth-pass-inputgroup">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={employerPassword}
                       
                        onChange={(e) => {
                          setEmployerPassword(e.target.value);
                          setEmployerPasswordError('');
                        }}
                        disabled={allFieldsDisabled}
                      />
                        <div className="password-toggle-icon" onClick={handleTogglePassword} id="password-addon">
        {showPassword ? <FaEye /> : <FaEyeSlash />}
      </div>
                    </div>
                    {employerPasswordError && <div className="error-message">{employerPasswordError}</div>}
                  </div>
                  {recruiterOTPSent && !recruiterOTPVerified ? (
  <div>
    <p style={{ color: 'green' }}>OTP sent to your email. Please check and enter below:</p>
    <OTPVerification1
            email={employerEmail}
            onOTPVerified={() => {
              setTimeout(() => {
                setRecruiterOTPVerified(true);
                setAllFieldsDisabled(true);
              }, 0);
              setTimeout(() => {console.log(recruiterOTPVerified);
               
                handleSubmit1();
              }, 10);
             
            }}
            onOTPSendSuccess={handleOTPSendSuccess}
            onOTPSendFail={handleOTPSendFail}
            recruiterOTPVerifyingInProgress={recruiterOTPVerifyingInProgress}
            setRecruiterOTPVerifyingInProgress={setRecruiterOTPVerifyingInProgress}
          />
  </div>
) : (
  <div>
    {recruiterOTPVerified ? (
      <div style={{ color: 'green'  }}>
       
        {/* <p>Registered successfully! </p> */}
      </div>
    ) : (
      <div>
         <div className="helpful-line">Click on send OTP to verify your email</div>
        <button
          type="button"
          onClick={handleSendOTP1}
          disabled={recruiterOTPSent || recruiterRegistrationInProgress || recruiterOTPSendingInProgress}
        >
          {recruiterOTPSendingInProgress ? (
             <div className="status-container">
             <div className="spinner"></div>
             <div className="status-text">Sending OTP</div>
           </div>
          ) : (
            'Send OTP'
          )}
        </button>
      </div>
    )}
  </div>
)}
{/* {recruiterOTPVerified && (
  <button type="submit">
    {recruiterRegistrationInProgress ? (
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
          </div>
        </div>
      </div>
    </section>
  </div>
   
  );
}
export default RegisterBody;