import React, { useState,useEffect } from 'react';
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
 
 
const ApplicantBasicDetails = () => {
 
 
  const { user } = useUserContext();
 
  const[applicant,setApplicant]=useState({
    name:"",
    email:"",
    mobilenumber:"",
   });
 
   
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [qualification, setQualification] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [resume, setResume] = useState(null);
  const[fullName, setFullName]=useState(null);
  const[mobilenumber, setMobileNumber]=useState(null);
  const[email,setEmail]=useState(null);
   const [phone, setPhone] = useState('');
   const [specialization, setSpecialization] = useState('');
  const [selectedCity, setSelectedCity] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [cityError, setCityError] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillsError, setSkillsError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [skillsRequired, setSkillsRequired] = useState([
   
  ]);
  useEffect(() => {
    setLoading(false);
  }, []);
 
  const [preferredJobLocations, setPreferredJobLocations] = useState([]);
  const yearsOptions = Array.from({ length: 16 }, (_, i) => i); // 0 to 10
 
  const qualificationsOptions = [
    'B.Tech',
    'MCA',
    'Degree',
    'Intermediate',
    'Diploma',
  ];
 
 
 
  const validateForm = () => {
    const newErrors = { ...errors }; // Assuming errors is the state containing existing errors
 
    if (!experience) {
      newErrors.experience = 'Experience is required';
    } else {
      delete newErrors.experience; // Clear the error message if experience is filled
    }
 
    if (!qualification) {
      newErrors.qualification = 'Qualification is required';
    } else {
      delete newErrors.qualification; // Clear the error message if qualification is filled
    }
 
    if (!specialization) {
      newErrors.specialization = 'Specialization is required';
    } else {
      delete newErrors.specialization; // Clear the error message if specialization is filled
    }
 
    if (preferredJobLocations.length === 0) {
      newErrors.city = 'City is required';
    } else {
      delete newErrors.city; // Clear the error message if city is filled
    }
 
    if (skillsRequired.length === 0) {
      newErrors.skills = 'Skills are required';
    } else {
      delete newErrors.skills; // Clear the error message if skills are filled
    }
 
    if (!applicant.name && (!fullName || !fullName.trim())) {
      newErrors.name = 'Name is required';
    } else {
      delete newErrors.name; // Clear the error message if name is filled or pre-filled
    }
 
    // Add a condition to skip validation if mobileNumber is pre-filled
    if (!applicant.mobilenumber && !mobilenumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else {
      delete newErrors.mobileNumber; // Clear the error message if mobileNumber is filled or pre-filled
    }
 
    setErrors(newErrors);
 
    return Object.keys(newErrors).length === 0;
  };
 
 
 
    const handleQualificationChange = (e) => {
    const selectedQualification = e.target.value;
    setQualification(selectedQualification);
    setSpecialization('');
    clearError('qualification');
    clearError('specialization');
   
  };
 
  const handleCityChange = (selected) => {
    setSelectedCities(selected);
    if (selected.length > 0) {
      setCityError('');
    } else {
      setCityError('Please select at least one city.');
    }
  };
 
  const clearError = (fieldName) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: '',
    }));
  };
 
  // const handleChange2 = (e) => {
  //   // setFullName(e.target.value);
  //   setApplicant({...applicant,name: e.target.value});
  //   clearError('fullName'); // Clear the error message for fullName
  // };
 
  const handleChange2 = (e) => {
    setFullName(e.target.value);
    setApplicant({...applicant,name: e.target.value});
    clearError('name'); // Clear the error message for name
  };
 
  const handleChange3 = (e) => {
    setMobileNumber(e.target.value);
    clearError('mobileNumber'); // Clear the error message for mobileNumber
  };
 
 
 
  const specializationsByQualification = {
    'B.Tech': ['Computer Science and Engineering (CSE)',
                'Electronics and Communication Engineering (ECE)',
                'Electrical and Electronics Engineering (EEE)',
                'Mechanical Engineering (ME)',
                'Civil Engineering (CE)',
                'Aerospace Engineering',
                'Information Technology(IT)',
                 'Chemical Engineering',
                 'Biotechnology Engineering'],
    'MCA': ['Software Engineering', 'Data Science','Artificial Intelligence','Machine Learning','Information Security',
             'Cloud Computing','Mobile Application Development','Web Development','Database Management','Network Administration',
            'Cyber Security','IT Project Management'],
    'Degree': ['Bachelor of Science (B.Sc) Physics','Bachelor of Science (B.Sc) Mathematics','Bachelor of Science (B.Sc) Statistics',
               'Bachelor of Science (B.Sc) Computer Science','Bachelor of Science (B.Sc) Electronics','Bachelor of Science (B.Sc) Chemistry',
               'Bachelor of Commerce (B.Com)'],
    'Intermediate': ['MPC','BiPC','CEC','HEC'],
    'Diploma': ['Mechanical Engineering','Civil Engineering','Electrical Engineering','Electronics and Communication Engineering',
                'Computer Engineering','Automobile Engineering','Chemical Engineering','Information Technology','Instrumentation Engineering',
                 'Mining Engineering','Metallurgical Engineering','Agricultural Engineering','Textile Technology','Architecture',
                  'Interior Designing','Fashion Designing','Hotel Management and Catering Technology','Pharmacy','Medical Laboratory Technology',
                 'Radiology and Imaging Technology'],          
   
  };
 
  const cities = [
    'Chennai',
    'Thiruvananthapuram',
    'Bangalore',
    'Hyderabad',
    'Coimbatore',
    'Kochi',
    'Madurai',
    'Mysore',
    'Thanjavur',
    'Pondicherry',
    'Vijayawada',
  ];
 
 
 
  // Assuming skillsOptions is an array of skill names
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
      setSkillsError('');
    } else {
      setSkillsError('Please select at least one skill.');
    }
  };
 
  const citiesOptionsWithStructure = cities.map((city) => ({ city }));
 
  const filterOutSelectedSkills = (options, selectedSkills) => {
    const selectedSkillNames = selectedSkills.map((skill) => skill.skillName.toLowerCase());
    return options.filter((option) => !selectedSkillNames.includes(option.skillName.toLowerCase()));
  };
 
  const filterOutSelectedCities = (allCities = [], selectedCities = []) => {
    const selectedCityNames = new Set(selectedCities.map((city) => city.city?.toLowerCase()));
    return allCities.filter((city) => !selectedCityNames.has(city.city.toLowerCase()));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isFormValid = validateForm();
 
    if (!isFormValid) {
      return;
    }
 
    const formattedSkillsRequired = skillsRequired.map((skill) => ({
      skillName: skill.skillName.toLowerCase(),
    }));
 
    const profileFormData = {
      experience,
      qualification,
      specialization,
      preferredJobLocations: preferredJobLocations.map((location) => location.city),
      skillsRequired: formattedSkillsRequired,
    };
 
    const userFormData = {
      name: applicant.name,
      mobilenumber,
    };
 
    try {
      const jwtToken = localStorage.getItem('jwtToken');
     
        // Use PUT API if profile exists
        const putResponse = await axios.put(`${apiUrl}/applicant/editApplicant/${user.id}`,
          userFormData,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
 
        console.log('PUT API Response for User Data:', putResponse.data);
 
        // Now update the details in the applicant_profile table
        const putProfileResponse = await axios.post(`${apiUrl}/applicantprofile/createprofile/${user.id}`,
          profileFormData,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
 
        console.log('POST API Response for Profile Data:', putProfileResponse.data);
     
 
      window.alert('Profile saved successfully!');
      await new Promise((resolve) => setTimeout(resolve, 1000));
 
      setExperience('');
      setSkills([]);
      setCity('');
      setState('');
      setQualification('');
      setPassingYear('');
      setResume(null);
      setFullName(null);
      setMobileNumber(null);
      setEmail(null);
      setPhone('');
      setSpecialization('');
      setSelectedCity([]);
      setSelectedCities([]);
      setCityError('');
      setSelectedSkills([]);
      setSkillsError('');
      setLoading(true);
 
      navigate('/applicant-find-jobs');
    } catch (error) {
      console.error('Error submitting form data:', error);
    }
  };
  useEffect(() => {    
    const fetchData = async () => {
        try {
          const jwtToken = localStorage.getItem('jwtToken');
      console.log('jwt token new', jwtToken);
      const response = await axios.get(`${apiUrl}/applicantprofile/${user.id}/profile-view`, {      
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
          setApplicant(response.data.applicant);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user profile data:', error);
          setLoading(false);
        }
      };
      fetchData();    
    }, []);
 
    const handleChange = (selectedCities) => {
      setPreferredJobLocations(selectedCities);
      setErrors({}); // Reset errors when there is a change in selection
    };
 
    const filteredOptions = cities.filter(city => !preferredJobLocations.includes(city));
 
   
      const handleChange1 = (selectedSkills) => {
        setSkillsRequired(selectedSkills);
        setErrors({}); // Reset errors when there is a change in selection
      };
   
      // Filter out selected skills from the options
      const filteredOptions1 = skillsOptions.filter(skill => !skillsRequired.includes(skill));
   
 
 
  return (
   
    <div>
      {loading && (
      <div className="loading-spinner">
        <ClipLoader color="#1967d2" size={50} />
      </div>
    )}
       <div className="dashboard__content">
  <section className="page-title-dashboard">
    <div className="themes-container">
      <div className="row">
        <div className="col-lg-12 col-md-12 ">
          <div className="title-dashboard">
            <div className="title-dash flex2">Profile Details</div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <form onSubmit={handleSubmit}>
  <section className="flat-dashboard-post flat-dashboard-setting">
 
    <div className="themes-container">
      <div className="row">
 
        <div className="col-lg-12 col-md-12 ">
          <div className="post-new profile-setting bg-white">
 
            <div className="row">
            <div className="col-lg-6 col-md-12">
                <div id="item_7" className="dropdown titles-dropdown info-wd">
                  <input
                    type="text"
                    placeholder="*Full Name"
                    value={applicant.name}
                    className="input-form"
                    onChange={(e) => handleChange2(e)}
                    // onChange={(e) =>setApplicant({...applicant,name: e.target.value,})}
                    style={{ color: fullName ? 'black' : 'black' }}
                   
                  />
                   {errors.name && (
      <div className="error-message">{errors.name}</div>
    )}
                </div>
              </div>
              <div className="col-lg-6 col-md-12">
                <div id="item_8" className="dropdown titles-dropdown info-wd">
                  {/* <label className="title-user fw-7">
                    Email<span className="color-red">*</span>
                  </label> */}
                  <input
                    type="text"
                    placeholder="*Email"
                    value={applicant.email}
                    className="input-form"
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ color: email ? 'black' : 'black' }}
                   
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </div>
              </div>
              <div className="col-lg-6 col-md-12">
      <div id="item_8" className="dropdown titles-dropdown info-wd">
        {/* <label className="title-user fw-7">
          WhatsApp Number<span className="color-red">*</span>
        </label> */}
     
          {/* <div style={{ marginRight: '10px' }}>
          <PhoneInput
  placeholder="*Email"
  inputProps={{
    className: 'input-form',
    style: {
      width: '485px',
      height: '50px',
      borderRadius: '1px',
    },
  }}
  defaultCountry="ua"
  value={applicant.mobilenumber}
  onChange={(phone) => setPhone(phone.number)}  // Use phone.number to get the numeric value
  dropdownStyle={{
    height: '400px',
  }}
/>
          </div> */}
          <input
            type="tel"
            placeholder="WhatsApp"
            value={applicant.mobilenumber}
            className="input-form"
            // onChange={(e) => setMobileNumber(e.target.value)}
            onChange={(e) => handleChange3(e)}
            style={{ color: mobilenumber ? 'black' : 'black' }}
           
          />
            {errors.mobileNumber && (
        <div className="error-message">{errors.mobileNumber}</div>
      )}
        </div>
       
      </div>
   
          <div className="col-lg-6 col-md-12">
          <div id="item_1" className="dropdown titles-dropdown info-wd">
  <select
    value={experience}
    className="input-form"
    onChange={(e) => setExperience(e.target.value)}
    style={{ color: experience ? 'black' : 'lightgrey' }}
  >
    <option value="" disabled>*Experience</option>
    {yearsOptions.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>
  {!experience && errors.experience && (
    <div className="error-message">{errors.experience}</div>
  )}
</div>
 
 
              </div>
              <div className="col-lg-6 col-md-12">
              <div id="item_4" className="dropdown titles-dropdown info-wd">
  <select
    value={qualification}
    className="input-form"
    onChange={handleQualificationChange}
    style={{ color: qualification ? 'black' : 'lightgrey' }}
  >
    <option value="" disabled>*Qualification</option>
    {qualificationsOptions.map((qual) => (
      <option key={qual} value={qual}>
        {qual}
      </option>
    ))}
  </select>
  {!qualification && errors.qualification && (
    <div className="error-message">{errors.qualification}</div>
  )}
</div>
 
      </div>
      <div className="col-lg-6 col-md-12">
      <div id="item_4" className="dropdown titles-dropdown info-wd">
  <select
    value={specialization}
    className="input-form"
    onChange={(e) => setSpecialization(e.target.value)}
    style={{ color: specialization ? 'black' : 'lightgrey' }}
    disabled={!qualification} // Disable if no qualification selected
  >
    <option value="" disabled>*Specialization</option>
    {specializationsByQualification[qualification]?.map((spec) => (
      <option key={spec} value={spec}>
        {spec}
      </option>
    ))}
  </select>
  {!specialization && errors.specialization && (
    <div className="error-message">{errors.specialization}</div>
  )}
</div>
 
      </div>
  <div className="col-lg-6 col-md-12">
  <div id="item_3" className="dropdown titles-dropdown info-wd">
  <Typeahead
  id="cityTypeahead"
  labelKey={(option) => option.city}
  multiple
  placeholder="*Preferred Job Location(s)"
  options={filterOutSelectedCities(citiesOptionsWithStructure, preferredJobLocations)}
  onChange={(selectedCities) => setPreferredJobLocations(selectedCities)}
  selected={preferredJobLocations}
  inputProps={{
    className: 'input-form',
  }}
  allowNew={false} // Prevent new entries
  filterBy={(option, props) =>
    option.city.toLowerCase().startsWith(props.text.toLowerCase())
  }
/>
 
  {preferredJobLocations.length === 0 && errors.city && (
    <div className="error-message">{errors.city}</div>
  )}
</div>
 
 
 
    </div>  
    <div className="col-lg-6 col-md-12">
    <div id="item_2" className="dropdown titles-dropdown info-wd">
    <Typeahead
  id="skillsTypeahead"
  labelKey={(option) => option.skillName}
  multiple
  placeholder="*Skills"
  options={filterOutSelectedSkills(skillsOptionsWithStructure, skillsRequired)}
  onChange={(selectedSkills) => handleSkillsChange(selectedSkills)}
  selected={skillsRequired}
  inputProps={{
    className: 'input-form',
  }}
  allowNew={false} // Prevent new entries
  filterBy={(option, props) =>
    option.skillName.toLowerCase().startsWith(props.text.toLowerCase())
  }
/>
      {skillsRequired.length === 0 && errors.skills && (
        <div className="error-message">{errors.skills}</div>
      )}
    </div>
 
</div>            
              </div>
            <div className="form-infor flex flat-form">
              <div className="info-box info-wd">
             </div>
            </div>
            <div className="form-group">
            <button type="submit" className='button-status'>Submit</button>
              </div>
          </div>
        </div>
      </div>
    </div>
 
  </section>
  </form>
</div>
</div>
  )
};
 
export default ApplicantBasicDetails;