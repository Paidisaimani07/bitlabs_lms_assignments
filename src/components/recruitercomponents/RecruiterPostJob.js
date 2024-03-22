import React from 'react';
import ApplicantAPIService,{ apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useState, useEffect,useRef } from "react";
import axios from 'axios';
 
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
  const [skillsRequired, setSkillsRequired] = useState([
    { skillName: "", minimumExperience: "" },
  ]);
  const [jobHighlights, setJobHighlights] = useState("");
  const [description, setDescription] = useState("");
  const [uploadDocument, setUploadDocument] = useState(null);
  const [image, setImage] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [fileName, setFileName] = useState("No selected file")
  const fileInputRef = useRef(null);
  const user1 = useUserContext();
  const user = user1.user;
  const handleSubmit = (e) => {
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
      skillsRequired,
      jobHighlights,
      description,
      uploadDocument,
    };
    const jwtToken = localStorage.getItem('jwtToken');
    const headers = {
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    };
    axios
      .post(`${apiUrl}/job/recruiters/saveJob/${user.id}`, formData, { headers })
      .then((response) => {
        console.log('API Response:', response.data);
        window.alert('job saved successfully');
        clearForm();
      })
      .catch((error) => {
        console.error('API Error:', error);
      });
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
    skillsRequired: [{ skillName: '', minimumExperience: '' }],
    jobHighlights: '',
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
    setSkillsRequired([{ skillName: '', minimumExperience: '' }]);
    setJobHighlights('');
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
    const skillsErrors = [];
    skillsRequired.forEach((skill, index) => {
      const skillErrors = {};
      if (!skill.skillName.trim()) {
        skillErrors.skillName = 'Skill name is required.';
        isValid = false;
      } else {
        skillErrors.skillName = '';
      }
      if (!skill.minimumExperience.trim()) {
        skillErrors.minimumExperience = 'Experience is required.';
        isValid = false;
      } 
      else if (!/^\d+$/.test(skill.minimumExperience.trim())) {
        skillErrors.minimumExperience = 'Experience should contain only digits.';
        isValid = false;
      }
      else {
        skillErrors.minimumExperience = '';
      }
      skillsErrors[index] = skillErrors;
    });
    errors.skillsRequired = skillsErrors;
 
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
    if (jobHighlights && jobHighlights.trim().length < 3) {
      isValid = false;
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        jobHighlights: 'Job highlights must be at least 3 characters long.',
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
  setMinimumExperience(e.target.value);
  setFormErrors((prevErrors) => ({
    ...prevErrors,
    minimumExperience: '',
  }));
};
const handleMaximumExperienceChange = (e) => {
  setMaximumExperience(e.target.value);
  setFormErrors((prevErrors) => ({
    ...prevErrors,
    maximumExperience: '',
  }));
};
const handleMinSalaryChange = (e) => {
  setMinSalary(e.target.value);
  setFormErrors((prevErrors) => ({
    ...prevErrors,
    minSalary: '',
  }));
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
const handleSkillChange = (e, index, field) => {
  const updatedSkillsRequired = [...skillsRequired];
  updatedSkillsRequired[index][field] = e.target.value;
  setSkillsRequired(updatedSkillsRequired);
  setFormErrors((prevErrors) => ({
    ...prevErrors,
    skillsRequired: '',
  }));
};
const handleJobHighlightsChange = (e) => {
  setJobHighlights(e.target.value);
  setFormErrors((prevErrors) => ({
    ...prevErrors,
    jobHighlights: '',
  }));
};
const handleDescriptionChange = (e) => {
  setDescription(e.target.value);
  setFormErrors((prevErrors) => ({
    ...prevErrors,
    description: '',
  }));
};
const handleExperienceChange = (e, index, field) => {
  const updatedSkillsRequired = [...skillsRequired];
  updatedSkillsRequired[index][field] = e.target.value;
  setSkillsRequired(updatedSkillsRequired);
  setFormErrors((prevErrors) => ({
    ...prevErrors,
    skillsRequired: '', 
  }));
};
 
const handleMaxSalaryChange = (e) => {
  setMaxSalary(e.target.value);
  setFormErrors((prevErrors) => ({
    ...prevErrors,
    maxSalary: '',
  }));
};
  const addExperience = () => {
    setSkillsRequired([...skillsRequired, { skillName: "", minimumExperience: "" }]);
 
  };
  const removeExperience = () => {
    if (skillsRequired.length > 1) {
      const updatedSkills = [...skillsRequired.slice(0, -1)];
      setSkillsRequired(updatedSkills);
    }
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
          // Add other specializations as needed
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
          // Add other specializations as needed
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
          // Add other specializations as needed
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
          // Add other specializations as needed
        ];
      // Add cases for other qualifications
      default:
        return [];
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setFileName(file.name);
        setImage(URL.createObjectURL(file));
      } else {
               alert("Please select a valid PDF or DOC file.");
        e.target.value = null; 
      }
    }
  };
 const handleBrowseClick = () => {
 if (fileInputRef.current) {
 
      fileInputRef.current.click();
 
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
            <div className="title-dash flex2">Post Job</div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section className="flat-dashboard-post flat-dashboard-setting">
  <form onSubmit={handleSubmit}>
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
                <textarea
                    className="input-form"
                    placeholder="Job Description at least 15 characters"
                    value={description}
                    onChange={handleDescriptionChange}
                    required
                  />
                  {formErrors.description && (
                  <div className="error-message">{formErrors.description}</div>
                )}
              </div>
            </div>
            <div className="row">
                <div className="col-lg-6 col-md-6">
                <div id="item_category" className="dropdown titles-dropdown info-wd">
                 <label className="title-user fw-7">Minimum Experience<span className="color-red">*</span></label>
                  <input  type="number"
                          placeholder="Min"
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
                  <label className="title-user fw-7">Maximum Experience<span className="color-red">*</span></label>
                  <input type="number"
                         placeholder="Max"
                         className="input-form"
                         value={maximumExperience}
                         onChange={handleMaximumExperienceChange}
                     
                         required
                  />
                   {formErrors.maximumExperience&& (
                  <div className="error-message">{formErrors.maximumExperience}</div>
                )}
                </div>
                </div>

                <div className="col-lg-6 col-md-12">
                <div id="item_1" className="dropdown titles-dropdown info-wd">
                  <label className="title-user fw-7">Minimum Salary<span className="color-red">*</span></label>
                  <input type="text"
                         placeholder="Min"
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
                  <label className="title-user fw-7">Maximum Salary<span className="color-red">*</span></label>
                  <input
                             type="text"
                             placeholder="Max"
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
  {/* Add other qualifications as needed */}
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
  {/* Add other locations as needed */}
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
                <label className="title-user fw-7">Job Highlights</label>
                  {/* <input type="text"
                         className="input-form"
                         placeholder="Job key points"
                         value={jobHighlights}
                         onChange={handleJobHighlightsChange}
                       
                  /> */}
                    <textarea
                    className="input-form"
                    placeholder="Job Highlights"
                    value={jobHighlights}
                    onChange={handleJobHighlightsChange}
                  />
                  {formErrors.jobHighlights && (
                  <div className="error-message">{formErrors.jobHighlights}</div>
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
                  <label className="title-user fw-7">Skills<span className="color-red">*</span></label>
                  {skillsRequired.map((skill, index) => (
                    <div key={index} className="experience-table">
                      <div>
                      <select
        value={skill.skillName}
        className="input-form"
        onChange={(e) => handleSkillChange(e, index, "skillName")}
        style={{ color: skill.skillName ? 'black' : 'lightgrey' }}
        required
      >
        <option value="">Select Skill</option>
        <option value="Java">Java</option>
        <option value="C">C</option>
        <option value="C+">C+</option>
        <option value="C Sharp">C Sharp</option>
        <option value="Python">Python</option>
        <option value="HTML">HTML</option>
        <option value="CSS">CSS</option>
        <option value="JavaScript">JavaScript</option>
        <option value="TypeScript">TypeScript</option>
        <option value="Angular">Angular</option>
        <option value="React">React</option>
        <option value="Vue">Vue</option>
        <option value="JSP">JSP</option>
        <option value="Servlets">Servlets</option>
        <option value="Spring">Spring</option>
        <option value="Spring Boot">Spring Boot</option>
        <option value="Hibernate">Hibernate</option>
        <option value=".Net">.Net</option>
        <option value="Django">Django</option>
        <option value="Flask">Flask</option>
        <option value="SQL">SQL</option>
        <option value="MySQL">MySQL</option>
        <option value="SQL-Server">SQL-Server</option>
        <option value="Mongo DB">Mongo DB</option>
        <option value="Selenium">Selenium</option>
        <option value="Regression Testing">Regression Testing</option>
        <option value="Manual Testing">Manual Testing</option>
        {/* Add other skills as needed */}
      </select>
                        
                        {formErrors.skillsRequired && formErrors.skillsRequired[index] && formErrors.skillsRequired[index].skillName && (
                          <div className="error-message">{formErrors.skillsRequired[index].skillName}</div>
                        )}
                      </div><br />
                      <div>
                        <input
                          type="text"
                          placeholder="Experience"
                          className="input-form"
                          value={skill.minimumExperience}
                          onChange={(e) => handleExperienceChange(e, index, "minimumExperience")}
                          required
                        />
                        {formErrors.skillsRequired && formErrors.skillsRequired[index] && formErrors.skillsRequired[index].minimumExperience && (
                          <div className="error-message">{formErrors.skillsRequired[index].minimumExperience}</div>
                        )}
                      </div>
                      {index === skillsRequired.length - 1 && (
                        <button type="button" onClick={addExperience} style={{'color':'#FFFFFF','backgroundColor':'green'}}>
                          +
                        </button>
                      )} &nbsp;
                      {index === skillsRequired.length - 1 && (
                        <button type="button" onClick={removeExperience} style={{'color':'#FFFFFF','backgroundColor':'#FF0000'}}>
                          -
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                </div>
              </div>
            <div className="form-infor flex flat-form">
              <div className="info-box info-wd">
             </div>
            </div>
            <div className="form-group">
                <button type="submit" onClick={handleSubmit} className='button-status'>Post Job</button>
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
export default RecruiterPostJob;