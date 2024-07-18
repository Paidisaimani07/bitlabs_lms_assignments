import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import Spinner from '../common/Spinner';
import Snackbar from '../common/Snackbar';
import './ApplicantFindJobs.css';

function ApplicantFindJobs({ setSelectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [profileid1, setprofileid] = useState();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useUserContext();
  const userId = user.id;
  const [snackbars, setSnackbars] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let jobData;
        localStorage.setItem('jwtToken', user.data.jwt);
        const jwtToken = user.data.jwt;
        console.log(jwtToken);

        const recommendedJobsResponse = await axios.get(`${apiUrl}/recommendedjob/findrecommendedjob/${userId}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        jobData = recommendedJobsResponse.data;

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
        addSnackbar({ message: 'Job saved successfully.', link: '/applicant-saved-jobs', linkText: 'View Saved Jobs', type: 'success' });
      }
      fetchJobs();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        addSnackbar({ message: 'Access denied. Please check your credentials.', type: 'error' });
      } else if (error.response && error.response.status === 401) {
        addSnackbar({ message: 'Unauthorized. Please log in.', type: 'error' });
      } else {
        addSnackbar({ message: 'Error saving job. Please try again later.', type: 'error' });
        console.error('Error saving job:', error);
      }
    }
  };

  const fetchJobs = async () => {
    try {
      let jobData;
      const jwtToken = localStorage.getItem('jwtToken');
      const profileIdResponse = await axios.get(`${apiUrl}/applicantprofile/${userId}/profileid`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      const profileId = profileIdResponse.data;
      setprofileid(profileId);
      if (profileId === 0) {
        const promotedJobsResponse = await axios.get(`${apiUrl}/job/promote/${userId}/yes`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        jobData = promotedJobsResponse.data;
      } else {
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

  const addSnackbar = (snackbar) => {
    setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
  };

  const handleCloseSnackbar = (index) => {
    setSnackbars((prevSnackbars) => prevSnackbars.filter((_, i) => i !== index));
  };

  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', options);
    return formattedDate;
  }

  const handleApplyNowClick = (jobId) => {
    setSelectedJobId(jobId);
    navigate('/applicant-view-job', { state: { from: location.pathname } });
  };

  const convertToLakhs = (amountInRupees) => {
    return (amountInRupees * 1).toFixed(2);
  };

  return (
    <div>
      {loading ? null : (
        <div className="dashboard__content">
          <div className="row mr-0 ml-10">
            <div className="col-lg-12 col-md-12">
              <section className="page-title-dashboard">
                <div className="themes-container">
                  <div className="row">
                    <div className="col-lg-12 col-md-12 ">
                      <div className="title-dashboard">
                        <div className="title-dash flex2"> {profileid1 === 0 ? "Suggested jobs" : "Recommended Jobs"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div className="col-lg-12 col-md-12">
              <section className="flat-dashboard-setting flat-dashboard-setting2">
                <div className="themes-container">
                  <div className="content-tab">
                    <div className="inner">
                      <div className="group-col-2">
                        {jobs.length === 0 ? (
                          <div style={{ marginLeft: 30 }}>No jobs available</div>
                        ) : (
                        jobs
                          .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate))
                          .map((job) => (
                            <div className="features-job cl2 bg-white" key={job.id} onClick={() => handleApplyNowClick(job.id)}>
                              <div className="job-archive-header">
                                <div className="inner-box">
                                  <div className="box-content">
                                    <h4>
                                      {job.companyname || (job.jobRecruiter && job.jobRecruiter.companyname) ? (<a href="javascript:void(0);">{job.companyname || job.jobRecruiter.companyname}</a>) : null}
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
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              <div className="job-archive-footer">
                                <div className="job-footer-left">
                                  <ul className="job-tag">
                                    <li>
                                      <a href="javascript:void(0);">{job.employeeType}</a>
                                    </li>
                                    <li>
                                      <a href="javascript:void(0);">{job.remote ? 'Remote' : 'Office-based'}</a>
                                    </li>
                                    <li>
                                      <a href="javascript:void(0);"> Exp&nbsp; {job.minimumExperience} - {job.maximumExperience} years</a>
                                    </li>
                                    <li>
                                      <a href="javascript:void(0);">&#x20B9; {convertToLakhs(job.minSalary)} - &#x20B9; {convertToLakhs(job.maxSalary)} LPA</a>
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
                                    <span>
                                      <span style={{ fontSize: '12px' }}>Posted on {formatDate(job.creationDate)}</span>
                                    </span>
                                  </div>
                                  <ul className="job-tag">
                                    <li onClick={(e) => e.stopPropagation()}>
                                      {job.isSaved === 'saved' ? (
                                        <button
                                          disabled
                                          className="button-status2"
                                          style={{ backgroundColor: '#FFFFFF', color: '#F97316', borderColor: '#F97316', opacity: '30%' }}
                                        >
                                          Saved
                                        </button>
                                      ) : (
                                        <button onClick={() => handleSaveJob(job.id)} className="button-status2">
                                          Save Job
                                        </button>
                                      )}
                                    </li>
                                    <li>
                                      {job && (
                                        <button
                                         // onClick={() => handleApplyNowClick(job.id)}
                                          className="button-status1"
                                        >
                                          View Job
                                        </button>
                                      )}
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
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
          </div>
        </div>
      )}
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={index}
          index={index}
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
          link={snackbar.link}
          linkText={snackbar.linkText}
        />
      ))}
    </div>
  );
}

export default ApplicantFindJobs;
