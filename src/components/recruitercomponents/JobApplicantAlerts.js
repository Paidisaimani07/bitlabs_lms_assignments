
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
export default function JobApplicantAlerts() {
  const [jobAlerts, setJobAlerts] = useState([]);
  const { user } = useUserContext();
  useEffect(() => {
    const fetchJobAlerts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/recuriters/job-alerts/${user.id}`);
        const alerts = response.data;
        setJobAlerts(alerts);
      } catch (error) {
        console.error('Error fetching job alerts:', error);
      }
    };
    fetchJobAlerts();
  }, []);
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
                <div className="title-dash flex2">Your Job Alerts</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="custom-dashboard-section">
  <div className="custom-container">
    <div className="custom-row">
      <div className="custom-col">
        <div className="custom-notifications-box bg-white">
          {jobAlerts.length > 0 ? (
            <ul className="custom-inner-box">
              {jobAlerts.map(alert => (
                <li key={alert.alertsId} className="custom-inner">
                  <Link to="/recruiter-allapplicants" className="tf-effect">
                  {/* <Link to={`/appliedapplicantsbasedonjob/${alert.id}`} className="custom-link"> */}
                  {/* <Link to={`/appliedapplicantsbasedonjob/1`} className="custom-link"> */}
                  <h4>
                    <br />
                        <a className="custom-noti-icon" style={{ color: alert.newStatus === 'newapplicants' ? 'red' : 'inherit' }}>
                        {alert.newStatus === 'newapplicants' ? 'New ' : ''}
                        <span className="icon-bell1" ></span>
                        </a>
                        {' '}
                        <span >
                       
                        {alert.alertCount === 1 ? (
                        <span>{alert.alertCount} applicant has applied for {' '}</span>
                        ) : (
                        <span>{alert.alertCount} total applicants have applied for {' '}</span>
                        )}
                        </span>
                        <span style={{ color: 'blue' }}>{alert.jobTitle} </span>role
                  </h4>
                  </Link>
                  {alert.applyJob && (
                    <a href="#" className="custom-link p-16 color-3">{alert.applyJob.jobTitle}</a>
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