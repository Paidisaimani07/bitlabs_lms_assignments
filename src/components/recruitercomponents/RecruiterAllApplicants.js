import React, { useState, useEffect, useRef } from 'react';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import Snackbar from '../common/Snackbar';
import BackButton from '../common/BackButton';
import filtericon from '../../images/filter 2.svg';
import verified123 from '../../images/verified123.svg';
import arrowleft from '../../images/arrow-left.svg';
import { Typeahead } from 'react-bootstrap-typeahead';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSlidersH } from '@fortawesome/free-solid-svg-icons';
import "./RecruiterManageColumn.css"

$.DataTable = require('datatables.net')

 
function RecruiterAllApplicants() {
  const [applicants, setApplicants] = useState([]);
  const { user } = useUserContext();
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedMenuOption, setSelectedMenuOption] = useState('All');
  const isMounted = useRef(true);
  const [search, setSearch] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const tableref=useRef(null);
  const filterRef = useRef([]);
  const [urlParams, setUrlParams] = useState('');
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [mobileNumber, setMobileNumber] = useState(null);
  const [jobTitle, setJobTitle] = useState(null);
  const [applicantStatus, setApplicantStatus] = useState(null);
  const [skillName, setSkillName] = useState(null);
  const [minimumExperience, setMinimumExperience] = useState(0);
  const [location, setLocation] = useState(null);
  const [minimumQualification, setMinimumQualification] = useState(null);
  const [specialization, setspecialization] = useState(null);
  const [preScreenedCondition, setPreScreenedCondition] = useState(null);
  const [apptitudeScore, setapptitudeScore] = useState(null);
  const [technicalScore, settechnicalScore] = useState(null);
  const [matchPercentage, setmatchPercentage] = useState(null);
  const [matchedSkills, setmatchedSkills] = useState(null);
  const [count, setCount] = useState(0);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [initialData, setInitialData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [availableNameSuggestions, setAvailableNameSuggestions] = useState([]);
  const [availableEmailSuggestions, setAvailableEmailSuggestions] = useState([]);
  const [availableMobileSuggestions, setAvailableMobileSuggestions] = useState([]);
  const [availableJobTitleSuggestions, setAvailableJobTitleSuggestions] = useState([]);
  const [availableStatusSuggestions, setAvailableStatusSuggestions] = useState([]);
  const [availableExpSuggestions, setAvailableExpSuggestions] = useState([]);
  const [availableQualSuggestions, setAvailableQualSuggestions] = useState([]);
  const [availableSpecSuggestions, setAvailableSpecSuggestions] = useState([]);
  const [availablePreSuggestions, setAvailablePreSuggestions] = useState([]);
  const [availableAptiSuggestions, setAvailableAptiSuggestions] = useState([]);
  const [availableTeciSuggestions, setAvailableTeciSuggestions] = useState([]);
  const [availableJobMatchSuggestions, setAvailableJobMatchSuggestions] = useState([]);
  const [availableMatchSkillSuggestions, setAvailableMatchSkillSuggestions] = useState([]);
  // Convert these into objects with label and value
const validJobMatchSuggestions = availableJobMatchSuggestions
.filter(score => score != null) // Filter out null and undefined values
.map(score => ({
  label: score.toString(),  // Convert number to string for display
  value: score
}));


// Convert these into objects with label and value
const validAptiSuggestions = availableAptiSuggestions
  .filter(score => score != null) // Filter out null and undefined values
  .map(score => ({
    label: score.toString(),  // Convert number to string for display
    value: score
  }));
  const [showError, setShowError] = useState(false);

  // Convert these into objects with label and value
const validTeciSuggestions = availableTeciSuggestions
.filter(score => score != null) // Filter out null and undefined values
.map(score => ({
  label: score.toString(),  // Convert number to string for display
  value: score
}));


 
const [selectedCheckboxes, setSelectedCheckboxes] = useState({
  Experience:false,
  Qualification:false,
  "Location":false,
  Speclization: false,
  "Apptitude Score": false,
  "Technical Score": false,
  "Matching Skills":false,
  "Missing Skills":false,
  "Additional Skills":false,
  "Tested Skills":false,
  "Job Match%":false
});

const [errorMessage, setErrorMessage] = useState('');

const [selectedColumns, setSelectedColumns] = useState([]);

const toggleSidebar = () => {
  setIsOpen(!isOpen);
};

const handleCheckboxs = (event) => {
  const { name, checked } = event.target;
  setSelectedCheckboxes((prev) => ({ ...prev, [name]: checked }));
};

const handleApply = () => {
  const selected = Object.keys(selectedCheckboxes).filter((key) => selectedCheckboxes[key]);
  if(selected.length===0){
    setErrorMessage('Please select at least one column.')
    return;
  }
  else {
    setErrorMessage('');
    // alert('Selected Columns: ' + selected.join(', '));
    setSelectedColumns(selected);
    // reset();
    toggleSidebar();
  }
};


const reset = () => {
  setSelectedCheckboxes({
  Experience:false,
  Qualification:false,
  "Location":false,
  Speclization: false,
  "Apptitude Score": false,
  "Technical Score": false,
  "Matching Skills":false,
  "Missing Skills":false,
  "Additional Skills":false,
  "Tested Skills":false,
  "Job Match%":false
  });
  setSelectedColumns([]);
  setErrorMessage('');
  toggleSidebar();
};
 
  const handleCheckboxChange2 = (applyjobid) => {
    setSelectedApplicants((prevSelected) => {
      if (prevSelected.includes(applyjobid)) {
        // If the ID is already in the array, remove it (uncheck the box)
        return prevSelected.filter((id) => id !== applyjobid);
      } else {
        // If the ID is not in the array, add it (check the box)
        return [...prevSelected, applyjobid];
      }
    });
  };
  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      const allIds = applicants.map(application => application.applyjobid);
      setSelectedApplicants(allIds);
    } else {
      setSelectedApplicants([]);
    }
  };
 
 
  const [filterOptions, setFilterOptions] = useState({
    nameFilter: false,
    emailFilter: false,
    mobileFilter: false,
    jobFilter: false,
    statusFilter: false,
    skillFilter: false,
    experienceFilter: false,
    locationFilter: false,
    minimumQualification: false,
    specialization: false,
    preScreenedCondition: false,
    apptitudeScore: false,
    technicalScore: false,
    matchPercentage: false,
    matchedSkills: false
 
  });
 
  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: '' });
    window.location.reload();
  };
 
  const handleCheckboxChange = (event) => {
    const { id, checked } = event.target;
    setFilterOptions(prevState => ({
      ...prevState,
      [id]: checked ? 'is' : null
    }));
  };
  const resetFilter = () => {
 
  window.location.reload();
};
const applyFilter = () => {
  // Apply all filters on the frontend based on the selected options

  // Check if at least one filter is selected
  const isAnyFilterSelected = Object.values(filterOptions).some((filter) => filter);

  if (!isAnyFilterSelected) {
    // Show error message if no filter is selected
    setShowError(true);
  } else {
    // Apply filter logic here
    setShowError(false);
    // Your filter application logic
  }


  const filteredData = initialData.filter((applicant) => {
      
    return (
      (name === "" || applyMatchType(applicant.name, name, filterOptions.nameFilter)) &&
      (email === "" || applyMatchType(applicant.email, email, filterOptions.emailFilter)) &&
      (mobileNumber === "" || applyMatchType(applicant.mobilenumber, mobileNumber, filterOptions.mobileFilter)) &&
      (jobTitle === "" || applyMatchType(applicant.jobTitle, jobTitle, filterOptions.jobFilter)) &&
      (applicantStatus === "" || applyMatchType(applicant.applicantStatus, applicantStatus, filterOptions.statusFilter)) &&
      (skillName === "" || applyMatchType(applicant.skillName, skillName, filterOptions.skillFilter)) &&
      (location === "" || applyMatchType(applicant.location, location, filterOptions.locationFilter)) &&
      (minimumExperience === null || applyExperienceMatchType(applicant.experience, minimumExperience, filterOptions.experienceFilter)) &&
      (minimumQualification === "" || applyMatchType(applicant.minimumQualification, minimumQualification, filterOptions.minimumQualification))&&
      (specialization === "" || applyMatchType(applicant.specialization, specialization, filterOptions.specialization))&&
      (preScreenedCondition === "" || applyMatchType(applicant.preScreenedCondition, preScreenedCondition, filterOptions.preScreenedCondition))&&
      (apptitudeScore === "" || applyScoreMatchType(applicant.apptitudeScore, apptitudeScore, filterOptions.apptitudeScore))&&
      (technicalScore === "" || applyScoreMatchType(applicant.technicalScore, technicalScore, filterOptions.technicalScore))&&
      (technicalScore === "" || applyScoreMatchType(applicant.matchPercentage, matchPercentage, filterOptions.matchPercentage))
      
    );
  });

  // Update the DataTable with filtered data
  const $table = window.$(tableref.current);
  $table.DataTable().clear().destroy();
  
  $table.DataTable({
    responsive: true,
    searching: false, 
    lengthChange: false,
    info: false,
    data: filteredData,
    columns: [
      {
        data: null,
        render: function(data, type, row) {
          return '<input type="checkbox" value="' + row.applyjobid + '" ' +
            (selectedApplicant && selectedApplicant.applyjobid === row.applyjobid ? 'checked' : '') +
            ' onChange="handleRadioChange(' + JSON.stringify(row) + ')" name="applicantRadio"/>';
        }
      },
      {
        data: 'name',
        render: function(data, type, row) {
          return '<a href="/viewapplicant/' + row.id + '" style="color: #0583D2; text-decoration: none;">' + data + '</a>';
        }
      },
      {
        data: 'email',
        render: function(data, type, row) {
          return '<a href="/viewapplicant/' + row.id + '" style="color: #0583D2; text-decoration: none;">' + data + '</a>';
        }
      },
      {
        data: 'mobilenumber',
        render: function(data, type, row) {
          return '<a href="/viewapplicant/' + row.id + '" style="color: #0583D2; text-decoration: none;">' + data + '</a>';
        }
      },
      { data: 'jobTitle' },
      { data: 'applicantStatus' },
      
      {
        data: null,
        render: function(data, type, row) {
          return '<a href="/view-resume/' + row.id + '" style="color: blue;">View Resume</a>';
        }
      },
      { data: 'experience' },
      { data: 'minimumQualification' },
     
            { // Preferred Job Locations - custom logic
                data: 'preferredJobLocations',
                render: function(data, type, row) {
                    return data.length > 3 ? data.slice(0, 3).join(", ") + " +" : data.join(", ");
                }
            },
            { data: 'specialization' }, // Maps to {application.specialization}
            { data: 'apptitudeScore' }, // Maps to {application.apptitudeScore}
            { data: 'technicalScore' }, // Maps to {application.technicalScore}
            { data: 'preScreenedCondition' }, // Maps to {application.preScreenedCondition}
            { // Matched Skills - custom logic
                data: 'matchedSkills',
                render: function(data, type, row) {
                    return data.length > 3 ? data.slice(0, 3).map(skill => skill.skillName).join(", ") + " +" : data.map(skill => skill.skillName).join(", ");
                }
            },
            { // Non-Matched Skills - custom logic
                data: 'nonMatchedSkills',
                render: function(data, type, row) {
                    return data.length > 3 ? data.slice(0, 3).map(skill => skill.skillName).join(", ") + " +" : data.map(skill => skill.skillName).join(", ");
                }
            },
            { // Additional Skills - custom logic
                data: 'additionalSkills',
                render: function(data, type, row) {
                    return data.length > 3 ? data.slice(0, 3).map(skill => skill.skillName).join(", ") + " +" : data.map(skill => skill.skillName).join(", ");
                }
            },
            { // Applicant Skill Badges - custom logic
                data: 'applicantSkillBadges',
                render: function(data, type, row) {
                    if (data && data.length > 3) {
                        return data.slice(0, 3).map(skill => skill.skillBadge.name).join(", ") + " +";
                    } else if (data) {
                        return data.map(skill => skill.skillBadge.name).join(", ");
                    } else {
                        return "No skills available";
                    }
                }
            },
            { data: 'matchPercentage', render: function(data, type, row) { return data + "%"; } } // Maps to {application.matchPercentage}%
       
    ]
  });

  setCount(filteredData.length);
};

