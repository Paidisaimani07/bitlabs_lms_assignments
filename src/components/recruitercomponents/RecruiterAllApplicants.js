import React, { useState, useEffect, useRef } from 'react';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';
import $ from 'jquery';
import ScheduleInterviewPopup from './ScheduleInterviewPopup';
import { CSVLink } from 'react-csv';
import { Link } from 'react-router-dom';
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
  const [count, setCount] = useState(0);
 
  const [filterOptions, setFilterOptions] = useState({
    nameFilter: false,
    emailFilter: false,
    mobileFilter: false,
    jobFilter: false,
    statusFilter: false,
    skillFilter: false,
    experienceFilter: false,
    locationFilter: false
  });
 
  const handleCheckboxChange = (event) => {
    const { id, checked } = event.target;
    setFilterOptions(prevState => ({
      ...prevState,
      [id]: checked ? 'is' : null
    }));
  };
  const resetFilter = () => {
  // Reload the page
  window.location.reload();
};
  const applyFilter = () => {
    // Construct the URL with filter options
    // let url = `${apiUrl}/applyjob/recruiter/${user.id}/appliedapplicants1?name=${name}&email=${email}`;
    let url = `${apiUrl}/applyjob/recruiter/${user.id}/appliedapplicants1?name=${name}&email=${email}&mobileNumber=${mobileNumber}&jobTitle=${jobTitle}&applicantStatus=${applicantStatus}&skillName=${skillName}&minimumExperience=${minimumExperience}&location=${location}`;
   
   // Construct object for body
const body = {
  "name": filterOptions.nameFilter === "contains" ? "contains" : filterOptions.nameFilter === "is" ? "is" : null,
  "email": filterOptions.emailFilter === "contains" ? "contains" : filterOptions.emailFilter === "is" ? "is" : null,
  "mobilenumber": filterOptions.mobileFilter === "contains" ? "contains" : filterOptions.mobileFilter === "is" ? "is" : null,
  "jobTitle": filterOptions.jobFilter === "contains" ? "contains" : filterOptions.jobFilter === "is" ? "is" : null,
  "applicantStatus": filterOptions.statusFilter === "contains" ? "contains" : filterOptions.statusFilter === "is" ? "is" : null,
  "skillName": filterOptions.skillFilter === "contains" ? "contains" : filterOptions.skillFilter === "is" ? "is" : null,
  "minimumExperience": filterOptions.experienceFilter === "greaterThan" ? "greaterThan":filterOptions.experienceFilter === "lessThan" ? "lessThan" : filterOptions.experienceFilter === "is" ? "is" : null,
  "location": filterOptions.locationFilter === "contains" ? "contains" : filterOptions.locationFilter === "is" ? "is" : null
};
    console.log(filterOptions);
    // Add your JWT token here
    const token = localStorage.getItem('jwtToken');
    console.log(token);
 
    // Make sure to replace 'Bearer' with the appropriate prefix if needed
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
 
    // Make API call with constructed URL, and headers
   // Make API call with constructed URL, body, and headers
   fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
})
.then(response => response.json())
.then(data => {
   
   
    console.log('testing ',count);
    const $table = window.$(tableref.current);
    $table.DataTable().clear().destroy();
 
    // Reinitialize DataTable with new data
    $table.DataTable({
        responsive: true,
        data: data,
        columns: [
          {
            data: null,
            render: function(data, type, row) {
              return '<input type="radio" value="' + row.applyjobid + '" ' +
                (selectedApplicant && selectedApplicant.applyjobid === row.applyjobid ? 'checked' : '') +
                ' onChange="handleRadioChange(' + JSON.stringify(row) + ')" name="applicantRadio"/>';
            }
          },
            { data: 'name' },
            { data: 'email' },
            { data: 'mobilenumber' },
            { data: 'jobTitle' },
            { data: 'applicantStatus' },
            { data: 'minimumExperience' },
            { data: 'skillName' },
            { data: 'minimumQualification' },
            { data: 'location' }
        ]
    });
    count=setCount(data.length);
 
})
.catch(error => {
    // Handle errors
    console.error('Error fetching or processing data:', error);
});
};
 
