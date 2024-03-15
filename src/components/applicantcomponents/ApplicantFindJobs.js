import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import axios from 'axios';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import logoCompany1 from '../../images/cty12.png';

 
function ApplicantFindJobs({ setSelectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [profileid1, setprofileid] = useState();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useUserContext();
  const userId = user.id;
 
  const getAuthToken = () => {
    return localStorage.getItem('jwtToken');
  };
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let jobData;
        // Check the profile ID
        const jwtToken = localStorage.getItem('jwtToken');
        const profileIdResponse = await axios.get(`${apiUrl}/applicantprofile/${userId}/profileid`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const profileId = profileIdResponse.data;
        setprofileid(profileId);
        if (profileId === 0) {
          // If profile ID is "0", fetch promoted jobs
          const promotedJobsResponse = await axios.get(`${apiUrl}/job/promote/${userId}/yes`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });
          jobData = promotedJobsResponse.data;
        } else {
          // If profile ID has any other value, fetch recommended jobs
          const recommendedJobsResponse = await axios.get(`${apiUrl}/recommendedjob/findrecommendedjob/${userId}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });
          jobData = recommendedJobsResponse.data;
        }
        setJobs(jobData);
      } catch (error) {
        console.error('Error fetching job data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [userId]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // const handleSaveJob = async (jobId) => {
  //   try {
  //     const response = await axios.post(`${apiUrl}/savedjob/applicants/savejob/${userId}/${jobId}`, {
  //         headers: {
  //           Authorization: `Bearer ${jwtToken}`,
  //         },
  //       });
  //     const { message } = response.data;
  //      if(response.status =200){
  //       window.alert('Job Saved successfully');
  //      }
  //      fetchJobs();
  //   } catch (error) {
  //     window.alert('Job has already been saved by the applicant');
  //     console.error('Error saving job:', error);
  //   }
  // };
 
  const handleSaveJob = async (jobId) => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
 
      const response = await axios.post(
        `${apiUrl}/savedjob/applicants/savejob/${userId}/${jobId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
 
      if (response.status === 200) {
        window.alert('Job Saved successfully');
      }
      fetchJobs();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        window.alert('Access Denied. Please check your credentials.');
      } else if (error.response && error.response.status === 401) {
        window.alert('Unauthorized. Please log in.');
      } else {
        window.alert('Error saving job. Please try again later.');
        console.error('Error saving job:', error);
      }
    }
  };
 
  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${apiUrl}/recommendedjob/findrecommendedjob/${userId}`);
      const jobData = response.data;
      setJobs(jobData);
    } catch (error) {
      console.error('Error fetching job data:', error);
    } finally {
      setLoading(false);
    }
  };
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', options);
    return formattedDate;
  }

  const handleApplyNowClick = (jobId) => {
    setSelectedJobId(jobId);
    // Perform any additional actions you need here
    navigate('/applicant-view-job'); // Programmatically navigate to the desired URL
  };

  return (
<div>
      {loading ? null : (
<div className="dashboard__content">
<section className="page-title-dashboard">
<div className="themes-container">
<div className="row">
<div className="col-lg-12 col-md-12 ">
<div className="title-dashboard">
<div className="title-dash flex2">Recommended Jobs For You!</div>
</div>
</div>
</div>
</div>
</section>
<section className="flat-dashboard-setting flat-dashboard-setting2">
<div className="themes-container">
<div className="content-tab">
<div className="inner">
<div className="group-col-2">
                  {jobs.length === 0 ? (
<div style={{marginLeft:30}}>
                     {/* <h4>Kindly Update your profile, and as per your skill set, you will get job recommendations.</h4><br/> */}
</div>
                    ) : (
                      jobs.map((job) => (
<div className="features-job cl2  bg-white" key={job.id}>
<div className="job-archive-header">
<div className="inner-box">
<div className="logo-company">                            
                               {job.logoFile ? ( <img src={`data:image/png;base64,${job.logoFile}`} alt="Company Logo" /> )
                               : (<img src={logoCompany1} alt={`Default Company Logo ${job.id}`} /> )}
</div>
<div className="box-content">
<h4>
<a href="javascript:void(0);">{job.companyname}</a>
</h4>
<h3>
<a href="javascript:void(0);">
                                    {job.jobTitle}
</a>
</h3>
<ul>
<li>
<span className="icon-map-pin"></span>
&nbsp;{job.location}
</li>
<li>
<span className="icon-calendar"></span>
&nbsp;{formatDate(job.creationDate)}
</li>
</ul>
</div>
</div>
</div>
<div className="job-archive-footer">
<div className="job-footer-left">
<ul className="job-tag">
<li>
<a href="javascript:void(0);" onclick="{yourToggleFunction()}">{job.employeeType}</a>
</li>
 
                                  <li>
<a href="javascript:void(0);" onclick="{yourToggleFunction()}">{job.remote ? 'Remote' : 'Office-based'}</a>
</li>
<li>
<a href="javascript:void(0);"> Exp&nbsp; {job.minimumExperience} - {job.maximumExperience} years</a>
</li>
 
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
<ul className="job-tag">

<li>
        {job.isSaved==='saved' ? (
<button
            disabled
            className="button-status2"
            style={{ backgroundColor: '#FFFFFF', color: '#F97316',borderColor:'#F97316' }}
>
            Saved
</button>
           ) : (
<button
              onClick={() => handleSaveJob(job.id)}
              className="button-status2"
>
              Save Job
</button>
          )}
</li>
{/* <li>
      {job && (
<Link
          to="/applicant-view-job"
          onClick={() => setSelectedJobId(job.id)}
          className="button-status1"
>
          Apply Now
</Link>
      )}
</li> */}
 <li>
      {job && (
        <button
          onClick={() => handleApplyNowClick(job.id)}
          className="button-status1"
        >
          Apply Now
        </button>
      )}
    </li>
</ul>
</div>
</div>
</div>
                      )))}
</div>
</div>
</div>
</div>
<div style={{ textAlign: "center", marginTop: "20px" }}>
            {profileid1 === 0 && (
<Link to="/applicant-basic-details-form" className="button-status1">
                More Jobs
</Link>
            )}
</div>
</section>
</div>
      )}
</div>
  );
}
export default ApplicantFindJobs;