const applyMatchType = (value, filterValue, matchType) => {
  // Ensure value and filterValue are both strings
  const normalizedValue = value ? value.toString().toLowerCase() : '';
  const normalizedFilterValue = filterValue ? filterValue.toString().toLowerCase() : '';

  if (!matchType || !filterValue) return true;

  if (matchType === "contains") {
    return normalizedValue.includes(normalizedFilterValue);
  } else if (matchType === "is") {
    return normalizedValue === normalizedFilterValue;
  }
  
  return true;
};

const applyExperienceMatchType = (experience, filterValue, matchType) => {
  if (!matchType || filterValue === null) return true;
  
  const exp = parseInt(experience.trim(), 10);
  
  if (matchType === "greaterThan") {
    return exp > filterValue;
  } else if (matchType === "lessThan") {
    return exp < filterValue;
  } else if (matchType === "is") {
    return exp === filterValue;
  }
  return true;
};

const applyScoreMatchType = (score, filterValue, matchType) => {
  
  // If matchType is not defined or filterValue or score is null, return true
  if (!matchType || filterValue === null) return true;

  // Convert score to an integer
  const parsedScore = typeof score === 'string' ? parseInt(score.trim(), 10) : Math.round(score);


  let parsedFilterValue; 
  if (Array.isArray(filterValue) && filterValue.length > 0) {
    parsedFilterValue = filterValue[0].value; // Get the value from the first object
  }else{
  parsedFilterValue = typeof filterValue === 'string'
  ? parseInt(filterValue.trim(), 10)  // Convert string to integer
  : Math.round(filterValue);           // Round if it's a number
}

if (isNaN(parsedFilterValue)) {return false;}

  // Comparison logic based on matchType
  if (matchType === "greaterThan") {
      return parsedScore > parsedFilterValue;
  } else if (matchType === "lessThan") {
      return parsedScore < parsedFilterValue;
  } else if (matchType === "is") {
      return parsedScore === parsedFilterValue;
  }
  
  return true; 
};



 
const handleTextFieldChange = (id, value) => {
  // const { id, value } = e.target;
  switch (id) {
    case "name":
      setName(value);
      break;
    case "email":
      setEmail(value);
      break;
    case "mobileNumber":
      setMobileNumber(value);
      break;
    case "jobTitle":
      setJobTitle(value);
      break;
    case "applicantStatus":
      setApplicantStatus(value);
      break;
    case "skillName":
      setSkillName(value);
      break;
    case "minimumExperience":
      setMinimumExperience(value);
      break;
    case "location":
      setLocation(value);
      break;
    case "minimumQualificationInput":
      setMinimumQualification(value);
      break;
    case "specializationInput":
      setspecialization(value);
      break;
    case "preScreenedConditionInput":
      setPreScreenedCondition(value);
      break;
    case "apptitudeScoreInput":
      setapptitudeScore(value);
      break;
    case "technicalScoreInput":
      settechnicalScore(value);
      break;
    case "matchPercentageInput":
      setmatchPercentage(value);
      break;
    case "matchedSkillsInput":
      setmatchedSkills(value);
      break;
                
              
    default:
      break;
  }
};
 
 
 
 
  const handleFilterChange = (event) => {
    const { name, checked, value } = event.target;
    const updatedFilters = [...selectedFilter];
 
    if (checked) {
      updatedFilters.push({ name, value });
    } else {
      const index = updatedFilters.findIndex((filter) => filter.name === name);
      if (index !== -1) {
        updatedFilters.splice(index, 1);
      }
    }
 
    setSelectedFilter(updatedFilters);
 
   
    const filteredApplicants = applicants.filter((applicant) => {
      return updatedFilters.every((filter) => {
       
      });
    });
 
   
    setApplicants(filteredApplicants);
  };
  useEffect(() => {
    filterRef.current.forEach((checkbox) => {
      checkbox.addEventListener('change', handleFilterChange);
    });
 
    return () => {
   
      filterRef.current.forEach((checkbox) => {
        checkbox.removeEventListener('change', handleFilterChange);
      });
    };
  }, [selectedFilter]);
  const fetchAllApplicants = async () => {
    try {
      const response = await axios.get(`${apiUrl}/applyjob/recruiter/${user.id}/appliedapplicants`);
    const applicantsArray = Object.values(response.data).flat();
    setCount(applicantsArray.length);
    setApplicants(applicantsArray);
    setInitialData(applicantsArray);  // Store initial data
    // Extract names from applicants and update availableSuggestions
     // Update all suggestion arrays based on the applicants' data
     setAvailableNameSuggestions(applicantsArray.map(applicant => applicant.name));
     setAvailableEmailSuggestions(applicantsArray.map(applicant => applicant.email));
     setAvailableMobileSuggestions(applicantsArray.map(applicant => applicant.mobilenumber));
     setAvailableJobTitleSuggestions(applicantsArray.map(applicant => applicant.jobTitle));
     setAvailableStatusSuggestions(applicantsArray.map(applicant => applicant.applicantStatus));
     setAvailableExpSuggestions(applicantsArray.map(applicant => applicant.experience));
     setAvailableQualSuggestions(applicantsArray.map(applicant => applicant.minimumQualification));
     setAvailableSpecSuggestions(applicantsArray.map(applicant => applicant.specialization));
     setAvailablePreSuggestions(applicantsArray.map(applicant => applicant.preScreenedCondition));
     setAvailableAptiSuggestions(applicantsArray.map(applicant => applicant.apptitudeScore));
     setAvailableTeciSuggestions(applicantsArray.map(applicant => applicant.technicalScore));
     setAvailableJobMatchSuggestions(applicantsArray.map(applicant => applicant.matchPercentage));
     setAvailableMatchSkillSuggestions(applicantsArray.map(applicant => applicant.matchedSkills.skillName));
        const $table= window.$(tableref.current);
          const timeoutId = setTimeout(() => {  
           $table.DataTable().destroy();
            $table.DataTable({responsive:true, searching: false, lengthChange: false, "info": false});
                  }, 500);
         return () => {
            isMounted.current = false;
         };
    } catch (error) {
      console.error('Error fetching applicants:', error);
    }
  };
 
  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    }
    fetchAllApplicants();
  }, [user.id]);
 
  const handleSelectChange1 = (e) => {
    
    const { id, value } = e.target;
  
    switch (id) {
      case "nameFilterSelect":
        setFilterOptions(prevState => ({
          ...prevState,
          nameFilter: value
        }));
       
        break;
      case "emailFilterSelect":
        setFilterOptions(prevState => ({
          ...prevState,
          emailFilter: value
        }));
        break;
      case "mobileFilterSelect":
        setFilterOptions(prevState => ({
          ...prevState,
          mobileFilter: value
        }));
        break;
      case "jobFilterSelect":
        setFilterOptions(prevState => ({
          ...prevState,
          jobFilter: value
        }));
        break;
      case "statusFilterSelect":
        setFilterOptions(prevState => ({
          ...prevState,
          statusFilter: value
        }));
        break;
      case "skillFilterSelect":
        setFilterOptions(prevState => ({
          ...prevState,
          skillFilter: value
        }));
        break;
      case "experienceFilterSelect":
        setFilterOptions(prevState => ({
          ...prevState,
          experienceFilter: value
        }));
        break;
      case "locationFilterSelect":
        setFilterOptions(prevState => ({
          ...prevState,
          locationFilter: value
        }));
        break;
        case "minimumQualificationSelect":
          setFilterOptions(prevState => ({
            ...prevState,
            minimumQualification: value
          }));
          break;
          case "specializationSelect":
            setFilterOptions(prevState => ({
              ...prevState,
              specialization: value
            }));
            break; 
            case "preScreenedConditionSelect":
              setFilterOptions(prevState => ({
                ...prevState,
                preScreenedCondition: value
              }));
              break; 
              case "apptitudeScoreFilterSelect":
                setFilterOptions(prevState => ({
                  ...prevState,
                  apptitudeScore: value
                }));
                break; 
                case "technicalScoreFilterSelect":
                  setFilterOptions(prevState => ({
                    ...prevState,
                    technicalScore: value
                  }));
                  break;  
                  case "matchPercentageFilterSelect":
                    setFilterOptions(prevState => ({
                      ...prevState,
                      matchPercentage: value
                    }));
                    break;
                    case "matchedSkillsFilterSelect":
                      setFilterOptions(prevState => ({
                        ...prevState,
                        matchedSkills: value
                      }));
                      break;
                     
                      
      default:
        break;
    }
  };
