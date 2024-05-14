import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from '../common/BackButton';
export default function ApplicantJobAlerts() {
  const [jobAlerts, setJobAlerts] = useState([]);
  const { user } = useUserContext();
  const [contRecJobs, setCountRecJobs] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const jobIdParam = new URLSearchParams(location.search).get('jobId');
  const [loading, setLoading] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null); // Define setSelectedJobId
  const [jobId, setJobId] = useState(null); 

  useEffect(() => {
    if (jobIdParam) {
      setJobId(jobIdParam);
    }
  }, [location, jobIdParam]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const authToken = localStorage.getItem('jwtToken');
        const response = await axios.get(
          `${apiUrl}/viewjob/applicant/viewjob/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const { body } = response.data;
        setLoading(false);
        if (body) {
          setJobDetails(body);
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  useEffect(() => {
    const fetchJobAlerts = async () => {
      try {
        const authToken = localStorage.getItem('jwtToken'); // Get JWT token from local storage
        const response = await axios.get(
          `${apiUrl}/applyjob/applicant/job-alerts/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`, // Add JWT token to request headers
            },
          }
        );
        const alerts = response.data;
        setJobAlerts(alerts);
      } catch (error) {
        console.error('Error fetching job alerts:', error);
      }
    };
    fetchJobAlerts();
  }, []);

  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    }
    axios
      .get(`${apiUrl}/recommendedjob/countRecommendedJobsForApplicant/${user.id}`)
      .then((response) => {
        setCountRecJobs(response.data);
      })
      .catch((error) => {
        console.error('Error fetching team members:', error);
      });
  }, [user.id]);

  //handleJobAlertClick 
  
  const handleJobAlertClick = async (alert) => {
    try {
      // Call the backend API to mark the alert as seen
      await axios.put(`${apiUrl}/applyjob/applicant/mark-alert-as-seen/${alert.alertsId}`);
      
      // Update the "seen" status of the clicked alert in the frontend
      const updatedJobAlerts = jobAlerts.map(alert => {
        if (alert.alertsId === alert.alertsId) {
          return { ...alert, seen: true };
        }
        return alert;
      });
      setJobAlerts(updatedJobAlerts);
  
      // Show job details
      // const jobId = alert.applyJob && alert.applyJob.job && alert.applyJob.job.id;
      // setSelectedJobId(jobId);
      // console.log('Selected job ID:', jobId);
      // navigate('/applicant-interview-status?jobId=${alert.applyJob.job.id}');
    } catch (error) {
      console.error('Error marking alert as seen:', error);
    }
  };

  const RecommendJobs = () => {
    navigate("/applicant-find-jobs");
  };

  // const handleJobTitleClick = (jobId) => {
  //   setSelectedJobId(jobId);
  //   navigate(`/applicant-view-job?jobId=${jobId}`);
  // };

  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', options);
    return formattedDate;
  }

  return (
    <div className="dashboard__content">
      <section className="page-title-dashboard">
        <div className="themes-container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <div className="title-dashboard">
              <BackButton />
                <div className="title-dash flex2">Your Job Alerts</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="flat-dashboard-dyagram">
        <div className="box-icon wrap-counter flex">
          <div className="icon style1">
            <span className="icon-bag"></span>
          </div>
          <div className="content">
          <h4 className="title-count" onClick={RecommendJobs} style={{ cursor: "pointer", marginLeft: "60px" }}>
  {"We've"} {contRecJobs}{" "} {"New job recommendations matching your profile. Check it out now!"}
</h4>

<style jsx>{`
  .title-count:hover {
    color: green;
  }
`}</style>
          </div>
        </div>
        <div className="themes-container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <div className="box-notifications">
                {jobAlerts.length > 0 ? (
                  <ul>
                  {jobAlerts.map(alert => (
   <li key={alert.alertsId} onClick={() => handleJobAlertClick(alert)} className='inner bg-white' style={{ width: '100%', padding: '2%', borderRadius: '10px', position: 'relative', backgroundColor: alert.seen ? '#F0F0F0' : '#FFFFFF' }}>
                   <div style={{ position: 'relative' }}>
                       {!alert.seen && <div style={{ width: '10px', height: '10px', backgroundColor: 'orange', borderRadius: '50%', position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '-15px' }}></div>} 
                      </div>
                      <h4>
                        {alert.status === 'New' || alert.status === null ? (
                          <> 
                            <Link
to={`/applicant-interview-status?jobId=${alert.applyJob.job.id}`}
style={{
  textDecoration: 'none',
  color: 'black', // Default font color
  transition: 'color 0.3s ease', // Add transition for smooth effect
}}
onMouseOver={(e) => { e.target.style.color = 'green'; }}
onMouseOut={(e) => { e.target.style.color = 'black'; }}
>
Your application has been successfully submitted to &nbsp;{alert.companyName} for {' '} {alert.jobTitle} {' '} role {' '} on {' '} {formatDate(alert.changeDate)}.
</Link>

                            </>
                        ) : (
                          <>
                            <Link
to={`/applicant-interview-status?jobId=${alert.applyJob.job.id}`}
style={{
  textDecoration: 'none',
  color: 'black', // Default font color
  transition: 'color 0.3s ease', // Add transition for smooth effect
}}
onMouseOver={(e) => { e.target.style.color = 'green'; }}
onMouseOut={(e) => { e.target.style.color = 'black'; }}
>
Your application status has been marked as &nbsp;{alert.status} {' '} by {alert.companyName} for {' '} {alert.jobTitle} {' '} role {' '} on {' '} {formatDate(alert.changeDate)}.
</Link>


                            </>
                        )}
                      </h4>

                      {alert.applyJob && (
                        <a href="#" className="p-16 color-3">{alert.applyJob.jobTitle}</a>
                      )}
                    </li>
                  ))}
                </ul>
                ) : (
                  <h3>No alerts are found.</h3>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
