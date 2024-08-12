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
                  
                    <div className="title-dash flex2"><BackButton />Full Job Details</div>
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

