import React from 'react';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useState, useEffect, useRef } from "react";
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import { useNavigate,useLocation } from 'react-router-dom';

import axios from 'axios';
import Snackbar from '../common/Snackbar';

function RecruiterPostJob() {
  const [jobTitle, setJobTitle] = useState("");
  const [formLoaded, setFormLoaded] = useState(false);
  const [minimumExperience, setMinimumExperience] = useState("");
  const [maximumExperience, setMaximumExperience] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [location, setLocation] = useState("");
  const [employeeType, setEmployeeType] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [minimumQualification, setMinimumQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const navigate = useNavigate();
  const [skillsRequired, setSkillsRequired] = useState([]);
  const [description, setDescription] = useState("");
  const [uploadDocument, setUploadDocument] = useState(null);
  const [image, setImage] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [fileName, setFileName] = useState("No selected file")
  const location1 = useLocation();
  const [isActive, setIsActive] = useState(false);
  const fileInputRef = useRef(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
  const user1 = useUserContext();
  const user = user1.user;
  const locationState = useLocation().state;

  useEffect(() => {
    // Load data from local storage or passed state
    const formData = locationState || JSON.parse(localStorage.getItem('jobDetails'));
    if (formData) {
      setJobTitle(formData.jobTitle);
      setMinimumExperience(formData.minimumExperience);
      setMaximumExperience(formData.maximumExperience);
      setMinSalary(formData.minSalary);
      setMaxSalary(formData.maxSalary);
      setLocation(formData.location);
      setEmployeeType(formData.employeeType);
      setIndustryType(formData.industryType);
      setMinimumQualification(formData.minimumQualification);
      setSpecialization(formData.specialization);
      setSkillsRequired(formData.skillsRequired);
      setDescription(formData.description);
      setUploadDocument(formData.uploadDocument);
      setFileName(formData.uploadDocument ? formData.uploadDocument.name : "No selected file");
    }
  }, [locationState]);

  const handleNext = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const formData = {
      jobTitle,
      minimumExperience,
      maximumExperience,
      minSalary,
      maxSalary,
      location,
      employeeType,
      industryType,
      minimumQualification,
      specialization,
      skillsRequired: formattedSkillsRequired,
      description,
      uploadDocument,
    };

    localStorage.setItem('jobDetails', JSON.stringify(formData));
    navigate('/recruiter-postjob2');
     
  //   // const jwtToken = localStorage.getItem('jwtToken');
  //   // const headers = {
  //   //   Authorization: `Bearer ${jwtToken}`,
  //   //   'Content-Type': 'application/json',
  //   // };
  //   // axios
  //   //   .post(`${apiUrl}/job/recruiters/saveJob/${user.id}`, formData, { headers })
  //   //   .then((response) => {
  //   //     console.log('API Response:', response.data);
       
  //   //    setSnackbar({ open: true, message: 'Job saved successfully', type: 'success' });
  //   //     clearForm();
  //   //   })
  //   //   .catch((error) => {
  //   //     console.error('API Error:', error);
  //   //   });
  };
  useEffect(() => {
    const fetchApprovalStatus = async () => {
      try {
        const response = await axios.get(`${apiUrl}/companyprofile/companyprofile/approval-status/${user.id}`);
        setApprovalStatus(response.data);
        setFormLoaded(true);
      } catch (error) {
        console.error('Approval Status Error:', error);
      }
    };
    if (!formLoaded) {
      fetchApprovalStatus();
    }
  }, [user.id, formLoaded]);

  useEffect(() => {
    if (approvalStatus && approvalStatus !== 'approved') {
      alert("Sorry, you can't post the job until your profile is verified");
     
      window.location.href = '/recruiter-my-organization';
    }
  }, [approvalStatus]);
  const [formErrors, setFormErrors] = useState({
    jobTitle: '',
    minSalary: '',
    maxSalary: '',
    minimumExperience: '',
    maximumExperience: '',
    location: '',
    minimumQualification: '',
    description: '',
    skills: '',
    skillsRequired: [],
    
    description: '',
    uploadDocument: '',
    specialization: '',
  });
  const clearForm = () => {
    setJobTitle('');
    setMinimumExperience('');
    setMaximumExperience('');
    setMinSalary('');
    setMaxSalary('');
    setLocation('');
    setEmployeeType('');
    setIndustryType('');
    setMinimumQualification('');
    setSpecialization('');
    setSkillsRequired([]);
    setDescription('');
    setUploadDocument(null);
    setFileName('No selected file');
    setImage(null);
  };
  const validateForm = () => {
    let isValid = true;
    const errors = {};
    if (!jobTitle.trim()) {
      isValid = false;
      errors.jobTitle = 'Job title is required.';
    } else {
      errors.jobTitle = '';
    }
    if (!minimumExperience.trim()) {
      
    
      setMinimumExperience('');
      isValid = false;
      errors.minimumExperience = 'Minimum experience is required.';
    } else {
      
      errors.minimumExperience = '';
    }
    if (!maximumExperience.trim()) {
      errors.maximumExperience = 'Maximum experience is required.';
      isValid = false;
    } else if (parseInt(minimumExperience) > parseInt(maximumExperience)) {
      errors.maximumExperience = 'Maximum experience should be greater than or equal to minimum experience.';
      isValid = false;
    } else {
      errors.maximumExperience = '';
    }
    if (!minSalary.trim()) {
      errors.minSalary = 'Minimum salary is required.';
      isValid = false;
    }
    else {
      errors.minSalary = '';
    }
    if (!maxSalary.trim()) {
      errors.maxSalary = 'Maximum salary is required.';
      isValid = false;
    } else if (parseInt(minSalary) > parseInt(maxSalary)) {
      errors.maxSalary = 'Maximum salary should be greater than or equal to minimum salary.';
      isValid = false;
    } else {
      errors.maxSalary = '';
    }
    if (!location.trim()) {
      errors.location = 'Location is required.';
      isValid = false;
    } else if (!/^[a-zA-Z]+$/.test(location.trim())) {
      errors.location = 'Location should contain only alphabets.';
      isValid = false;
    } else {
      errors.location = '';
    }
    if (!employeeType.trim()) {
      errors.employeeType = 'Job type is required.';
      isValid = false;
    } else {
      errors.employeeType = '';
    }
    if (!minimumQualification.trim()) {
      errors.minimumQualification = 'Minimum qualification is required.';
      isValid = false;
    } else {
      errors.minimumQualification = '';
    }

    if (skillsRequired.length === 0) {
      errors.skills = 'Skills are required';
      isValid = false;
    } else {
      errors.skills = ""; 
    }


    if (industryType && industryType.trim().length < 2) {
      isValid = false;
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        industryType: 'Industry type must be at least 2 characters long.',
      }));
      return isValid;
    }
    if (specialization && specialization.trim().length < 3) {
      isValid = false;
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        specialization: 'Specialization must be at least 3 characters long.',
      }));
      return isValid;
    }
  
      if (!description.trim() || description.trim().length < 15) {
        errors.description = 'Description is required and must be at least 15 characters long.';
        isValid = false;
      } else {
        errors.description = '';
      }
      setFormErrors(errors);
      return isValid;
    };

  const handleJobTitleChange = (e) => {
    setJobTitle(e.target.value);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      jobTitle: '',
    }));
  };
  const handleMinimumExperienceChange = (e) => {
    const value = e.target.value;  
    
    if (/^\d*$/.test(value)) {
      setMinimumExperience(value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        minimumExperience: '',
      }));
    } else {
      setMinimumExperience('');
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        minimumExperience: 'Minimum experience must be a valid number.',
      }));
    }
  };
  const handleMaximumExperienceChange = (e) => {
    const value = e.target.value;  
  
    if (/^\d*$/.test(value)) {
      setMaximumExperience(value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        maximumExperience: '',
      }));
    } else {
      setMaximumExperience('');
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        maximumExperience: 'Maximum experience must be a valid number.',
      }));
    }
  };
  const handleMaxSalaryChange = (e) => {
    const value = e.target.value;
    
    if (/^\d*\.?\d*$/.test(value)) {
      setMaxSalary(value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        maxSalary: '',
      }));
    } else {
      setMaxSalary('');
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        maxSalary: 'Max salary must be a valid number.',
      }));
    }
  };
  
  const handleMinSalaryChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setMinSalary(value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        minSalary: '',
      }));
    } else {
      setMinSalary('');
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        minSalary: 'Min salary must be a valid number.',
      }));
    }
  };
  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      location: '',
    }));
  };
  const handleEmployeeTypeChange = (e) => {
    setEmployeeType(e.target.value);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      employeeType: '',
    }));
  };
  const handleIndustryTypeChange = (e) => {
    setIndustryType(e.target.value);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      industryType: '',
    }));
  };
  const handleMinimumQualificationChange = (e) => {
    setMinimumQualification(e.target.value);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      minimumQualification: '',
    }));
  };
  const handleSpecializationChange = (e) => {
    setSpecialization(e.target.value);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      specialization: '',
    }));
  };

  
  const handleDescriptionChange = (content) => {
    setDescription(content);
    setFormErrors((prevErrors) => ({
         ...prevErrors,
          description: '',
         }));
  };
  const getSpecializationOptions = (qualification) => {
    switch (qualification) {
      case 'B.Tech':
        return [
          'Computer Science and Engineering (CSE)',
          'Electronics and Communication Engineering (ECE)',
          'Electrical and Electronics Engineering (EEE)',
          'Mechanical Engineering (ME)',
          'Civil Engineering (CE)',
          'Aerospace Engineering',
          'Information Technology(IT)',
          'Chemical Engineering',
          'Biotechnology Engineering',
          
        ];
      case 'MCA':
        return [
          'Software Engineering',
          'Data Science',
          'Artificial Intelligence',
          'Machine Learning',
          'Information Security',
          'Cloud Computing',
          'Mobile Application Development',
          'Web Development',
          'Database Management',
          'Network Administration',
          'Cyber Security',
          'IT Project Management',
         
        ];
      case 'Degree':
        return [
          'Bachelor of Science (B.Sc) Physics',
          'Bachelor of Science (B.Sc) Mathematics',
          'Bachelor of Science (B.Sc) Statistics',
          'Bachelor of Science (B.Sc) Computer Science',
          'Bachelor of Science (B.Sc) Electronics',
          'Bachelor of Science (B.Sc) Chemistry',
          'Bachelor of Commerce (B.Com)',
          
        ];
      case 'Intermediate':
        return ['MPC', 'BiPC', 'CEC', 'HEC'];
      case 'Diploma':
        return [
          'Mechanical Engineering',
          'Civil Engineering',
          'Electrical Engineering',
          'Electronics and Communication Engineering',
          'Computer Engineering',
          'Automobile Engineering',
          'Chemical Engineering',
          'Information Technology',
          'Instrumentation Engineering',
          'Mining Engineering',
          'Metallurgical Engineering',
          'Agricultural Engineering',
          'Textile Technology',
          'Architecture',
          'Interior Designing',
          'Fashion Designing',
          'Hotel Management and Catering Technology',
          'Pharmacy',
          'Medical Laboratory Technology',
          'Radiology and Imaging Technology',
          
        ];
      
      default:
        return [];
    }
  };
  const skillsOptions = [
    'Java',
    'C',
    'C+',
    'C Sharp',
    'Python',
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'Angular',
    'React',
    'Vue',
    'JSP',
    'Servlets',
    'Spring',
    'Spring Boot',
    'Hibernate',
    '.Net',
    'Django',
    'Flask',
    'SQL',
    'MySQL',
    'SQL-Server',
    'Mongo DB',
    'Selenium',
    'Regression Testing',
    'Manual Testing'
  ];

  const skillsOptionsWithStructure = skillsOptions.map(skill => ({ skillName: skill }));



  const handleSkillsChange = (selected) => {
    const skillsWithNames = selected.map((skill) => ({ skillName: skill.skillName }));
    setSkillsRequired(skillsWithNames);

    if (skillsWithNames.length > 0) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        skills: '', 
      }));
    } else {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        skills: 'Please select at least one skill.',
      }));
    }
  };
  const formattedSkillsRequired = skillsRequired.map((skill) => ({
    skillName: skill.skillName.toLowerCase(),
  }));

  const filterOutSelectedSkills = (options, selectedSkills) => {
    const selectedSkillNames = selectedSkills.map((skill) => skill.skillName.toLowerCase());
    return options.filter((option) => !selectedSkillNames.includes(option.skillName.toLowerCase()));
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setFileName(file.name);
        setImage(URL.createObjectURL(file));
      } else {
        
        setSnackbar({ open: true, message: 'Please select a valid PDF or DOC file.', type: 'error' });
        e.target.value = null;
      }
    }
  };
  const handleBrowseClick = () => {
    if (fileInputRef.current) {

      fileInputRef.current.click();

    }

  };

   const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: '' });
  };
  
  const handleFocus = () => {
    setIsActive(true);
  };

  const handleBlur = () => {
    setIsActive(false);

  };

  return (
    <div>
      <div className="dashboard__content">
        <section className="page-title-dashboard">
          <div className="themes-container">
            <div className="row">
              <div className="col-lg-12 col-md-12 ">
                <div className="title-dashboard">
                {/* <BackButton /> */}
                  <div className="title-dash flex2">Post a Job</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="flat-dashboard-post flat-dashboard-setting">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12 ">
                  <div className="post-new profile-setting bg-white">
                    <div className="wrap-titles">
                      <label className="title-user fw-7">Job Title<span className="color-red">*</span></label>
                      <fieldset className="info-wd">
                        <input
                          type="text"
                          placeholder="Job Role | Job Designation"
                          className="input-form"
                          value={jobTitle}
                          onChange={handleJobTitleChange}
                          required />
                        {formErrors.jobTitle && (
                          <div className="error-message">{formErrors.jobTitle}</div>
                        )}
                      </fieldset>
                    </div>
                   <div className="text-editor-wrap">
                          <label className="title-user fw-7">Job Description<span className="color-red">*</span></label>
                         <div className="text-editor-main">
                         <div className={`editor-wrapper ${isActive ? 'active' : ''}`}>
                         <>
  <style>
    {`
      .ql-editor h2 {
        font-weight: normal !important;
      }

      .ql-editor h3 {
        font-weight: normal !important;
      }
    `}
  </style>
  <ReactQuill 
    theme="snow" 
    value={description} 
    onChange={handleDescriptionChange}
    onFocus={handleFocus}
    onBlur={handleBlur}
    required
  />
</>
                       </div>
                   {formErrors.description && (
                  <   div className="error-message">{formErrors.description}</div>
                    )}
                  </div>
                 </div>
                    <div className="row">
                      <div className="col-lg-6 col-md-6">
                        <div id="item_category" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Minimum Experience (in Years)<span className="color-red">*</span></label>
                          <input type="text"
                            placeholder="4"
                            className="input-form"
                            value={minimumExperience}
                            onChange={handleMinimumExperienceChange}
                            required
                          />
                          {formErrors.minimumExperience && (
                            <div className="error-message">{formErrors.minimumExperience}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6">
                        <div id="item_1" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Maximum Experience (in Years)<span className="color-red">*</span></label>
                          <input type="text"
                            placeholder="6"
                            className="input-form"
                            value={maximumExperience}
                            onChange={handleMaximumExperienceChange}

                            required
                          />
                          {formErrors.maximumExperience && (
                            <div className="error-message">{formErrors.maximumExperience}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-lg-6 col-md-12">
                        <div id="item_1" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Minimum Salary (in LPA)<span className="color-red">*</span></label>
                          <input type="text"
                            placeholder="2.4"
                            className="input-form"
                            value={minSalary}
                            onChange={handleMinSalaryChange}
                            required
                          />
                          {formErrors.minSalary && (
                            <div className="error-message">{formErrors.minSalary}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-12">
                        <div id="item_2" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Maximum Salary (in LPA)<span className="color-red">*</span></label>
                          <input
                            type="text"
                            placeholder="6.5"
                            className="input-form"
                            value={maxSalary}
                            onChange={handleMaxSalaryChange}
                            required
                          />
                          {formErrors.maxSalary && (
                            <div className="error-message">{formErrors.maxSalary}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-12">
                        <div id="item_3" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Minimum Qualification<span className="color-red">*</span></label>
                          <select
                            value={minimumQualification}
                            placeholder='Select Qualification'
                            className="input-form"
                            style={{ color: minimumQualification ? 'black' : 'lightgrey' }}
                            onChange={handleMinimumQualificationChange}
                            required
                          >
                            <option value="" >Select Qualification</option>
                            <option value="B.Tech">B.Tech</option>
                            <option value="MCA">MCA</option>
                            <option value="Degree">Degree</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Diploma">Diploma</option>
                          
                          </select>
                          {formErrors.minimumQualification && (
                            <div className="error-message">{formErrors.minimumQualification}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-12">
                        <div id="item_1" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Specialization</label>
                          <select
                            value={specialization}
                            className="input-form"
                            style={{ color: specialization ? 'black' : 'lightgrey' }}
                            onChange={handleSpecializationChange}
                          >
                            <option value="">Select Specialization</option>
                            {getSpecializationOptions(minimumQualification).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          {formErrors.specialization && (
                            <div className="error-message">{formErrors.specialization}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-12">
                        <div id="item_apply" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Location<span className="color-red">*</span></label>
                          <select
                            value={location}
                            className="input-form"
                            onChange={handleLocationChange}
                            style={{ color: location ? 'black' : 'lightgrey' }}
                            required
                          >
                            <option value="">Select Location</option>
                            <option value="Chennai">Chennai</option>
                            <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                            <option value="Bangalore">Bangalore</option>
                            <option value="Hyderabad">Hyderabad</option>
                            <option value="Coimbatore">Coimbatore</option>
                            <option value="Kochi">Kochi</option>
                            <option value="Madurai">Madurai</option>
                            <option value="Mysore">Mysore</option>
                            <option value="Thanjavur">Thanjavur</option>
                            <option value="Pondicherry">Pondicherry</option>
                            <option value="Vijayawada">Vijayawada</option>
                            <option value="Pune">Pune</option>
                            <option value="Gurgaon">Gurgaon</option>
                          
                          </select>
                          {formErrors.location && (
                            <div className="error-message">{formErrors.location}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-12">
                        <div id="item_1" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Industry Type</label>
                          <input
                            type="text"
                            value={industryType}
                            className="input-form"
                            placeholder="Sector"
                            onChange={handleIndustryTypeChange}
                          />
                          {formErrors.industryType && (
                            <div className="error-message">{formErrors.industryType}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-lg-6 col-md-12">
                        <div id="item_1" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">
                            Job Type<span className="color-red">*</span>
                          </label>
                          <select value={employeeType}
                            className="input-form"
                            onChange={handleEmployeeTypeChange}
                            style={{ color: employeeType ? 'black' : 'lightgrey' }}
                            required>
                            <option value="">Select</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                          </select>
                          {formErrors.employeeType && (
                            <div className="error-message">{formErrors.employeeType}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-lg-6 col-md-12">
                        <div id="item_1" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">
                            Skills<span className="color-red">*</span>
                          </label>
                          <Typeahead
                            id="skillsTypeahead"
                            labelKey={(option) => option.skillName}
                            multiple
                            placeholder="Skills*"
                            options={filterOutSelectedSkills(skillsOptionsWithStructure, skillsRequired)}
                            onChange={(selectedSkills) => handleSkillsChange(selectedSkills)}
                            selected={skillsRequired}
                            inputProps={{
                              className: 'input-form placeholder-light-grey',
                            }}
                            allowNew={false} 
                            filterBy={(option, props) =>
                              option.skillName.toLowerCase().startsWith(props.text.toLowerCase())
                            }
                          />
                          {formErrors.skills && (
                            <div className="error-message">{formErrors.skills}</div>
                          )}
                        </div>

                      </div>
                    </div>

                    <div className="form-infor flex flat-form">
                      <div className="info-box info-wd">
                      </div>
                    </div>
                    <div className="form-group" align='right'>
                      {/* <button type="submit" onClick={handleSubmit} className='button-status'>Next</button> */}
                      <button onClick={handleNext} className='button-status'>Next</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </section>
      </div>
      {snackbar.open && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
          link={snackbar.link}
          linkText={snackbar.linkText}
        />
      )}
    </div>
  )
}
export default RecruiterPostJob;