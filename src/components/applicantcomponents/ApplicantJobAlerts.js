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

//   function formatDate(dateArray) {
//     // Destructure the array into individual components
//     const [year, month, day, hour, minute, second, millisecond] = dateArray;

//     // Create a Date object using the components
//     const date = new Date(year, month - 1, day, hour, minute, second, millisecond / 1000000);

//     // Define options for date and time formatting
//     const options = {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         // second: '2-digit',
//         hour12: true // Use 24-hour format
//     };

//     // Format the date and time
//     const formattedDate = date.toLocaleString('en-US', options);
//     return formattedDate;
// }

function formatDate(dateArray) {
  // Destructure the array into individual components
  const [year, month, day, hour, minute, second] = dateArray;

  // Create a Date object using the components
  const date = new Date(year, month - 1, day, hour, minute, second);

  // Define options for date and time formatting
  const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit', // Include seconds if needed
      hour12: true // Use 12-hour format with AM/PM
  };

  // Format the date and time
  const formattedDate = date.toLocaleString('en-US', options);
  return formattedDate;
}

  

  return (
    <div className="dashboard__content">
      <section className="page-title-dashboard">
        <div className="themes-container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <div className="title-dashboard">
              {/* <BackButton /> */}
                <div className="title-dash flex2" style={{marginLeft: "30px",marginBottom:"-30px" }}>Notifications</div>
{/*<h4 className="title-count" onClick={RecommendJobs}>
    {"We've"} {contRecJobs}{" "} {"New job recommendations matching your profile. Check it out now!"}
  </h4> */}
                
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

<style jsx>{`
  .title-count:hover {
    color: #8F8F8F;
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
   <li key={alert.alertsId} onClick={() => handleJobAlertClick(alert)} className='inner' style={{ width: '100%', padding: '2%', borderRadius: '10px',height:'100px', position: 'relative', backgroundColor: alert.seen ? '#E5EAF5' : '#FFFFFF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '50px' }}>
  <div
    style={{
      width: '10px',
      height: '10px',
      backgroundColor: alert.seen ? 'transparent' : '#3384E3',
      border: '2px solid #3384E3',
      borderRadius: '50%',
      marginRight: '10px', 
      position: 'absolute',
      left: '0px',
      top:'20px',
    }}
  ></div>
  <h4 style={{ marginLeft: '25px' }}>
      
      <>
        <Link
          to={`/applicant-interview-status?jobId=${alert.applyJob.job.id}`}
          className="link"
          onMouseOver={(e) => { e.target.style.color = 'black'; }}
          onMouseOut={(e) => { e.target.style.color = 'black'; }}
        >
           Your application status has been marked as &nbsp;{alert.status} {' '} by {alert.companyName} for {' '} {alert.jobTitle} {' '} role {' '}.
          <br /> {/* Line break to move the date to the second line */}
          <span className="date-info" 
           onMouseOver={(e) => { e.target.style.color = '#848484'; }}
           onMouseOut={(e) => { e.target.style.color = '#848484'; }}
           >
            {formatDate(alert.changeDate)}
          </span>
        </Link>
      </>
    
  </h4>
</div>

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
