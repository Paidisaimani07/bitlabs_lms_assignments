import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { apiUrl } from '../../services/ApplicantAPIService';  
import { useUserContext } from '../common/UserProvider';
import logoCompany1 from '../../images/cty12.png';
function ApplicantAppliedJobs({setSelectedJobId}) {
    const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserContext();
  const applicantId = user.id;
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
    const fetchAppliedJobs = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.get(`${apiUrl}/applyjob/getAppliedJobs/${applicantId}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const jobsData = response.data;
        setJobs(jobsData);
      } catch (error) {
        console.error('Error fetching applied jobs:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAppliedJobs();
  }, []);
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', options);
    return formattedDate;
  }
  return (
    <div>
    {loading ? null : (
        <div className="dashboard__content">
          <section className="page-title-dashboard">
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12 ">
                  <div className="title-dashboard">
                    <div className="title-dash flex2">My Applied Jobs</div>
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
                      <div style={{marginLeft:30}}>No Applied jobs available</div>
                    ) : (
                    jobs.map((job) => (
                      <div className="features-job cl2  bg-white" key={job.id}>
                        <div className="job-archive-header">
                          <div className="inner-box">
                          <div className="logo-company">
                              {job.logoFile ? (
                                   <img src={`data:image/png;base64,${job.logoFile}`} alt="Company Logo" />
                              ) : (
                                    <img src={logoCompany1} alt={`Default Company Logo ${job.id}`} />
                              )}
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
                                  <a href="javascript:void(0);">{job.employeeType}</a>
                                </li>
                                <li>
                                  <a href="javascript:void(0);">{job.remote ? 'Remote' : 'Office-based'}</a>
                                </li>
                                <li>
<a href="javascript:void(0);"> Exp &nbsp;{job.minimumExperience} - {job.maximumExperience} years</a>
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
                              <button class="button-status">
                              {job && (<Link to={`/applicant-interview-status?jobId=${job.id}`} style={{ color: 'white' }} onClick={() => setSelectedJobId(job.applyJobId)}>
  Check Status
</Link>
 )}
                              </button>
                            </div>
                          </div>
                      </div>
                    )))}
                  </div>
                </div>
              </div>
            </div>
          </section>
          </div>
       )}
    </div>
  );
}
export default ApplicantAppliedJobs;