const handleTextFieldChange = (e) => {
  const { id, value } = e.target;
  switch (id) {
    case "name": // Assuming you have an input field with id "name"
      setName(value);
      break;
    case "email": // Assuming you have an input field with id "email"
      setEmail(value);
      break;
    case "mobileNumber": // Assuming you have an input field with id "mobileNumber"
      setMobileNumber(value);
      break;
    case "jobTitle": // Assuming you have an input field with id "jobTitle"
      setJobTitle(value);
      break;
    case "applicantStatus": // Assuming you have an input field with id "applicantStatus"
      setApplicantStatus(value);
      break;
    case "skillName": // Assuming you have an input field with id "skillName"
      setSkillName(value);
      break;
    case "minimumExperience": // Assuming you have an input field with id "minimumExperience"
      setMinimumExperience(value);
      break;
    case "location": // Assuming you have an input field with id "location"
      setLocation(value);
      break;
    default:
      break;
  }
};
 
 
 
  const handleFilterChange = (event) => {
    const { name, checked, value } = event.target;
    const updatedFilters = [...selectedFilter]; // Copy the existing filters
 
    if (checked) {
      updatedFilters.push({ name, value });
    } else {
      const index = updatedFilters.findIndex((filter) => filter.name === name);
      if (index !== -1) {
        updatedFilters.splice(index, 1);
      }
    }
 
    setSelectedFilter(updatedFilters);
 
    // Apply filters to applicants based on updatedFilters
    const filteredApplicants = applicants.filter((applicant) => {
      return updatedFilters.every((filter) => {
        // Implement filtering logic based on filter.name and filter.value
        // You can use string matching, comparisons, etc.
        // Example: filter applicant.jobTitle based on filter.name === 'jobTitle' and filter.value
      });
    });
 
    // Update the displayed applicants in the table
    setApplicants(filteredApplicants);
  };
  useEffect(() => {
    // ... existing useEffect logic
 
    // Add event listeners to filter checkboxes on mount
    filterRef.current.forEach((checkbox) => {
      checkbox.addEventListener('change', handleFilterChange);
    });
 
    return () => {
      // ... existing cleanup logic
 
      // Remove event listeners on unmount
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
        const $table= window.$(tableref.current);
          const timeoutId = setTimeout(() => {  
           $table.DataTable().destroy();
            $table.DataTable({responsive:true});
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
    case "nameFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        nameFilter: value
      }));
      break;
    case "emailFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        emailFilter: value
      }));
      break;
    case "mobileFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        mobileFilter: value
      }));
      break;
    case "jobFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        jobFilter: value
      }));
      break;
    case "statusFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        statusFilter: value
      }));
      break;
    case "skillFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        skillFilter: value
      }));
      break;
    case "experienceFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        experienceFilter: value
      }));
      break;
    case "locationFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        locationFilter: value
      }));
      break;
    default:
      break;
  }
};
    const handleSelectChange = async (e) => {
      const newStatus = e.target.value;
     
      try {
        if (selectedApplicant && newStatus) {
          const applyJobId = selectedApplicant.applyjobid;
          const response = await axios.put(
            `${apiUrl}/applyjob/recruiters/applyjob-update-status/${applyJobId}/${newStatus}`
          );
          if (isMounted.current) {
            const updatedApplicants = applicants.map((application) => {
              if (application.applyjobid === applyJobId) {
                return { ...application, applicantStatus: newStatus };
              }
              return application;
            });
            setApplicants(updatedApplicants);
            setSelectedStatus(newStatus);
            setSelectedApplicant(null);
          }
          alert(`Status changed to ${newStatus}`);
          window.location.reload();
        }
      } catch (error) {
        console.error('Error updating status:', error);
      }
    };
 
    const exportCSV = () => {
      // Extracting headers from the table, excluding the "Schedule Interview" column
      const headers = Array.from(tableref.current.querySelectorAll('thead th')).map(th => th.textContent);
      // const scheduleInterviewIndex = headers.indexOf('Schedule Interview');
      // if (scheduleInterviewIndex !== -1) {
      //   headers.splice(scheduleInterviewIndex, 1); // Remove the "Schedule Interview" header
      // }
     
      // Convert headers to uppercase
      const capitalizedHeaders = headers.map(header => header.toUpperCase());
   
      // Extracting data rows from the table, excluding the "Schedule Interview" column
      const data = Array.from(tableref.current.querySelectorAll('tbody tr')).map(tr => {
        const rowData = Array.from(tr.children).map(td => td.textContent);
        // rowData.splice(scheduleInterviewIndex, 1); // Remove the "Schedule Interview" column
        return rowData;
      });
   
      // Adding headers to the data
      data.unshift(capitalizedHeaders);
   
      // Creating CSV content
      const csvContent = data.map(row => row.join(',')).join('\n');
   
      // Creating a Blob and creating an anchor element to trigger the download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'applicants.csv';
   
      // Triggering the download
      link.click();
    };
   
 
   
 return (
      <div className="dashboard__content">
        <section className="page-title-dashboard">
          <div className="themes-container">
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="title-dashboard">
                  <div className="title-dash flex2">All Applicants</div>
                </div>
              </div>
            </div>
          </div>
        </section>
 
       
        <div className="container">
  <h4 className="total-applicants">Total Applicants: {count}</h4>
  <div className="controls">
    <select className="status-select" value={selectedStatus} onChange={handleSelectChange}>
      <option value="" disabled>
        Change Status
      </option>
      <option value="Screening">Screening</option>
      <option value="Shortlisted">Shortlisted</option>
      <option value="Interviewing">Interviewing</option>
      <option value="Selected">Selected</option>
      <option value="selected">All the applicants</option>
    </select>
    <button className="export-buttonn" onClick={exportCSV}>
      ExportCSV
    </button>
  </div>
</div>
       
 
        <section className="flat-dashboard-setting bg-white">
          <div className="themes-container">
            <div className="row">
            <div className="col-lg-2 col-md-2" style={{ borderRight: '1px solid black', paddingLeft: '1px', paddingRight: '0px' }}>
        {/* <!-- First Section --> */}
       
<div className="profile-setting">
  <div className="table-container-wrapper">
    <div className="table-container">
    <h3 className="filter"><strong>Filters </strong></h3>
 
      {/* Filter section */}
      <div className="filter-option">
  <input
    type="checkbox"
    id="nameFilter"
    checked={filterOptions.nameFilter}
    onChange={handleCheckboxChange}
    style={{ width: 'auto' }} // Adjust the width of the checkbox
  />
  <label className="label" htmlFor="nameFilter">Name</label>
  {filterOptions.nameFilter && (
    <>
    <div className="dropdown-container1">
    <select
                      id="nameFilter"
                      value={filterOptions.nameFilter || 'null'}
                     
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="contains">contains</option>
      </select>
      </div>
      <input type="text" id="name" placeholder="Enter value" onChange={handleTextFieldChange} style={{ width: '100px', height: '20px' }}/>
    </>
  )}
</div>
 
 
 
<div className="filter-option">
  <input
    type="checkbox"
    id="emailFilter"
    checked={filterOptions.emailFilter}
    onChange={handleCheckboxChange}
  />
  <label className="label" htmlFor="emailFilter">Email</label>
  {filterOptions.emailFilter && (
    <>
      <div className="dropdown-container1">
      <select
                      id="emailFilter"
                      value={filterOptions.emailFilter || 'null'}
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="contains">contains</option>
      </select>
      <input type="text" id="email" placeholder="Enter value" onChange={handleTextFieldChange} style={{ width: '100px', height: '20px' }}/>
      </div>
    </>
  )}
</div>
 
<div className="filter-option">
  <input
    type="checkbox"
    id="mobileFilter"
    checked={filterOptions.mobileFilter}
    onChange={handleCheckboxChange}
  />
  <label className="label" htmlFor="mobileFilter">MobileNumber</label>
  {filterOptions.mobileFilter && (
    <>
      <div className="dropdown-container1">
      <select
                      id="mobileFilter"
                      value={filterOptions.mobileFilter || 'null'}
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="contains">contains</option>
      </select>
      <input type="text" id="mobileNumber" placeholder="Enter value" onChange={handleTextFieldChange} style={{ width: '100px', height: '20px' }}/>
      </div>
    </>
  )}
</div>
 
<div className="filter-option">
  <input
    type="checkbox"
    id="jobFilter"
    checked={filterOptions.jobFilter}
    onChange={handleCheckboxChange}
  />
  <label className="label" htmlFor="jobFilter">Job Title</label>
  {filterOptions.jobFilter && (
    <>
      <div className="dropdown-container1">
      <select
                      id="jobFilter"
                      value={filterOptions.jobFilter || 'null'}
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="contains">contains</option>
      </select>
      <input type="text" id="jobTitle" placeholder="Enter value" onChange={handleTextFieldChange}  style={{ width: '100px', height: '20px' }}/>
      </div>
    </>
  )}
</div>
 
<div className="filter-option">
  <input
    type="checkbox"
    id="statusFilter"
    checked={filterOptions.statusFilter}
    onChange={handleCheckboxChange}
  />
  <label className="label" htmlFor="statusFilter">ApplicantStatus</label>
  {filterOptions.statusFilter && (
    <>
      <div className="dropdown-container1">
      <select
                      id="statusFilter"
                      value={filterOptions.statusFilter || 'null'}
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="contains">contains</option>
      </select>
      <input type="text" id="applicantStatus" placeholder="Enter value" onChange={handleTextFieldChange} style={{ width: '100px', height: '20px' }}/>
      </div>
    </>
  )}
</div>
 
<div className="filter-option">
  <input
    type="checkbox"
    id="skillFilter"
    checked={filterOptions.skillFilter}
    onChange={handleCheckboxChange}
  />
  <label className="label" htmlFor="skillFilter">Skill Name</label>
  {filterOptions.skillFilter && (
    <>
      <div className="dropdown-container1">
      <select
                      id="skillFilter"
                      value={filterOptions.skillFilter || 'null'}
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="contains">contains</option>
      </select>
      <input type="text" id="skillName" placeholder="Enter value" onChange={handleTextFieldChange} style={{ width: '100px', height: '20px' }}/>
      </div>
    </>
  )}
</div>
 
<div className="filter-option">
  <input
    type="checkbox"
    id="experienceFilter"
    checked={filterOptions.experienceFilter}
    onChange={handleCheckboxChange}
  />
  <label className="label" htmlFor="experienceFilter">Experience</label>
  {filterOptions.experienceFilter && (
    <>
      <div className="dropdown-container1">
      <select
                      id="experienceFilter"
                      value={filterOptions.experienceFilter || 'null'}
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="greaterThan">greaterThan</option>
        <option value="lessThan">lessThan</option>
      </select>
      <input type="text" id="minimumExperience" placeholder="Enter value" onChange={handleTextFieldChange} style={{ width: '100px', height: '20px' }}/>
      </div>
    </>
  )}
</div>
 
<div className="filter-option">
  <input
    type="checkbox"
    id="locationFilter"
    checked={filterOptions.locationFilter}
    onChange={handleCheckboxChange}
  />
  <label className="label" htmlFor="locationFilter">Location</label>
  {filterOptions.locationFilter && (
    <>
      <div className="dropdown-container1">
      <select
                      className="checkbox"
                      id="locationFilter"
                      value={filterOptions.locationFilter || 'null'}
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="contains">contains</option>
      </select>
      <input type="text" id="location" placeholder="Enter value" onChange={handleTextFieldChange} style={{ width: '100px', height: '20px' }}/>
      </div>
    </>
  )}
 
</div>
<div>
  <button className="apply-button1" onClick={applyFilter}>Apply</button>
  <button className="reset-button1" onClick={resetFilter}>Reset</button>
  </div>
      {/* End of filter section */}
    </div>
  </div>
</div>
 
      </div>
     
              <div className="col-lg-10 col-md-10">
                <div className="profile-setting">
                <div className="table-container-wrapper">
                  <div className="table-container">
                  {Array.isArray(applicants) && applicants.length === 0 ? (
   
                          <p>No Applicants are available.</p>
                        ) : (
                    <table ref={tableref} className="responsive-table">
                      <thead>
                        <tr>
                          <th></th>
                          {/* <th >Verify </th> */}
                 
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile Number</th>
                          <th>Job Title</th>
                          <th>Applicant Status</th>
                          <th>Experience</th>
                          <th>Skill Name</th>
                          <th>Qualification</th>
                          <th>Location</th>
                        </tr>
                      </thead>
                      <tbody>
                      {Array.isArray(applicants) && applicants.map((application) => (
                          <tr key={application.email}>
                            <td>
                              <input
                                type="radio"
                                value={application.applyjobid}
                                checked={
                                  selectedApplicant &&
                                  selectedApplicant.applyjobid === application.applyjobid
                                }
                                onChange={() => setSelectedApplicant(application)}
                                name={`applicantRadio-${application.applyjobid}`}
                              />
                            </td>
                            {/* <td><Link to={`/viewapplicant/${application.id}`} >View applicant</Link></td> */}
                            {/* <td>
  <Link to={`/viewapplicant/${application.id}`} style={{ color: '#ff0000', textDecoration: 'none' }}>
    View applicant
  </Link>
</td> */}
<td>
  <Link to={`/viewapplicant/${application.id}`} style={{ color: '#0583D2', textDecoration: 'none' }}>
    {application.name}
  </Link>
</td>
 
                            <td>
                            <Link to={`/viewapplicant/${application.id}`} style={{ color: '#0583D2', textDecoration: 'none' }}>
                            {application.email}
  </Link>
  </td>
                       
                           
                            <td>
                            <Link to={`/viewapplicant/${application.id}`} style={{ color: '#0583D2', textDecoration: 'none' }}>
                            {application.mobilenumber}
  </Link>
                              </td>
                            <td>{application.jobTitle}</td>
                            <td>{application.applicantStatus}</td>
                            {/* <td>
                                  <button
                                    onClick={() =>
                                      application.applicantStatus ===
                                      'Interviewing'
                                        ? setShowPopup(true)
                                        : null
                                    }
                                    style={{
                                      border: 'none',
                                      background: 'none',
                                      padding: '0',
                                      cursor:
                                        application.applicantStatus ===
                                        'Interviewing'
                                          ? 'pointer'
                                          : 'default',
                                      outline: 'none',
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      className="bi bi-clock"
                                      fill={
                                        application.applicantStatus ===
                                        'Interviewing'
                                          ? '#3498db'
                                          : '#d3d3d3'
                                      }
                                    >
                                      <path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0zM9 4a.5.5 0 0 1 1 0v4.5h3a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5V4z" />
                                      <path d="M7.5 15a.5.5 0 0 1-.5-.5V9a.5.5 0 0 1 1 0v5.5a.5.5 0 0 1-.5.5z" />
                                    </svg>
                                  </button>
                                  <ScheduleInterviewPopup
                                    show={showPopup}
                                    handleClose={() => setShowPopup(false)}
                                    applyjobid={application.applyjobid}
                                  />
                                </td> */}
                            <td>{application.minimumExperience}</td>
                            <td>{application.skillName}</td>
                            <td>{application.minimumQualification}</td>
                            <td>{application.location}</td>
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
      </div>
    );
  }
  export default RecruiterAllApplicants;