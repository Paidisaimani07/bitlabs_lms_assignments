import React from 'react';
import { useUserContext } from '../common/UserProvider';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import logoCompany1 from '../../images/cty12.png';
import editlogo from '../../images/edit.png';
import { Link } from 'react-router-dom';
 
function RecruiterJobOpenings({ setSelectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user1 = useUserContext();
  const user = user1.user;
  const disabledStatusClass = 'disabled-status';
  const [jobStatus,setJobStatus]=useState();
 
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // Define windowWidth state variable
 
  // Update windowWidth state variable on window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
 
    window.addEventListener('resize', handleResize);
 
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
 
  // useEffect(() => {
  //   const jwtToken = localStorage.getItem('jwtToken');
  //   if (jwtToken) {
  //     axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
  //   }
  //   axios
  //     .get(`${apiUrl}/job/recruiters/viewJobs/${user.id}`)
  //     .then((response) => {
  //       setJobs(response.data);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching job details:', error);
  //       setLoading(false);
  //     });
  // }, [user.id]);
 
 
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        }
 
        // Try to get jobs from local storage
        const localJobs = JSON.parse(localStorage.getItem('jobs')) || [];
 
        // If local jobs are available, use them
        if (localJobs.length > 0) {
          // Fetch job status for each job
          const updatedJobs = await Promise.all(
            localJobs.map(async (job) => {
              const statusResponse = await axios.get(`${apiUrl}/job/getStatus/${job.id}`);
              const status = statusResponse.data;
              return { ...job, status };
            })
          );
 
          setJobs(updatedJobs);
          setLoading(false);
        } else {
          // Fetch job details from the server
          const jobsResponse = await axios.get(`${apiUrl}/job/recruiters/viewJobs/${user.id}`);
          const jobsData = jobsResponse.data;
 
          // Fetch job status for each job
          const updatedJobs = await Promise.all(
            jobsData.map(async (job) => {
              const statusResponse = await axios.get(`${apiUrl}/job/getStatus/${job.id}`);
              const status = statusResponse.data;
              return { ...job, status };
            })
          );
 
          // Save the fetched jobs to local storage
          localStorage.setItem('jobs', JSON.stringify(updatedJobs));
 
          setJobs(updatedJobs);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        setLoading(false);
      }
    };
 
    fetchJobs();
  }, [user.id]);
 
  const handleStatusChange = async (jobId, newStatus) => {
    try {
      // Update the job status using the API
      await axios.post(`${apiUrl}/job/changeStatus/${jobId}/${newStatus}`);
 
      // Update the local state to reflect the changes
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: newStatus } : job
        )
      );
 
      // Update local storage with the modified job status
      const updatedJobs = jobs.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      );
      localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };
 
  const handleButtonClick1 = (jobId) => {
    setSelectedJobId(jobId);
  };
 
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', options);
    return formattedDate;
  }
 
  // useEffect(() => {
  //   const fetchJobStatus = async () => {
  //     try {
  //       const response = await axios.get(`${apiUrl}/job/getStatus/${jobId}`);
  //       const status = response.data;
  //       setJobStatus(status);
  //     } catch (error) {
  //       console.error('Error fetching job alerts:', error);
  //     }
  //   };
  //   fetchJobStatus();
  // }, []);
 
 
  // const handleStatusChange = async (jobId, newStatus) => {
  //   try {
  //     // Update the job status using the API
  //     await axios.post(`${apiUrl}/job/changeStatus/${jobId}/${newStatus}`);
 
  //     // Update the local state to reflect the changes
  //     setJobs((prevJobs) =>
  //       prevJobs.map((job) =>
  //         job.id === jobId ? { ...job, status: newStatus } : job
  //       )
  //     );
  //   } catch (error) {
  //     console.error('Error updating job status:', error);
  //   }
  // };
 
  return (
    <div>
      <div className="dashboard__content">
        <section className="page-title-dashboard">
          <div className="themes-container">
            <div className="row">
              <div className="col-lg-12 col-md-12 ">
                <div className="title-dashboard">
                  <div className="title-dash flex2">Job Openings</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="flat-dashboard-setting flat-dashboard-setting2">
          <div className="themes-container bg-white">
            <div className="content-tab">
              <div className="inner">
                <br />
                <div className="group-col-2">
               
                {jobs.map((job) => (
  <div    className={`features-job cl2 ${job.status === 'Inactive' ? 'inactive-job' : ''}`}
  key={job.id}>
   
    <select
  value={job.status}
  onChange={(e) => handleStatusChange(job.id, e.target.value)}
  style={{
    backgroundColor: 'white',
    borderColor: '#F97316',
    borderRadius: '5px',
    width: windowWidth >= 400 ? '46%' : '66%', // Adjust width based on window width
    float: 'right',
    fontSize: '15px',
    color: job.status === 'Active' ? '#EE6D12' : '#808080', // Dynamic color based on status
  }}
    // width: '30%',
    // width: '66%', // Default width for mobile devices
    // width: '66%',
   
    // width: windowWidth >= 400 ? '48%' : // Desktop view
    //    windowWidth >= 350 ? '56%' : // Tablet view
    //    '66%', // Mobile view
 
     
    // color: job.status === 'Active' ? '#00ff00' : '#808080', // Dynamic color based on status
   
    // Media query for adjusting width on larger screens
    // '@media (min-width: 768px)': {
    //   width: '30%', // Adjust the width for larger screens
    // }
 
>
<option value="Active" style={{ color: job.status === 'Active' ? '#EE6D12' : '#808080' }}>
    Active
</option>
<option value="Inactive" style={{ color: job.status === 'Inactive' ? '#808080' : '#808080' }}>
    Inactive
</option>
</select>
<br /><br />
    <div className="job-archive-header">
      <div className="inner-box">
      <div className="logo-company">
                            {job.logoFile ? (
                              <img src={`data:image/png;base64,${job.logoFile}`} alt="Company Logo" />
                            ) : (
                              <img src={logoCompany1} alt={`Default Company Logo ${job.id}`} />
                            )}
         
        </div>
        <div className="box-content">
          <h4>
            <a>{job.companyname}</a>
          </h4>
          <h3>
            <a>{job.jobTitle}</a>
          </h3>
          <ul>
            <li>
              <span className="icon-map-pin"></span>
              {job.location}
            </li>
            <li>
              <span className="icon-calendar"></span>
              Posted on {formatDate(job.creationDate)}
            </li>
          </ul>
          <span></span>
        </div>
      </div>
    </div>
    <div className="job-archive-footer">
      <div className="job-footer-left">
        <ul className="job-tag">
        <li>
<a href="#" onClick={(e) => { e.preventDefault(); }}>{job.employeeType}</a>
</li>
<li>
<a href="#" onClick={(e) => { e.preventDefault(); }}>{job.remote ? 'Remote' : 'Office-based'}</a>
</li>
<p style={{ marginLeft: '8px', paddingTop: '2px', fontSize: '14px'}}> Exp {job.minimumExperience} - {job.maximumExperience} years</p>
        </ul>
        <div className="star">
          {Array.from({ length: job.starRating }).map((_, index) => (
            <span key={index} className="icon-star-full"></span>
          ))}
        </div>
      </div>
      <div className="job-footer-right">
        <div className="price">
          <span></span>
          <p>&#x20B9; {job.minSalary} - &#x20B9; {job.maxSalary} / year</p>
        </div>
        <Link  to={`/recruiter-edit-job/${job.id}`}>
  {/* <button
    type="button"
     
  >
   
  </button> */}
  <img src={editlogo} width="30px" height="40px" title="Edit Job"/>
</Link>
        <Link to="/recruiter-appliedapplicants" onClick={() => handleButtonClick1(job.id)}>
  <button
    type="button"
    style={{
      borderRadius: 20,
      backgroundColor: job.status === 'Inactive' ? '#f2f2f2' : '',
      color: job.status === 'Inactive' ? '#808080' : ''
    }}
    className={`button-status ${job.status === 'Inactive' ? 'disabled-button' : ''}`}
    // disabled={job.status === 'Inactive'}
  >
    View Applicants
  </button>
</Link>
 
      </div>
    </div>
  </div>
))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
 
export default RecruiterJobOpenings;