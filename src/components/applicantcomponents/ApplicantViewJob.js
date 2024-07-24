import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserContext } from '../common/UserProvider';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import BackButton from '../common/BackButton';
import Snackbar from '../common/Snackbar';
import { apiUrl } from '../../services/ApplicantAPIService';
import SemiCircleProgressBar from "react-progressbar-semicircle";


const ApplicantViewJob = ({ selectedJobId }) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const { user } = useUserContext();
  const location = useLocation();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '', link: '', linkText: '' });
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

        setSnackbar({ open: true, message: 'Job applied successfully.', link: '/applicant-applied-jobs', linkText: 'View Applied Jobs', type: 'success' });
        localStorage.setItem(`appliedStatus-${selectedJobId}`, 'true');

        setApplied(applied);
        fetchJobDetails();
      }
    } catch (error) {
      console.error('Error applying for the job:', error);
      setSnackbar({ open: true, message: 'Job has already been applied by the applicant.', link: '/applicant-applied-jobs', linkText: 'View Applied Jobs', type: 'error' });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const convertToLakhs = (amountInRupees) => {
    return (amountInRupees * 1).toFixed(2); 
  };

  const handleCloseSnackbar = (index) => {
    setSnackbar({ open: false, message: '', type: '', link: '', linkText: '' });
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
                        <div className="features-job style-2 stc-apply bg-white">
                          <div className="job-archive-header">
                            <div className="inner-box">
                              <div className="box-content">
                                <h4>
                                  <a href="javascript:void(0);">{jobDetails.companyname}</a>
                                </h4>
                                <h3>
                                  <a href="javascript:void(0);">{jobDetails.jobTitle}</a>
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
                                  <a href="javascript:void(0);">{jobDetails.employeeType}</a>
                                </li>
                                <li>
                                  <a href="javascript:void(0);">{jobDetails.remote ? 'Remote' : 'Office-based'}</a>
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
                          <div className='row'>
                          
                          <div id="item_1" className="col-lg-8 col-md-12" style={{padding:'4px'}}>

                          
                          <h5 className='match-probability'>Skill Match Probability</h5>
                          <p>The more the Probability, more are the chances to get hired.</p>
                          </div>
                         
                          <div id="item_1" className="col-lg-4 col-md-12">
                          <div className="right-aligned-content">
                            <div className="progress-bar-container">
                           
                              <SemiCircleProgressBar percentage={jobDetails.matchPercentage} showPercentValue={false}  stroke="#F46F16" background="#FFDBBB" />
                              <div className="progress-bar-value">{jobDetails.matchPercentage} %</div>
                            </div>
                            <div className="match">
                              <h5 className="centered-text" style={{color:'#000000'}}>{jobDetails.matchStatus}</h5>
                            </div>
                          </div>
                          </div>
                         </div>
                        
                         <div className="job-archive-footer">
  <div className="job-footer-left1">
    <ul className="job-tag">
    {jobDetails.matchedSkills.map((skill, index) => (
        <li key={index}>
           <a 
            href="javascript:void(0);"
            style={{
              backgroundColor: '#498C07', /* Green background color */
              color: '#FFFF', /* White text color */
              padding: '8px 12px', /* Padding around the text */
              borderRadius: '50px', /* Rounded corners */
              textDecoration: 'none', /* Remove underline */
              display: 'inline-block', /* Ensure padding is applied */
              transition: 'background-color 0.3s' /* Smooth transition for hover effect */
              
            }}
          >
            {skill.skillName}
          </a>
        </li>
      ))}
      {jobDetails.skillsRequired.map((skill, index) => (
        <li key={index}>
           <a 
            href="javascript:void(0);"
            style={{
              backgroundColor: 'red', /* Green background color */
              color: 'white', /* White text color */
              padding: '8px 12px', /* Padding around the text */
              height:'32',
              borderRadius: '50px', /* Rounded corners */
              textDecoration: 'none', /* Remove underline */
              display: 'inline-block', /* Ensure padding is applied */
              transition: 'background-color 0.3s' /* Smooth transition for hover effect */
            }}
          >
             <span style={{
              display: 'inline-block',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '2px solid white', /* White border color */
              backgroundColor: 'red', /* Circle background color */
              color: 'white', /* Exclamation mark color */
              textAlign: 'center',
              lineHeight: '15px',
              marginRight: '8px',
              fontWeight: 'bold'
            }}>!</span>
             {capitalizeFirstLetter(skill.skillName)}
          </a>
        </li>
      ))}
     
    </ul>
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
};

export default ApplicantViewJob;
