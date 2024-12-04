import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import BackButton from '../common/BackButton';
import Snackbar from '../common/Snackbar';

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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
  const[applicantcount,setApplicantCount] = useState(0);
  const[applicants,setApplicants] = useState();


  useEffect(() => {
    const fetchApplicantCount = async () => {
      try {
        const response = await axios.get(`${apiUrl}/applyjob/appliedapplicants/${selectedJobId}`);
        const applicantsArray = Object.values(response.data || {}).flat();
        setApplicantCount(applicantsArray.length);
      } catch (error) {
        console.error("Error fetching applicant count:", error);
      }
    };
      fetchApplicantCount();
    }, [user.id]);

  const fetchJobDetails = async () => {
    try {
      console.log(jobId);
      const response = await axios.get(

      

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
    fetchJobDetails(); 
  }, [selectedJobId]); 

  
  const handleApplyNow = async () => {
    try {
      
      const profileIdResponse = await axios.get(`${apiUrl}/applicantprofile/${user.id}/profileid`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      const profileId = profileIdResponse.data;

      if (profileId === 0) {
        
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
      
        setSnackbar({ open: true, message: 'Job applied successfully', type: 'success' });
        localStorage.setItem(`appliedStatus-${selectedJobId}`, 'true');
        setApplied(applied);
        fetchJobDetails();
      }
    } catch (error) {
      console.error('Error applying for the job:', error);
      
      setSnackbar({ open: true, message: 'Job has already been applied by the applicant', type: 'error' });
      setApplied(false);
    }
  };

  useEffect(() => {
    const getStatus = async () => {
      try {
        const statusResponse = await axios.get(`${apiUrl}/job/getStatus/${selectedJobId}`);
        
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
    return (amountInRupees * 1).toFixed(2);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };


   

const handleStatusChange = async (jobId, newStatus, action) => {
    try {
      if (action === 'Repost') {
        const response = await axios.post(`${apiUrl}/job/recruiters/cloneJob/${jobId}/${applicantId}`);
        const message = response.data.message; 
       
       setSnackbar({ open: true, message: 'Job reposted successfully', type: 'success' });
      } else {
        
        await axios.post(`${apiUrl}/job/changeStatus/${jobId}/${newStatus}`);
        setJobDetails((prevJobDetails) => ({
          ...prevJobDetails,
          status: newStatus
        }));
        localStorage.setItem(`jobStatus-${jobId}`, newStatus);
       
        setSnackbar({ open: true, message: 'Job closed successfully.', type: 'success' });
      }
      
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };
  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: '' });
    navigate('/recruiter-jobopenings');
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
                  
                  <div className="title-dash flex2" style={{ display: 'flex', alignItems: 'center' }}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <BackButton />Full Job Details
  </div>
 
  <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', marginLeft:'12px' }}>
    {/* SVG Icon */}
    <svg
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginRight: '6px' }}
    >
      <g clipPath="url(#clip0_3427_6096)">
        <path
          d="M14.4909 18V16.3333C14.4909 15.4493 14.1397 14.6014 13.5146 13.9763C12.8895 13.3512 12.0416 13 11.1576 13H4.49093C3.60687 13 2.75902 13.3512 2.1339 13.9763C1.50878 14.6014 1.15759 15.4493 1.15759 16.3333V18"
          stroke="grey"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.8243 9.66667C9.66525 9.66667 11.1576 8.17428 11.1576 6.33333C11.1576 4.49238 9.66525 3 7.8243 3C5.98335 3 4.49097 4.49238 4.49097 6.33333C4.49097 8.17428 5.98335 9.66667 7.8243 9.66667Z"
          stroke="grey"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.491 18.0001V16.3334C19.4904 15.5948 19.2446 14.8774 18.7921 14.2937C18.3396 13.7099 17.7061 13.293 16.991 13.1084"
          stroke="grey"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.6576 3.1084C14.3746 3.29198 15.0101 3.70898 15.464 4.29366C15.9178 4.87833 16.1641 5.59742 16.1641 6.33757C16.1641 7.07771 15.9178 7.7968 15.464 8.38147C15.0101 8.96615 14.3746 9.38315 13.6576 9.56673"
          stroke="grey"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_3427_6096">
          <rect width="20" height="20" fill="white" transform="translate(0.32428 0.5)" />
        </clipPath>
      </defs>
    </svg>
    <span style={{marginRight: '4px',color:'#959799'}}>{applicantcount}</span>
    <span style = {{color:'#959799'}}>Applicants</span>
  </div>
</div>
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
                              
                              className={`button-status ${jobDetails.status === 'Inactive' ? 'disabled-button' : ''}`}
                            
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
                        
                        <div className="description-preview" dangerouslySetInnerHTML={{ __html: jobDetails.description }} />
                      </div>
                    )}
                  </article>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
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

export default RecruiterViewJob;

