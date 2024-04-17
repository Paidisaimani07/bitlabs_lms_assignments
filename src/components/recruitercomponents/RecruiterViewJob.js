import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logoCompany1 from '../../images/cty12.png';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import BackButton from '../common/BackButton';

function RecruiterViewJob({ selectedJobId }) {
  const [jobDetails, setJobDetails] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const navigate = useNavigate();
  const { user } = useUserContext();
  const applicantId = user.id;
  const location = useLocation();
  const jobId = new URLSearchParams(location.search).get('jobId');
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchJobDetails = async () => {
    try {
      console.log(jobId);
      const response = await axios.get(

        // `${apiUrl}/viewjob/applicant/viewjob/${selectedJobId}/${user.id}`,

        `${apiUrl}/viewjob/recruiter/viewjob/${selectedJobId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        }
      );
      const { body } = response.data;
      setLoading(false);
      if (body) {
        setJobDetails(body);
        const appliedStatus = localStorage.getItem(`appliedStatus-${selectedJobId}`);
        if (appliedStatus) {
          setApplied(appliedStatus === 'true');
        }
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchJobDetails(); // Call the function directly when the component mounts
  }, [selectedJobId]); 

  
  const handleApplyNow = async () => {
    try {
      // Check the profile ID
      const profileIdResponse = await axios.get(`${apiUrl}/applicantprofile/${user.id}/profileid`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      const profileId = profileIdResponse.data;

      if (profileId === 0) {
        // If profile ID is "0", fetch promoted jobs
        navigate('/applicant-basic-details-form');
        return;
      } else {
        setApplied(true);
        const response = await axios.post(
          `${apiUrl}/applyjob/applicants/applyjob/${applicantId}/${selectedJobId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            },
          }
        );
        const { applied } = response.data;
        window.alert('Job applied successfully');
        localStorage.setItem(`appliedStatus-${selectedJobId}`, 'true');
        setApplied(applied);
        fetchJobDetails();
      }
    } catch (error) {
      console.error('Error applying for the job:', error);
      window.alert('Job has already been applied by the applicant');
      setApplied(false);
    }
  };

  useEffect(() => {
    const getStatus = async () => {
      try {
        const statusResponse = await axios.get(`${apiUrl}/job/getStatus/${selectedJobId}`);
        // Handle the response to update job status as needed
        // For example:
        setJobStatus(statusResponse.data);
        console.log('Job status:', statusResponse.data);
      } catch (error) {
        console.error('Error fetching job status:', error);
      }
    };
    getStatus();
  }, [jobId]);

  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', options);
    return formattedDate;
  }
  const convertToLakhs = (amountInRupees) => {
    return (amountInRupees / 100000).toFixed(2); // Assuming salary is in rupees
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

//   const handleStatusChange = async (jobId, newStatus) => {
//     try {
//       await axios.post(`${apiUrl}/job/changeStatus/${jobId}/${newStatus}`);
  
//       setJobDetails((prevJobDetails) => ({
//         ...prevJobDetails,
//         status: newStatus
//       }));
  
//       localStorage.setItem(`jobStatus-${jobId}`, newStatus);
//       window.alert('Job closed successfully.');
//       navigate('/recruiter-jobopenings');
//     } catch (error) {
//       console.error('Error updating job status:', error);
//     }
//   };
   

const handleStatusChange = async (jobId, newStatus, action) => {
    try {
      if (action === 'Repost') {
        const response = await axios.post(`${apiUrl}/job/recruiters/cloneJob/${jobId}/${applicantId}`);
        const message = response.data.message; // Access the message from the response
        window.alert(message);
      } else {
        // Handle closing the job as before
        await axios.post(`${apiUrl}/job/changeStatus/${jobId}/${newStatus}`);
        setJobDetails((prevJobDetails) => ({
          ...prevJobDetails,
          status: newStatus
        }));
        localStorage.setItem(`jobStatus-${jobId}`, newStatus);
        window.alert('Job closed successfully.');
      }
      navigate('/recruiter-jobopenings');
    } catch (error) {
      console.error('Error updating job status:', error);
    }
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
                  <BackButton />
                    <div className="title-dash flex2">Full Job Details</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="flat-dashboard-setting flat-dashboard-setting2">
            <div className="themes-container">
              <div className="content-tab">
                <div className="inner">
                  
                  <article className="job-article">
                    {jobDetails && (
                      <div className="top-content">
                        <div className="features-job style-2 stc-apply  bg-white">
                          <div className="job-archive-header">
                            <div className="inner-box">
                              {/* <div className="logo-company">
                                {jobDetails.logoFile ? (
                                  <img src={`data:image/png;base64,${jobDetails.logoFile}`} alt="Company Logo" />
                                ) : (
                                  <img src="images/logo-company/cty12.png" alt={`Default Company Logo`} />
                                )}
                              </div> */}
                              <div className="box-content">
                                <h4>
                                  <a href="#">{jobDetails.companyname}</a>
                                </h4>
                                <h3>
                                  <a href="#">{jobDetails.jobTitle}</a>
                                </h3>
                                <ul>
                                  <li>
                                    <span className="icon-map-pin"></span>
                                    &nbsp;{jobDetails.location}
                                  </li>
                                  {/* <li>
                                    <span className="icon-calendar"></span>
                                    &nbsp;{formatDate(jobDetails.creationDate)}
                                  </li> */}
                                </ul>
                            
                                <div className="button-readmore">
                                
                                <div className="three-dots-menu">
      <span className="three-dots" onClick={toggleMenu}>&#x22EE;</span>
      {menuOpen && (
        <div className="menu-options">
            {jobStatus === 'active' ? (
           <Link to={`/recruiter-edit-job/${selectedJobId}`}>
            Edit Job
          </Link>
          ) : (
            <Link to={`/recruiter-repost-job/${selectedJobId}`}>
            Edit Job
          </Link>
          )}
          {/* <Link onClick={() => handleStatusChange(selectedJobId, jobDetails.status === 'Active' ? 'Inactive' : 'Active')}>
           {jobDetails.status === 'Active' ? 'Repost Job' : 'Close Job'}
         </Link> */}

{jobStatus === 'active' ? (
  <Link onClick={() => handleStatusChange(selectedJobId, 'inactive', 'Close')}>
    Close Job
  </Link>
) : (
  <Link onClick={() => handleStatusChange(selectedJobId, 'active', 'Repost')}>
    Repost Job
  </Link>
)}


        </div>
      )}
    </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="job-archive-footer">
                            <div className="job-footer-left">
                              <ul className="job-tag">
                                <li>
                                  <a href="#">{jobDetails.employeeType}</a>
                                </li>
                                <li>
                                  <a href="#">{jobDetails.remote ? 'Remote' : 'Office-based'}</a>
                                </li>
                                <li>
<a href="javascript:void(0);"> Exp &nbsp;{jobDetails.minimumExperience} - {jobDetails.maximumExperience} years</a>
</li>
<li>
<a href="javascript:void(0);">&#x20B9; {convertToLakhs(jobDetails.minSalary)} - &#x20B9; {convertToLakhs(jobDetails.maxSalary)} LPA</a>
</li>
                              </ul>
                              <div className="star">
                                {Array.from({ length: jobDetails.starRating }).map((_, index) => (
                                  <span key={index} className="icon-star-full"></span>
                                ))}
                              </div>
                            </div>
                            <div className="job-footer-right">
                              <div className="price">
                              <span>
<span style={{fontSize:'12px'}}>Posted on {formatDate(jobDetails.creationDate)}</span></span>
                              </div>
                              <div className="button-readmore">
                              <Link to={`/appliedapplicantsbasedonjob/${selectedJobId}`} className="custom-link">
                            <button
                              type="button"
                              // style={{
                              //   backgroundColor: job.status === 'Inactive' ? '#f2f2f2' : '',
                              //   color: job.status === 'Inactive' ? '#808080' : ''
                              // }}
                              className={`button-status ${jobDetails.status === 'Inactive' ? 'disabled-button' : ''}`}
                              // disabled={job.status === 'Inactive'}
                            >
                              View Applicants
                            </button>
                          </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {jobDetails && (
                      <div className="inner-content">
                        <h5>Full Job Description</h5>
                        <p>{jobDetails.description}</p>
                      </div>
                    )}
                  </article>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default RecruiterViewJob;

