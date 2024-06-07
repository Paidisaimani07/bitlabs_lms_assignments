import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useLocation, useNavigate } from 'react-router-dom';

const ApplicantViewJob = ({ selectedJobId }) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const { user } = useUserContext();
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = new URLSearchParams(location.search).get('jobId') || selectedJobId;

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/viewjob/applicant/viewjob/${jobId}/${user.id}`,
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
        const appliedStatus = localStorage.getItem(`appliedStatus-${jobId}`);
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
    fetchJobDetails();
  }, [jobId]);

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
          `${apiUrl}/applyjob/applicants/applyjob/${user.id}/${jobId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            },
          }
        );
        const { applied } = response.data;
        window.alert('Job applied successfully');
        localStorage.setItem(`appliedStatus-${jobId}`, 'true');
        setApplied(applied);
        fetchJobDetails();
      }
    } catch (error) {
      console.error('Error applying for the job:', error);
      window.alert('Job has already been applied by the applicant');
      setApplied(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const convertToLakhs = (amountInRupees) => {
    return (amountInRupees * 1).toFixed(2); // Assuming salary is in rupees
  };


  const handleBackClick = (e) => {
    e.preventDefault();
    navigate(-1); // Navigate back to the previous page
  };


  return (
    <div>
      {loading ? null : (
        <div className="dashboard__content">
          <section className="page-title-dashboard">
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12">
                  <div className="title-dashboard">
                    <div className="title-dash flex2">
                      <button className="back-link" onClick={handleBackClick} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <svg width="20" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g id="back 1">
                            <g id="Group">
                              <path
                                id="Chevron_Right"
                                d="M4.78645 10.7138L13.7804 19.7047C14.175 20.0983 14.8144 20.0983 15.21 19.7047C15.6047 19.311 15.6047 18.6716 15.21 18.278L6.92952 10.0005L15.209 1.72293C15.6037 1.32928 15.6037 0.689884 15.209 0.295238C14.8144 -0.0984125 14.174 -0.0984125 13.7794 0.295238L4.78545 9.28607C4.39687 9.67565 4.39687 10.3251 4.78645 10.7138Z"
                                fill="black"
                              />
                            </g>
                          </g>
                        </svg>
                      </button>
                      Full Job Details
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
                        <div className="features-job style-2 stc-apply bg-white">
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
                                  <a href="javascript:void(0);">
                                    Exp &nbsp;{jobDetails.minimumExperience} - {jobDetails.maximumExperience} years
                                  </a>
                                </li>
                                <li>
                                  <a href="javascript:void(0);">
                                    &#x20B9; {convertToLakhs(jobDetails.minSalary)} - &#x20B9; {convertToLakhs(jobDetails.maxSalary)} LPA
                                  </a>
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
                                  <span style={{ fontSize: '12px' }}>Posted on {formatDate(jobDetails.creationDate)}</span>
                                </span>
                              </div>
                              <div className="button-readmore">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <button
                                    className={`btn-apply btn-popup ${applied ? 'applied' : ''}`}
                                    onClick={handleApplyNow}
                                    disabled={jobDetails.jobStatus === 'Already Applied'}
                                    style={{
                                      backgroundColor: jobDetails.jobStatus === 'Already Applied' ? '#FEF1E8' : '#F97316',
                                      cursor: 'pointer',
                                      height: '40px',
                                      color: '#F97316',
                                      borderRadius: '8px',
                                      backgroundColor: '#FFFFFF',
                                      opacity: '80%',
                                      borderColor: '#F97316',
                                    }}
                                  >
                                    <span className="icon-send"></span>&nbsp;
                                    {jobDetails.jobStatus === 'Already Applied' ? 'Applied' : 'Apply Now'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                  {jobDetails && (
                    <div className="features-job style-2 stc-apply bg-white">
   <div className="inner-content">
   
    <h5>Full Job Description</h5>
    <div className="description-preview" dangerouslySetInnerHTML={{ __html: jobDetails.description }} />
   
  </div>
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
};

export default ApplicantViewJob;
