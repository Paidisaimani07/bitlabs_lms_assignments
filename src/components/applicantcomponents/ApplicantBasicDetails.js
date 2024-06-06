import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useNavigate } from 'react-router-dom';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { ClipLoader } from 'react-spinners';
import './ApplicantBasicDetails.css';
import BackButton from '../common/BackButton';
import './ApplicantBasicDetails1.css';


const ApplicantBasicDetails = () => {
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(1);

  const [applicant, setApplicant] = useState({
    firstName: '',
    lastName: '',
    email: user.email || "",
    mobilenumber: "",
  });

  const basicDetails = {
    firstName: applicant.firstName,
    lastName: applicant.lastName,
    alternatePhoneNumber: applicant.mobilenumber,
  };
  const applicantProfileDTO = {
    basicDetails: basicDetails,
  };
  const [errors, setErrors] = useState({});

  const validateInput = (name, value) => {
    let error = '';
    if (name === 'firstName' || name === 'lastName') {
      if (!/^[a-zA-Z]+$/.test(value)) {
        error = `${name === 'firstName' ? 'First' : 'Last'} name should contain only letters.`;
      }
    } else if (name === 'mobilenumber') {
      if (!/^[6789]\d{9}$/.test(value)) {
        error = 'Mobile number should be 10 digits long and start with 9, 8, 7, or 6.';
      }
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicant((prevApplicant) => ({
      ...prevApplicant,
      [name]: value,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateInput(name, value);
  };



  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [preferredJobLocations, setPreferredJobLocations] = useState([]);
  const [skillsRequired, setSkillsRequired] = useState([]);
  const navigate = useNavigate();

  const [resumeFile, setResumeFile] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [loginUrl, setLoginUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  // Define the steps
  const steps = ['Personal Information', 'Professional Details', 'Upload Resume'];


  const yearsOptions = Array.from({ length: 16 }, (_, i) => ({ label: i.toString() }));
  const qualificationsOptions = ['B.Tech', 'MCA', 'Degree', 'Intermediate', 'Diploma'];
  const skillsOptions = ['Java', 'C', 'C++', 'C Sharp', 'Python', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue', 'JSP', 'Servlets', 'Spring', 'Spring Boot', 'Hibernate', '.Net', 'Django', 'Flask', 'SQL', 'MySQL', 'SQL-Server', 'Mongo DB', 'Selenium', 'Regression Testing', 'Manual Testing'];
  const cities = ['Chennai', 'Thiruvananthapuram', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Kochi', 'Madurai', 'Mysore', 'Thanjavur', 'Pondicherry', 'Vijayawada'];

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/applicant/getApplicantById/${user.id}`);
        const newData = {
          identifier: response.data.email,
          password: response.data.password,
        };
        setRequestData(newData);
      } catch (error) {
        console.error('Error fetching applicant data:', error);
      }
    };
    fetchData();
  }, [user.id]);

  const validateForm1 = () => {
    const newErrors = {};
    const validFirstName = validateInput('firstName', applicant.firstName);
    const validLastName = validateInput('lastName', applicant.lastName);
    const validMobileNumber = validateInput('mobilenumber', applicant.mobilenumber);

    if (!applicant.firstName) newErrors.firstName = "First name is required";
    if (!applicant.lastName) newErrors.lastName = "Last name is required";
    if (!applicant.mobilenumber) newErrors.mobilenumber = "Mobile number is required";

    setErrors(newErrors);

    return validFirstName && validLastName && validMobileNumber && 
           applicant.firstName && applicant.lastName && applicant.mobilenumber;
  };

  const makeApiCall1 = async () => {

    if (!validateForm1()) {
      console.log(" returned in validation");
      return false;
    }
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      console.log(" returned during api call");
      // Now update the details in the applicant_profile table
      const putProfileResponse = await axios.post(
        `${apiUrl}/applicantprofile/createprofile/${user.id}`,
        applicantProfileDTO,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      console.log(" returned after api call");

      console.log('POST API Response for Profile Data:', putProfileResponse.data);

      window.alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error submitting form data:', error);
    }
  };
  
  const makeApiCall2 = async () => {
    // Implement your API call logic for stage 2
    // ...
  };

  const handleResumeSelect = (e) => {
    const file = e.target.files[0];
    setResumeFile(file);
    setSelectedFile(file);
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
    const apiUrl1 = 'https://rb.chalowithcharan.com:5173/api/auth/login';
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
          const loginUrl = `https://rb.chalowithcharan.com:5173/auth/login?identifier=${encodeURIComponent(requestData.identifier)}&password=${encodeURIComponent(requestData.password)}`;
          setLoginUrl(loginUrl);
          window.open(loginUrl, '_blank');
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
    }
  };

  const handleNext = async () => {
    
  
    try {
      // Make the appropriate API call based on the current stage
      switch (currentStage) {
        case 1:
          const response1 = await makeApiCall1(); // Replace with your actual API call and handle response
          

          console.log('API call 1 response:');
          break;
        case 2:
          const response2 = await makeApiCall2(); // Replace with your actual API call and handle response
          console.log('API call 2 response:');
          break;
        default:
          console.warn('Unexpected stage:');
          // Handle unexpected stage (optional)
          break;
      }
  
      // Update current stage only if the API call succeeds (optional)
      setCurrentStage((prevStage) => Math.min(prevStage + 1, steps.length));
    } catch (error) {
      console.error('Error during API call:', error);
      // Handle API call errors (optional)
    }
  };

  const handleBack = () => {
    setCurrentStage((prevStage) => Math.max(prevStage - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isFormValid = validateForm();
    if (!isFormValid) return;
    // Handle final form submission logic here
    // Reset form fields
    resetForm();
    navigate('/applicant-basic-details1');
  };

  const validateForm = () => {
    const newErrors = {};
    if (currentStage === 1) {
      if (!applicant.name) newErrors.name = 'Name is required';
      if (!applicant.email) newErrors.email = 'Email is required';
      if (!applicant.mobilenumber) newErrors.mobilenumber = 'Mobile number is required';
      if (!experience) newErrors.experience = 'Experience is required';
    } else if (currentStage === 2) {
      if (!qualification) newErrors.qualification = 'Qualification is required';
      if (!specialization) newErrors.specialization = 'Specialization is required';
      if (!preferredJobLocations.length) newErrors.preferredJobLocations = 'At least one job location is required';
      if (!skillsRequired.length) newErrors.skillsRequired = 'At least one skill is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setApplicant({ name: '', email: '', mobilenumber: '' });
    setExperience('');
    setSkills([]);
    setCity('');
    setState('');
    setQualification('');
    setSpecialization('');
    setSelectedCities([]);
    setSelectedSkills([]);
    setPreferredJobLocations([]);
    setSkillsRequired([]);
    setResumeFile(null);
    setRequestData(null);
    setLoginUrl('');
    setSelectedFile(null);
  };

  const specializationsByQualification = {
    'B.Tech': ['CSE', 'ECE', 'EEE', 'MECH', 'CE', 'Aerospace Engineering', 'IT', 'Chemical Engineering', 'Biotechnology Engineering'],
    'MCA': ['Software Engineering', 'Data Science', 'AI', 'ML', 'Information Security', 'Cloud Computing', 'Mobile Application Development', 'Web Development', 'Database Management', 'Network Administration', 'Cyber Security', 'IT Project Management'],
    'Degree': ['Physics', 'Mathematics', 'Statistics', 'Computer Science', 'Electronics', 'Chemistry', 'Bachelor of Commerce'],
    'Intermediate': ['MPC', 'BiPC', 'CEC', 'HEC'],
    'Diploma': ['Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Electronics and Communication Engineering', 'Computer Engineering', 'Automobile Engineering', 'Chemical Engineering', 'Information Technology', 'Instrumentation Engineering', 'Mining Engineering', 'Metallurgical Engineering', 'Agricultural Engineering', 'Textile Technology', 'Interior Designing', 'Fashion Designing', 'Hotel Management and Catering Technology', 'Pharmacy', 'Medical Laboratory Technology', 'Radiology and Imaging Technology']
  };

  const renderStageFields = () => {
    switch (currentStage) {
      case 1:
        return (
          <div className="input-container">
      <div className="input-wrapper">
        <input
          type="text"
          name="firstName"
          placeholder="*First Name"
          value={applicant.firstName}
          className="input-form"
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
        {errors.firstName && <div className="error-message">{errors.firstName}</div>}
      </div>

      <div className="input-wrapper">
        <input
          type="text"
          name="lastName"
          placeholder="*Last Name"
          value={applicant.lastName}
          className="input-form"
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
        {errors.lastName && <div className="error-message">{errors.lastName}</div>}
      </div>

      <div className="input-wrapper">
        <input
          type="email"
          placeholder="*Email"
          value={applicant.email}
          className="input-form"
          readOnly
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>

      <div className="input-wrapper">
        <input
          type="tel"
          name="mobilenumber"
          placeholder="*WhatsApp Number"
          value={applicant.mobilenumber}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="input-form"
          pattern="^\+(?:[0-9]?){6,14}[0-9]$"
          title="Enter a valid WhatsApp number"
          required
        />
        {errors.mobilenumber && <div className="error-message">{errors.mobilenumber}</div>}
      </div>
    </div>
        );
      case 2:
        return (
          <div className="input-container">
            <div className="input-wrapper">
              <Typeahead
                id="qualification"
                options={qualificationsOptions}
                placeholder="*Qualification"
                onChange={(selected) => setQualification(selected[0])}
                selected={qualification ? [qualification] : []}
                className="input-form typeahead"
              />
              {errors.qualification && <div className="error-message">{errors.qualification}</div>}
            </div>
  
            <div className="input-wrapper">
              <Typeahead
                id="specialization"
                options={qualification ? specializationsByQualification[qualification] : []}
                placeholder="*Specialization"
                onChange={(selected) => setSpecialization(selected[0])}
                selected={specialization ? [specialization] : []}
                className="input-form typeahead"
              />
              {errors.specialization && <div className="error-message">{errors.specialization}</div>}
            </div>
  
            <div className="input-wrapper">
              <Typeahead
                id="skillsRequired"
                multiple
                options={skillsOptions}
                placeholder="*Skills Required"
                onChange={setSkillsRequired}
                selected={skillsRequired}
                className="input-form typeahead"
              />
              {errors.skillsRequired && <div className="error-message">{errors.skillsRequired}</div>}
            </div>
            
            <div className="input-wrapper">
              <Typeahead
                id="preferredJobLocations"
                multiple
                options={cities}
                placeholder="*Preferred Job Locations"
                onChange={setPreferredJobLocations}
                selected={preferredJobLocations}
                className="input-form typeahead"
              />
              {errors.preferredJobLocations && <div className="error-message">{errors.preferredJobLocations}</div>}
            </div>
  
           
          </div>
        );
      case 3:
        return (
          <div className="col-lg-12 col-md-12">
            <div className="post-new profile-setting bg-white">
              <div className="wrap-img flex2" style={{ position: 'relative' }}>
                <div id="upload-profile" style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    className="up-file"
                    id="tf-upload-img"
                    type="file"
                    name="profile"
                    required
                    onChange={handleResumeSelect}
                    style={{ marginRight: '5px' }}
                  />
                  <button
                    type="button"
                    onClick={handleResumeUpload}
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
                    }}
                  >
                    Upload Resume
                  </button>
                  {selectedFile && <p>Selected file: {selectedFile.name}</p>}
                </div>
              </div>
              <br />
              <p style={{ marginRight: '5px' }}>Or</p>
              <br />
              <div id="item_2" className="col-lg-6 col-md-12" style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleResumeBuilder}
                  className="btn-3"
                  style={{
                    backgroundColor: '#F97316',
                    color: 'white',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '5px',
                  }}
                >
                  Build Your Resume
                </button>
              </div>
            </div>
          </div>
        );
    }
  };
  
  
  

  const Stepper = ({ currentStage }) => {
    return (
      <div className="stepper">
        {steps.map((step, i) => (
          <div key={i} className="step-item">
            {i !== 0 && (
              <div
                className={`step-line ${
                  currentStage > i  ? 'completed' : ''
                }`}
              ></div>
            )}
            <div
              className={`step-circle ${
                currentStage === i + 1 ? 'active' : ''
              } ${currentStage > i + 1 ? 'completed' : ''}`}
            >
              {currentStage > i + 1 ? '✔' : i + 1}
            </div>
            <p className="step-label">{step}</p>
          </div>
        ))}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="spinner-container">
        <ClipLoader color="#0d6efd" loading={loading} size={50} />
      </div>
    );
  }

  return (
    <div class="component">
      <img className="top-left-svg" src="images/logo.png" alt="Image" usemap="#image-map" />
    <div className="card-container">
    <div className="card">
      <div className="header">
        <p className="form-title">Complete Your Profile</p>
        <p>Fill the form fields to go to the next step</p>
      </div>
      <div className="stepper-container">
        <Stepper currentStage={currentStage} />
      </div>
      <div className="form-container">
        <form onSubmit={handleSubmit} className="applicant-details-form">
          <div className="row">
            {renderStageFields()}
          </div>
          <div className="button-container">
            {currentStage > 1 && (
              <button type="button" onClick={handleBack} className="form-button">Back</button>
            )}
            {currentStage < 3 && (
              <button type="button" onClick={handleNext} className="form-button">Next</button>
            )}
            {currentStage === 3 && (
              <button type="submit" className="form-button">Submit</button>
            )}
          </div>
        </form>
      </div>
    </div>
    </div>
    </div>
  );
};

export default ApplicantBasicDetails;