const handleSelectChange = async (e) => {
  const newStatus = e.target.value;
 
  try {
    if (selectedApplicants.length > 0 && newStatus) {
      console.log("Selected Applicants:", selectedApplicants);
      const updatePromises = selectedApplicants.map(async (selectedApplicant) => {
        const applyJobId = selectedApplicant;
        console.log("Apply Job ID:", applyJobId);
        if (!applyJobId) {
          console.error("applyjobid is undefined or null for:", selectedApplicant);
          return null;
        }
 
        const response = await axios.put(
          `${apiUrl}/applyjob/recruiters/applyjob-update-status/${applyJobId}/${newStatus}`
        );
        return { applyJobId, newStatus };
      });
 
      const updatedResults = await Promise.all(updatePromises);
 
      const filteredResults = updatedResults.filter(result => result !== null);
     
      if (isMounted.current) {
        const updatedApplicants = applicants.map((application) => {
          const updatedResult = filteredResults.find(result => result.applyJobId === application.applyjobid);
          if (updatedResult) {
            return { ...application, applicantStatus: updatedResult.newStatus };
          }
          return application;
        });
        setApplicants(updatedApplicants);
        setSelectedStatus(newStatus);
        setSelectedApplicants([]);
      }
     
     
      const message1 = `Status changed to <b>${newStatus}</b> for ${selectedApplicants.length} applicants`;
      setSnackbar({ open: true, message: message1, type: 'success' });
     
    }
  } catch (error) {
    console.error('Error updating status:', error);
  }
};
 
 
const exportCSV = () => {
  const headers = [
    'Name',
    'Email',
    'Mobile Number',
    'Job Title',
    'Applicant Status',
    ...selectedColumns,
    'Resume'
  ];
 
  const capitalizedHeaders = headers.map(header => header.toUpperCase());
 
  const escapeCSVField = (field) => {
    if (field.trim() === '') {
      return ' ';
    }
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };
 
  let allData = Array.from(tableref.current.querySelectorAll('tbody tr')).map(tr => {
    const rowData = Array.from(tr.children).map((td, index) => {
      const cellContent = escapeCSVField(td.textContent);
 
      if (index === 3) {
        return `'${cellContent}`;
      }
 
      if (index === headers.length) {
        const resumeLink = td.querySelector('a')?.href;
        return resumeLink ? `"=HYPERLINK(""${resumeLink}"", ""View Resume"")"` : 'N/A';
      }
 
      return cellContent;
    });
 
    return rowData.slice(1);
  });
 
  const selectedData = selectedApplicants.length > 0
    ? allData.filter((row, index) => selectedApplicants.includes(applicants[index].applyjobid))
    : allData;
 
  selectedData.unshift(capitalizedHeaders);
 
  const csvContent = selectedData.map(row => row.join(',')).join('\n');
 
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'applicants.csv';
 
  link.click();
};
   
 
   
    return (
      <div className="dashboard__content">
        <section className="page-title-dashboard">
          <div className="themes-container">
            <div className="row">
              <div className="col-lg-9 col-md-9">
                <div className="title-dashboard">
                  
                  
                  <div className="title-dash flex2"><BackButton />All Applicants : <h5 className="title-dash flex2"> {count}</h5>
                 
                  </div>
                    {/* Filter icon button */}
                    <button
                    className="filter-icon-button"
                    onClick={() => setShowFilters(!showFilters)}
                    style={{ 
                      color: '#0A58CA', 
                      backgroundColor: 'transparent', 
                      border: 'none', 
                      cursor: 'pointer',
                      textDecoration: 'underline',  /* Adds underline to the text */
                      display: 'flex', 
                      position: 'absolute', 
                      alignItems: 'center',
                      paddingTop: '10px',
                      
                    }}
                  >
                    Filters
                    <img src={filtericon} className="external-link-image" style={{ marginLeft: '1px', height: '20px' }} />
                  </button>
                  <div className="row">
                    <div className="col-lg-12 col-md-12" style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft:'900px' }}>
                      <div className="controls" style={{ display: 'flex', gap: '10px' }}>
                        <button className="export-buttonn" onClick={exportCSV}>
                          ExportCSV
                        </button>
                        <select className="status-select" value={selectedStatus} onChange={handleSelectChange}>
                          <option value="" disabled>
                            Change Status
                          </option>
                          <option value="Screening">Screening</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              
            </div>
          </div>
        </section>
 
      

      <div className={`filter-menu ${showFilters ? 'show' : ''}`}>
      
        <div className="table-container">
        
              <h3 className="filter">
              
              <span
            style={{ cursor: 'pointer', marginRight: '16px', marginLeft: '-40px', position: 'relative'
            }} // Add pointer cursor for the arrow
            onClick={() => setShowFilters(!showFilters)} // Toggle filters visibility
          >
            <img src={arrowleft} style={{ height: '40px', width:'24px', marginTop: '7px' }} />
            </span>
             Filters </h3>
                
                {/* Filter section */}
                <div className="filter-option">
  <div className="checkbox-label">
    <input
      type="checkbox"
      id="nameFilter"
      checked={filterOptions.nameFilter}
      onChange={handleCheckboxChange}
      style={{ width: 'auto' }} 
    />
    <label className="label" htmlFor="nameFilter">Name</label>
  </div>
  {filterOptions.nameFilter && (
    <div className="filter-details">
      <div className="popup">
        <div className="dropdown-container1">
          <select
            id="nameFilterSelect"
            value={filterOptions.nameFilterSelect}
            onChange={handleSelectChange1}
          >
            <option value="is">is</option>
            <option value="contains">contains</option>
          </select>
        </div>
        {/* <input
          type="text"
          id="name"
          placeholder="Enter value"
          onChange={handleTextFieldChange}
          style={{ width: '100px', height: '20px' }}
        /> */}
                <Typeahead
                  id="name"  // Assign an ID to distinguish between inputs
                  onChange={(selected) => {
                    // Handle the case when a user selects an item
                    handleTextFieldChange("name", selected); 
                  }}
                  onInputChange={(text) => {
                    // Handle the case when a user is typing
                    handleTextFieldChange("name", text);
                  }}
                  options={availableNameSuggestions}  // Options for typeahead
                  placeholder="Type to search..."
                />
                        
                      </div>
                    </div>
                  )}
                 </div>

                    <div className="filter-option">
                      <div className="checkbox-label">
                        <input
                          type="checkbox"
                          id="emailFilter"
                          checked={filterOptions.emailFilter}
                          onChange={handleCheckboxChange}
                        />
                        <label className="label" htmlFor="emailFilter">Email</label>
                      </div>
                      {filterOptions.emailFilter && (
                        <div className="filter-details">
                          <div className="popup">
                          <div className="dropdown-container1">
                            <select
                              id="emailFilterSelect"
                              value={filterOptions.emailFilterSelect}
                              onChange={handleSelectChange1}
                            >
                              <option value="is">is</option>
                              <option value="contains">contains</option>
                            </select>
                          </div>
                          {/* <input
                            type="text"
                            id="email"
                            placeholder="Enter value"
                            onChange={handleTextFieldChange}
                            style={{ width: '100px', height: '20px' }}
                          /> */}
                          <Typeahead
                            id="email"  // Assign an ID to distinguish between inputs
                            onChange={(selected) => {
                              // Handle the case when a user selects an item
                              handleTextFieldChange("email", selected); 
                            }}
                            onInputChange={(text) => {
                              // Handle the case when a user is typing
                              handleTextFieldChange("email", text);
                            }}
                            options={availableEmailSuggestions}  // Options for typeahead
                            placeholder="Type to search..."
                          />
                        </div>
                        </div>
                      )}
                    </div>


                    <div className="filter-option">
                      <div className="checkbox-label">
                        <input
                          type="checkbox"
                          id="mobileFilter"
                          checked={filterOptions.mobileFilter}
                          onChange={handleCheckboxChange}
                        />
                        <label className="label" htmlFor="mobileFilter">MobileNumber</label>
                      </div>
                      {filterOptions.mobileFilter && (
                        <div className="filter-details">
                          <div className="popup">
                          <div className="dropdown-container1">
                            <select
                              id="mobileFilterSelect"
                              value={filterOptions.mobileFilterSelect}
                              onChange={handleSelectChange1}
                            >
                              <option value="is">is</option>
                              <option value="contains">contains</option>
                            </select>
                          </div>
                          {/* <input
                            type="text"
                            id="mobileNumber"
                            placeholder="Enter value"
                            onChange={handleTextFieldChange}
                            style={{ width: '100px', height: '20px' }}
                          /> */}
                          <Typeahead
                            id="mobileNumber"  // Assign an ID to distinguish between inputs
                            onChange={(selected) => {
                              // Handle the case when a user selects an item
                              handleTextFieldChange("mobileNumber", selected); 
                            }}
                            onInputChange={(text) => {
                              // Handle the case when a user is typing
                              handleTextFieldChange("mobileNumber", text);
                            }}
                            options={availableMobileSuggestions}  // Options for typeahead
                            placeholder="Type to search..."
                          />
                        </div>
                        </div>
                      )}
                    </div>

                    <div className="filter-option">
                      <div className="checkbox-label">
                        <input
                          type="checkbox"
                          id="jobFilter"
                          checked={filterOptions.jobFilter}
                          onChange={handleCheckboxChange}
                        />
                        <label className="label" htmlFor="jobFilter">&nbsp;Job Title</label>
                      </div>
                      {filterOptions.jobFilter && (
                        <div className="filter-details">
                          <div className="popup">
                          <div className="dropdown-container1">
                            <select
                              id="jobFilterSelect"
                              value={filterOptions.jobFilterSelect}
                              onChange={handleSelectChange1}
                            >
                              <option value="is">is</option>
                              <option value="contains">contains</option>
                            </select>
                          </div>
                          {/* <input
                            type="text"
                            id="jobTitle"
                            placeholder="Enter value"
                            onChange={handleTextFieldChange}
                            style={{ width: '100px', height: '20px' }}
                          /> */}
                          <Typeahead
                            id="jobTitle"  // Assign an ID to distinguish between inputs
                            onChange={(selected) => {
                              // Handle the case when a user selects an item
                              handleTextFieldChange("jobTitle", selected); 
                            }}
                            onInputChange={(text) => {
                              // Handle the case when a user is typing
                              handleTextFieldChange("jobTitle", text);
                            }}
                            options={availableJobTitleSuggestions}  // Options for typeahead
                            placeholder="Type to search..."
                          />
                        </div>
                        </div>
                      )}
                    </div>

                    <div className="filter-option">
                      <div className="checkbox-label">
                        <input
                          type="checkbox"
                          id="statusFilter"
                          checked={filterOptions.statusFilter}
                          onChange={handleCheckboxChange}
                        />
                        <label className="label" htmlFor="statusFilter">&nbsp;ApplicantStatus</label>
                      </div>
                      {filterOptions.statusFilter && (
                        <div className="filter-details">
                          <div className="popup">
                          <div className="dropdown-container1">
                            <select
                              id="statusFilterSelect"
                              value={filterOptions.statusFilterSelect}
                              onChange={handleSelectChange1}
                            >
                              <option value="is">is</option>
                              <option value="contains">contains</option>
                            </select>
                          </div>
                          {/* <input
                            type="text"
                            id="applicantStatus"
                            placeholder="Enter value"
                            onChange={handleTextFieldChange}
                            style={{ width: '100px', height: '20px' }}
                          /> */}
                          <Typeahead
                            id="applicantStatus"  // Assign an ID to distinguish between inputs
                            onChange={(selected) => {
                              // Handle the case when a user selects an item
                              handleTextFieldChange("applicantStatus", selected); 
                            }}
                            onInputChange={(text) => {
                              // Handle the case when a user is typing
                              handleTextFieldChange("applicantStatus", text);
                            }}
                            options={availableStatusSuggestions}  // Options for typeahead
                            placeholder="Type to search..."
                          />
                        </div>
                        </div>
                      )}
                    </div>

                    <div className="filter-option">
                      <div className="checkbox-label">
                        <input
                          type="checkbox"
                          id="experienceFilter"
                          checked={filterOptions.experienceFilter}
                          onChange={handleCheckboxChange}
                        />
                        <label className="label" htmlFor="experienceFilter">&nbsp;Experience</label>
                      </div>
                      {filterOptions.experienceFilter && (
                        <div className="filter-details">
                          <div className="popup">
                          <div className="dropdown-container1">
                            <select
                              id="experienceFilterSelect"
                              value={filterOptions.experienceFilterSelect}
                              onChange={handleSelectChange1}
                            >
                              <option value="is">is</option>
                              <option value="greaterThan">greaterThan</option>
                              <option value="lessThan">lessThan</option>
                            </select>
                          </div>
                          {/* <input
                            type="text"
                            id="minimumExperience"
                            placeholder="Enter value"
                            onChange={handleTextFieldChange}
                            style={{ width: '100px', height: '20px' }}
                          /> */}
                          <Typeahead
                            id="minimumExperience"  // Assign an ID to distinguish between inputs
                            onChange={(selected) => {
                              // Handle the case when a user selects an item
                              handleTextFieldChange("minimumExperience", selected); 
                            }}
                            onInputChange={(text) => {
                              // Handle the case when a user is typing
                              handleTextFieldChange("minimumExperience", text);
                            }}
                            options={availableExpSuggestions}  // Options for typeahead
                            placeholder="Type to search..."
                          />
                        </div>
                        </div>
                      )}
                    </div>

                    <div className="filter-option">
                      <div className="checkbox-label">
                        <input
                          type="checkbox"
                          id="minimumQualification"
                          checked={filterOptions.minimumQualification}
                          onChange={handleCheckboxChange}
                        />
                        <label className="label" htmlFor="minimumQualification">&nbsp;Qualification</label>
                      </div>
                      {filterOptions.minimumQualification && (
                        <div className="filter-details">
                          <div className="popup">
                          <div className="dropdown-container1">
                            <select
                              id="minimumQualificationSelect"
                              value={filterOptions.minimumQualificationSelect}
                              onChange={handleSelectChange1}
                            >
                              <option value="is">is</option>
                              <option value="contains">contains</option>
                            </select>
                          </div>
                          {/* <input
                            type="text"
                            id="minimumQualificationInput"
                            placeholder="Enter value"
                            onChange={handleTextFieldChange}
                            style={{ width: '100px', height: '20px' }}
                          /> */}
                          <Typeahead
                            id="minimumQualificationInput"  // Assign an ID to distinguish between inputs
                            onChange={(selected) => {
                              // Handle the case when a user selects an item
                              handleTextFieldChange("minimumQualificationInput", selected); 
                            }}
                            onInputChange={(text) => {
                              // Handle the case when a user is typing
                              handleTextFieldChange("minimumQualificationInput", text);
                            }}
                            options={availableQualSuggestions}  // Options for typeahead
                            placeholder="Type to search..."
                          />
                        </div>
                        </div>
                      )}
                    </div>

                    <div className="filter-option">
                      <div className="checkbox-label">
                        <input
                          type="checkbox"
                          id="specialization"
                          checked={filterOptions.specialization}
                          onChange={handleCheckboxChange}
                        />
                        <label className="label" htmlFor="specialization">&nbsp;Specialization</label>
                      </div>
                      {filterOptions.specialization && (
                        <div className="filter-details">
                          <div className="popup">
                          <div className="dropdown-container1">
                            <select
                              id="specializationSelect"
                              value={filterOptions.specializationSelect}
                              onChange={handleSelectChange1}
                            >
                              <option value="is">is</option>
                              <option value="contains">contains</option>
                            </select>
                          </div>
                          {/* <input
                            type="text"
                            id="specializationInput"
                            placeholder="Enter value"
                            onChange={handleTextFieldChange}
                            style={{ width: '100px', height: '20px' }}
                          /> */}
                          <Typeahead
                            id="specializationInput"  // Assign an ID to distinguish between inputs
                            onChange={(selected) => {
                              // Handle the case when a user selects an item
                              handleTextFieldChange("specializationInput", selected); 
                            }}
                            onInputChange={(text) => {
                              // Handle the case when a user is typing
                              handleTextFieldChange("specializationInput", text);
                            }}
                            options={availableSpecSuggestions}  // Options for typeahead
                            placeholder="Type to search..."
                          />
                        </div>
                        </div>
                      )}
                    </div>

                    <div className="filter-option">
                      <div className="checkbox-label">
                        <input
                          type="checkbox"
                          id="preScreenedCondition"
                          checked={filterOptions.preScreenedCondition}
                          onChange={handleCheckboxChange}
                        />
                        <label className="label" htmlFor="preScreenedCondition">&nbsp;PreScreened</label>
                      </div>
                      {filterOptions.preScreenedCondition && (
                        <div className="filter-details">
                          <div className="popup">
                          <div className="dropdown-container1">
                            <select
                              id="preScreenedConditionSelect"
                              value={filterOptions.preScreenedConditionSelect}
                              onChange={handleSelectChange1}
                            >
                              <option value="is">is</option>
                              <option value="contains">contains</option>
                            </select>
                          </div>
                          {/* <input
                            type="text"
                            id="preScreenedConditionInput"
                            placeholder="Enter value"
                            onChange={handleTextFieldChange}
                            style={{ width: '100px', height: '20px' }}
                          /> */}
                          <Typeahead
                            id="preScreenedConditionInput"  // Assign an ID to distinguish between inputs
                            onChange={(selected) => {
                              // Handle the case when a user selects an item
                              handleTextFieldChange("preScreenedConditionInput", selected); 
                            }}
                            onInputChange={(text) => {
                              // Handle the case when a user is typing
                              handleTextFieldChange("preScreenedConditionInput", text);
                            }}
                            options={availablePreSuggestions}  // Options for typeahead
                            placeholder="Type to search..."
                          />
                        </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="filter-option">
                      <div className="checkbox-label">
                        <input
                          type="checkbox"
                          id="apptitudeScore"
                          checked={filterOptions.apptitudeScore}
                          onChange={handleCheckboxChange}
                        />
                        <label className="label" htmlFor="apptitudeScore">&nbsp;ApptitudeScore</label>
                      </div>
                      {filterOptions.apptitudeScore && (
                        <div className="filter-details">
                          <div className="popup">
                          <div className="dropdown-container1">
                            <select
                              id="apptitudeScoreFilterSelect"
                              value={filterOptions.apptitudeScoreFilterSelect}
                              onChange={handleSelectChange1}
                            >
                              <option value="is">is</option>
                              <option value="greaterThan">greaterThan</option>
                              <option value="lessThan">lessThan</option>
                            </select>
                          </div>
                          {/* <input
                            type="text"
                            id="apptitudeScoreInput"
                            placeholder="Enter value"
                            onChange={handleTextFieldChange}
                            style={{ width: '100px', height: '20px' }}
                          /> */}
                          <Typeahead
                            id="apptitudeScoreInput"  // Assign an ID to distinguish between inputs
                            onChange={(selected) => {
                              // Handle the case when a user selects an item
                              handleTextFieldChange("apptitudeScoreInput", selected); 
                            }}
                            onInputChange={(text) => {
                              // Handle the case when a user is typing
                              handleTextFieldChange("apptitudeScoreInput", text);
                            }}
                            options={validAptiSuggestions}  // Options for typeahead
                            placeholder="Type to search..."
                          />
                        </div>
                        </div>
                      )}
                    </div>

                    <div className="filter-option">
                      <div className="checkbox-label">
                        <input
                          type="checkbox"
                          id="technicalScore"
                          checked={filterOptions.technicalScore}
                          onChange={handleCheckboxChange}
                        />
                        <label className="label" htmlFor="technicalScore">&nbsp;TechnicalScore</label>
                      </div>
                      {filterOptions.technicalScore && (
                        <div className="filter-details">
                          <div className="popup">
                          <div className="dropdown-container1">
                            <select
                              id="technicalScoreFilterSelect"
                              value={filterOptions.technicalScoreFilterSelect}
                              onChange={handleSelectChange1}
                            >
                              <option value="is">is</option>
                              <option value="greaterThan">greaterThan</option>
                              <option value="lessThan">lessThan</option>
                            </select>
                          </div>
                          {/* <input
                            type="text"
                            id="technicalScoreInput"
                            placeholder="Enter value"
                            onChange={handleTextFieldChange}
                            style={{ width: '100px', height: '20px' }}
                          /> */}
                          <Typeahead
                            id="technicalScoreInput"  // Assign an ID to distinguish between inputs
                            onChange={(selected) => {
                              // Handle the case when a user selects an item
                              handleTextFieldChange("technicalScoreInput", selected); 
                            }}
                            onInputChange={(text) => {
                              // Handle the case when a user is typing
                              handleTextFieldChange("technicalScoreInput", text);
                            }}
                            options={validTeciSuggestions}  // Options for typeahead
                            placeholder="Type to search..."
                          />
                        </div>
                        </div>
                      )}
                    </div>

                    <div className="filter-option">
                      <div className="checkbox-label">
                        <input
                          type="checkbox"
                          id="matchPercentage"
                          checked={filterOptions.matchPercentage}
                          onChange={handleCheckboxChange}
                        />
                        <label className="label" htmlFor="matchPercentage">&nbsp; Job Match %</label>
                      </div>
                      {filterOptions.matchPercentage && (
                        <div className="filter-details">
                          <div className="popup">
                          <div className="dropdown-container1">
                            <select
                              id="matchPercentageFilterSelect"
                              value={filterOptions.matchPercentageFilterSelect}
                              onChange={handleSelectChange1}
                            >
                              <option value="is">is</option>
                              <option value="greaterThan">greaterThan</option>
                              <option value="lessThan">lessThan</option>
                            </select>
                          </div>
                          {/* <input
                            type="text"
                            id="technicalScoreInput"
                            placeholder="Enter value"
                            onChange={handleTextFieldChange}
                            style={{ width: '100px', height: '20px' }}
                          /> */}
                          <Typeahead
                            id="matchPercentageInput"  // Assign an ID to distinguish between inputs
                            onChange={(selected) => {
                              // Handle the case when a user selects an item
                              handleTextFieldChange("matchPercentageInput", selected); 
                            }}
                            onInputChange={(text) => {
                              // Handle the case when a user is typing
                              handleTextFieldChange("matchPercentageInput", text);
                            }}
                            options={validJobMatchSuggestions}  // Options for typeahead
                            placeholder="Type to search..."
                          />
                        </div>
                        </div>
                      )}
                    </div>

                    <div className="filter-option">
                      <div className="checkbox-label">
                        <input
                          type="checkbox"
                          id="matchedSkills"
                          checked={filterOptions.matchedSkills}
                          onChange={handleCheckboxChange}
                        />
                        <label className="label" htmlFor="matchedSkills">&nbsp;MatchedSkills</label>
                      </div>
                      {filterOptions.matchedSkills && (
                        <div className="filter-details">
                          <div className="popup">
                          <div className="dropdown-container1">
                            <select
                              id="matchedSkillsFilterSelect"
                              value={filterOptions.matchedSkillsFilterSelect}
                              onChange={handleSelectChange1}
                            >
                              <option value="is">is</option>
                              <option value="greaterThan">greaterThan</option>
                              <option value="lessThan">lessThan</option>
                            </select>
                          </div>
                          {/* <input
                            type="text"
                            id="technicalScoreInput"
                            placeholder="Enter value"
                            onChange={handleTextFieldChange}
                            style={{ width: '100px', height: '20px' }}
                          /> */}
                          <Typeahead
                            id="matchedSkillsInput"  // Assign an ID to distinguish between inputs
                            onChange={(selected) => {
                              // Handle the case when a user selects an item
                              handleTextFieldChange("matchedSkillsInput", selected); 
                            }}
                            onInputChange={(text) => {
                              // Handle the case when a user is typing
                              handleTextFieldChange("matchedSkillsInput", text);
                            }}
                            options={availableMatchSkillSuggestions}  // Options for typeahead
                            placeholder="Type to search..."
                          />
                        </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <button className="apply-button1" onClick={applyFilter}>Apply</button>
                      <button className="reset-button1" onClick={resetFilter}>Reset</button>
                      </div>
                    {/* Error message */}
      {showError && (
        <p style={{
          color: '#F83838',
          fontFamily: 'Plus Jakarta Sans',
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: '25px',
          borderRadius: '8px',
          background: '#FFF2F2',
          padding: '10px',
          marginLeft: '-40px',
          textAlign:'center'
        }}>
          Please Select at least one filter
        </p>
      )}
              </div>
              </div>
        <section className="flat-dashboard-setting bg-white">
          <div className="themes-container">
            <div className="row">
            
     
              <div className="col-lg-12 col-md-12">
                <div className="profile-setting">
                <div className="table-container-wrapper">
                  <div className="table-container">
                  {Array.isArray(applicants) && applicants.length === 0 ? (
   
                          <p>No Applicants are available.</p>
                        ) : (
                    <table ref={tableref} className="responsive-table">
                      <thead>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              onChange={handleSelectAll}
                              checked={selectedApplicants.length === applicants.length}
                            />
                          </th>
                 
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile Number</th>
                          <th>Job Title</th>
                          <th>Applicant Status</th>
                          {selectedColumns.map((column, index) => (
                            <th key={index}>
                              {column.replace(/([A-Z])/g, ' $1').trim()}
                            </th>
                          ))}
                          <th>
                            Resume
                          </th>
                          <th>
                          <div >
                            <button onClick={toggleSidebar} className="filter-button" style={{marginLeft:'10px'}}>
                              <FontAwesomeIcon icon={faSlidersH} style={{fontSize: '10px', color: 'gray',transform: 'rotate(180deg)'}}/>
                            </button>
 
                            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                              <h3>
                                <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '20px', fontSize:'18px' }} onClick={toggleSidebar}/>
                                Manage Columns
                              </h3><br/>
                             
                              <ul style={{ marginLeft: '50px' }}>
                                {Object.keys(selectedCheckboxes).map((key, index) => (
                                  <li key={index} style={{ marginBottom: '10px', position: 'relative' }}>
                                    <input
                                      type="checkbox"
                                      name={key}
                                      checked={selectedCheckboxes[key]}
                                      onChange={handleCheckboxs}
                                    />
                                    <span>
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                              <div className='buttons'>
                              <button id="apply-button2" onClick={handleApply} className="apply-button2">Apply</button>
                              <div className="reset2-link" onClick={reset}>Reset</div>
                              </div>
                              {errorMessage && <h5 style={{ color: 'red', textAlign: 'center',marginLeft:'10px', marginTop: '50px' }}>{errorMessage}</h5>}
                            </div>
                            {isOpen && <div className="backdrop"></div>}
                          </div>
                          </th>
                         
                         
                         
                        </tr>
                      </thead>
                      <tbody>
                      {Array.isArray(applicants) && applicants.map((application) => (
                          <tr key={application.applyjobid} style={{
                            backgroundColor: selectedApplicants.includes(application.applyjobid)
                              ? "#F6F6F6"
                              : "transparent",
                          }}>
                           
                              <td>
                                <input
                                  type="checkbox"
                                  value={application.applyjobid}
                                  checked={selectedApplicants.includes(application.applyjobid)}
                                  onChange={() => handleCheckboxChange2(application.applyjobid)}
                                  name={`applicantCheckbox-${application.applyjobid}`}
                                />
                              </td>
                              
                           
                            <td>
  <Link 
    to={`/viewapplicant/${application.id}?jobid=${application.jobId}&appid=${application.id}`} 
    style={{ color: '#0583D2', textDecoration: 'none', position: 'relative' }}
  >
    {application.name}
    
    {application.preScreenedCondition === 'PreScreened' && (
      <div style={{ display: 'inline-block', position: 'relative' }}>
        <img 
          src={verified123} 
          className="external-link-image" 
          style={{
            marginLeft: '1px', 
            width: '20px', 
            height: '20.187px', 
            flexShrink: 0 
          }} 
          onMouseEnter={() => setShowTooltip(true)} 
          onMouseLeave={() => setShowTooltip(false)}
        />
        
        {/* Tooltip */}
        {showTooltip && (
          <div style={{
            position: 'absolute', 
            top: '25px', 
            left: '0', 
            width: '600px', // Set width
            height: '62.226px', // Set height
            borderRadius: '8px', // Rounded corners
            background: '#FFF', // Background color
            boxShadow: '0px 4px 15px 0px rgba(0, 0, 0, 0.15)', // Box shadow
            zIndex: 1,
            display: 'flex', // Use flexbox
            alignItems: 'center', // Center align items vertically
            padding: '10px', // Add padding for spacing
            boxSizing: 'border-box' // Include padding and border in the element's total width and height
          }}>
            <img 
              src={verified123} 
              alt="Pre-screened badge" 
              style={{
                width: '20px', 
                height: '20.187px', 
                marginRight: '20px',
                marginLeft: '5px'
              }}
            />
            <span style={{ whiteSpace: 'normal', color:'black' }}>
              Pre-screened badges are issued to candidates who scored more than 70% in <br /> both Aptitude and Technical tests
            </span>

            {/* Pointer arrow on hover */}
              {/* <div
              style={{
                position: 'absolute',
                top: '0%', // Move it directly below the tooltip
                left: '0%', // Center it horizontally relative to the tooltip
                transform: 'translateX(-50%) rotate(-45deg)', // Center the arrow
                width: '30px', // Arrow width should be 0
                height: '10px', // Arrow height should be 0
                borderTop: '10px solid transparent', // Top triangle part
                borderBottom: '10px solid transparent', // Bottom triangle part
                borderLeft: '10px solid #0583D2', // Arrow color
              }}
            /> */}

          </div>
        )}
      </div>
    )}
  </Link>
</td>


 
                            <td>
                            <Link to={`/viewapplicant/${application.id}?jobid=${application.jobId}&appid=${application.id}`} style={{ color: '#0583D2', textDecoration: 'none' }}>
                            {application.email}
  </Link>
  </td>
                       
                           
                            <td>
                            <Link to={`/viewapplicant/${application.id}?jobid=${application.jobId}&appid=${application.id}`} style={{ color: '#0583D2', textDecoration: 'none' }}>
                            {application.mobilenumber}
  </Link>
                              </td>
                            <td>{application.jobTitle}</td>
                            <td style={{
                                padding: '0px 10px', // Keep padding for the table cell
                                textAlign: 'center',  // Center content in the cell
                                verticalAlign: 'middle', // Align the content vertically in the middle
                              }}>
                                <div style={{
                                  display: 'inline-flex',
                                  justifyContent: 'flex-start',
                                  alignItems: 'center',
                                  gap: '10px',
                                  borderRadius: '14px',
                                  background: (() => {
                                    switch (application.applicantStatus) {
                                      case 'Shortlisted':
                                        return '#DBFAEB';
                                      case 'Selected':
                                        return '#F9F5FF';
                                      case 'Rejected':
                                        return '#FFF3F4';
                                      case 'Screening':
                                        return '#EFFFD0';
                                      case 'Interviewing':
                                        return '#FFF2E1';
                                      default:
                                        return '#F8F8F8'; // Default background for unknown status
                                    }
                                  })(),
                                  color: (() => {
                                    switch (application.applicantStatus) {
                                      case 'Shortlisted':
                                        return '#2D6A4F';
                                      case 'Selected':
                                        return '#6C3FB6';
                                      case 'Rejected':
                                        return '#FF4D4F';
                                      case 'Screening':
                                        return '#718F00';
                                      case 'Interviewing':
                                        return '#F7B267';
                                      default:
                                        return '#000'; // Default color for unknown status
                                    }
                                  })(),
                                  justifyContent: 'flex-start',
                                  padding: '0px 10px' // Add padding inside the content for spacing
                                }}>
                                  {application.applicantStatus}
                                </div>
                              </td>

                              {selectedColumns.includes("Experience")&&(<td>{application.experience}</td>)}
                            {selectedColumns.includes("Qualification")&&(<td>{application.minimumQualification}</td>)}
                            {selectedColumns.includes("Location")&&(
                              <td>
                              {application.preferredJobLocations.length > 3
                                ? `${application.preferredJobLocations.slice(0, 3).join(", ")} +`
                                : application.preferredJobLocations.join(", ")}
                              </td>)}
                            {selectedColumns.includes("Speclization")&&(<td>{application.specialization}</td>)}
                            {selectedColumns.includes("Apptitude Score")&&(<td>{application.apptitudeScore}</td>)}
                            {selectedColumns.includes("Technical Score")&&<td>{application.technicalScore}</td>}
                            {/* {selectedColumns.includes("Pre-Screened")&&<td>{application.preScreenedCondition}</td>} */}
                            {selectedColumns.includes("Matching Skills")&&(
                            <td>
                              {application.matchedSkills.length > 3
                                ? `${application.matchedSkills.slice(0, 3).map(skill => skill.skillName).join(", ")} +`
                                : application.matchedSkills.map(skill => skill.skillName).join(", ")}
                            </td>
                            )}
                            {selectedColumns.includes("Missing Skills")&&(
                            <td>
                              {application.nonMatchedSkills.length > 3
                                ? `${application.nonMatchedSkills.slice(0, 3).map(skill => skill.skillName).join(", ")} +`
                                : application.nonMatchedSkills.map(skill => skill.skillName).join(", ")}
                            </td>
                            )}
                            {selectedColumns.includes("Additional Skills")&&(<td>
                              {application.additionalSkills.length > 3
                                ? `${application.additionalSkills.slice(0, 3).map(skill => skill.skillName).join(", ")} +`
                                : application.additionalSkills.map(skill => skill.skillName).join(", ")}
                            </td>
                            )}
                            {selectedColumns.includes("Tested Skills")&&(<td>
                              {application.applicantSkillBadges && application.applicantSkillBadges.length > 3
                                ? `${application.applicantSkillBadges.slice(0, 3).map(skill => skill.skillBadge.name).join(", ")} +`
                                : application.applicantSkillBadges
                                  ? application.applicantSkillBadges.map(skill => skill.skillBadge.name).join(", ")
                                  : "No skills available"}
                            </td>
                            )}
                            {selectedColumns.includes("Job Match%")&&(
                            <td>{application.matchPercentage}%</td>
                            )}

                            <td><Link to={`/view-resume/${application.id}`} style={{ color: 'blue' }}>View</Link></td>

                           
                          </tr>
                        ))}
                      </tbody>
                    </table>
                        )}
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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
    );
  }
  export default RecruiterAllApplicants;