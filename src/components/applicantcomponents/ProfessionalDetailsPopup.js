import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';

import { Typeahead } from 'react-bootstrap-typeahead';

const ProfessionalDetailsPopup = ({ applicantDetails }) => {


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
  const [formValues, setFormValues] = useState({
    firstName: applicantDetails.firstName || '',
    lastName: applicantDetails.lastName || '',
    email: applicantDetails.email || '',
    alternatePhoneNumber: applicantDetails.alternatePhoneNumber || '',
  });
  const [errors, setErrors] = useState({});
 
  const user1 = useUserContext();
  const user = user1.user;

  const validateInput = (name, value) => {
    let error = '';
    if (!value) {
      var formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      if (name === 'alternatePhoneNumber') {
       formattedName = 'Mobile number';
    }
      error=`${formattedName} is required.`;
      // error = `${name} is required.`;
    } else {
      if (name === 'firstName' || name === 'lastName') {
        if (value.length < 3) {
          error = `${name === 'firstName' ? 'First' : 'Last'}name should be at least 3 characters.`;
        } else if (!/^[a-zA-Z]+$/.test(value)) {
          error = `${name === 'firstName' ? 'First' : 'Last'}name should contain only letters.`;
        }
      } else if (name === 'alternatePhoneNumber') {
        if (!/^[6789]\d{9}$/.test(value)) {
          error = 'Mobile number should be 10 digits, starting with 6, 7, 8, or 9.';
        }
      } else if (name === 'email') {
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
          error = 'Invalid email address.';
        }
      }
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    setErrors({ ...errors, [name]: validateInput(name, value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formValues).forEach((key) => {
      const error = validateInput(key, formValues[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.put(`${apiUrl}/applicantprofile/${user.id}/basic-details`, formValues, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (response.status === 200) {
          window.alert('Basic details updated successfully!');
          window.location.reload();
        } else {
          console.error('An error occurred:', response.status, response.statusText);
          window.alert("Failed to update basic details.");
        }
      } catch (error) {
        console.error('An error occurred:', error);
        window.alert("Failed to update basic details due to an error.");
      }
    }
  };
  const yearsOptions = Array.from({ length: 16 }, (_, i) => ({ label: `${i} years` }));
  const qualificationsOptions = ['B.Tech', 'MCA', 'Degree', 'Intermediate', 'Diploma'];
  const skillsOptions = ['Java', 'C', 'C++', 'C Sharp', 'Python', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue', 'JSP', 'Servlets', 'Spring', 'Spring Boot', 'Hibernate', '.Net', 'Django', 'Flask', 'SQL', 'MySQL', 'SQL-Server', 'Mongo DB', 'Selenium', 'Regression Testing', 'Manual Testing'];
  const cities = ['Chennai', 'Thiruvananthapuram', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Kochi', 'Madurai', 'Mysore', 'Thanjavur', 'Pondicherry', 'Vijayawada'];
  const specializationsByQualification = {
    'B.Tech': ['CSE', 'ECE', 'EEE', 'MECH', 'CE', 'Aerospace Engineering', 'IT', 'Chemical Engineering', 'Biotechnology Engineering'],
    'MCA': ['Software Engineering', 'Data Science', 'AI', 'ML', 'Information Security', 'Cloud Computing', 'Mobile Application Development', 'Web Development', 'Database Management', 'Network Administration', 'Cyber Security', 'IT Project Management'],
    'Degree': ['Physics', 'Mathematics', 'Statistics', 'Computer Science', 'Electronics', 'Chemistry', 'Bachelor of Commerce'],
    'Intermediate': ['MPC', 'BiPC', 'CEC', 'HEC'],
    'Diploma': ['Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Electronics and Communication Engineering', 'Computer Engineering', 'Automobile Engineering', 'Chemical Engineering', 'Information Technology', 'Instrumentation Engineering', 'Mining Engineering', 'Metallurgical Engineering', 'Agricultural Engineering', 'Textile Technology', 'Interior Designing', 'Fashion Designing', 'Hotel Management and Catering Technology', 'Pharmacy', 'Medical Laboratory Technology', 'Radiology and Imaging Technology']
  };


  return (
    <div className="basic-details-edit-popup">
       <div className='popup-heading'>Professional Details
      
      </div>
      <div className="input-container-basicdetails">
      <div className="input-wrapper1">
              <Typeahead
                id="qualification"
                options={qualificationsOptions}
                placeholder="*Qualification"
                onChange={(selected) => setQualification(selected[0])}
                selected={qualification ? [qualification] : []}
                // className="input-form.typeahead-profdata"
                 className="custom-typeahead"
              />
              {errors.qualification && <div className="error-message">{errors.qualification}</div>}
            </div>
  
            <div className="input-wrapper1">
              <Typeahead
                id="specialization"
                options={qualification ? specializationsByQualification[qualification] : []}
                placeholder="*Specialization"
                onChange={(selected) => setSpecialization(selected[0])}
                selected={specialization ? [specialization] : []}
                // className="input-form.typeahead-profdata"
                 className="custom-typeahead"
              />
              {errors.specialization && <div className="error-message">{errors.specialization}</div>}
            </div>
  
            <div className="input-wrapper1">
              <Typeahead
                id="skillsRequired"
                multiple
                options={skillsOptions}
                placeholder="*Skills Required"
                onChange={setSkillsRequired}
                selected={skillsRequired}
                // className="input-form.typeahead-profdata"
                 className="custom-typeahead"
              />
              {errors.skillsRequired && <div className="error-message">{errors.skillsRequired}</div>}
            </div>
            <div className="input-wrapper1">
      <Typeahead
        id="experience"
        options={yearsOptions}
        placeholder="*Experience"
        onChange={(selected) => setExperience(selected[0] ? selected[0].label : '')}
        selected={yearsOptions.filter(option => option.label === experience)}
        // className="input-form.typeahead-profdata"
         className="custom-typeahead"
        single
      />
      {!experience && errors.experience && (
        <div className="error-message">{errors.experience}</div>
      )}
    </div>
            <div className="input-wrapper1">
              <Typeahead
                id="preferredJobLocations"
                multiple
                options={cities}
                placeholder="*Preferred Job Locations"
                onChange={setPreferredJobLocations}
                selected={preferredJobLocations}
                // className="input-form.typeahead-profdata"
                 className="custom-typeahead1"
              />
              {errors.preferredJobLocations && <div className="error-message">{errors.preferredJobLocations}</div>}
            </div>
  
    
      </div>
      <div className='savebut'>
        <button
        type="button"
        onClick={handleSubmit}
        className="btn-3"
        style={{
          backgroundColor: '#F97316',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '5px',
          textTransform:'capitalize',
          height: '48px',
          // marginLeft:'80%'
          
          
        }}
      >
        Save Changes
      </button>
      </div>
      
    </div>
  );
};

export default ProfessionalDetailsPopup;
