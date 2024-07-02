import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import logoCompany1 from '../../images/cty12.png';
import { useNavigate } from "react-router-dom";
import './ApplicantFindJobs.css';
import Spinner from '../common/Spinner'; // Assume you have a spinner component

function ApplicantAppliedJobs({ setSelectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserContext();
  const applicantId = user.id;
  const navigate = useNavigate();

  const fetchAppliedJobs = useCallback(async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.get(`${apiUrl}/applyjob/getAppliedJobs/${applicantId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [applicantId]);

  useEffect(() => {
    fetchAppliedJobs();
  }, [fetchAppliedJobs]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const convertToLakhs = (amountInRupees) => {
    return (amountInRupees / 100000).toFixed(2); // Assuming salary is in rupees
  };

  return (
    <div>
      {loading ? (
        <div className="dashboard__content">
        <div className="row mr-0 ml-10">
          <div className="col-lg-12 col-md-12">
            <section className="page-title-dashboard">
              <div className="themes-container">
                <div className="row">
                  <div className="col-lg-12 col-md-12 ">
                    <div className="title-dashboard">
                    <Spinner /> 
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        </div>
      ) : (
        <div className="dashboard__content">
          <div className="row mr-0 ml-10">
            <div className="col-lg-12 col-md-12">
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
            </div>
            <div className="col-lg-12 col-md-12">
              <section className="flat-dashboard-setting flat-dashboard-setting2">
                <div className="themes-container">
                  <div className="content-tab">
                    <div className="inner">
                      <div className="group-col-2">
                        {jobs.length === 0 ? (
                          <div style={{ marginLeft: 30 }}>No Applied jobs available</div>
                        ) : (
                          jobs.map((job) => (
                            <Link
                              className="features-job cl2 bg-white"
                              to={`/applicant-interview-status?jobId=${job.id}`}
                              key={job.id}
                              style={{ textDecoration: 'none', color: 'inherit' }}
                              onClick={() => setSelectedJobId(job.applyJobId)}
                            >
                              <div className="job-archive-header">
                                <div className="inner-box">
                                  <div className="box-content">
                                    <h4>{job.companyname}</h4>
                                    <h3>{job.jobTitle}</h3>
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
                                    <li>{job.employeeType}</li>
                                    <li>{job.remote ? 'Remote' : 'Office-based'}</li>
                                    <li>Exp &nbsp;{job.minimumExperience} - {job.maximumExperience} years</li>
                                    <li>&#x20B9; {convertToLakhs(job.minSalary)} - &#x20B9; {convertToLakhs(job.maxSalary)} LPA</li>
                                  </ul>
                                  <div className="star">
                                    {Array.from({ length: job.starRating }).map((_, index) => (
                                      <span key={index} className="icon-star-full"></span>
                                    ))}
                                  </div>
                                </div>
                                <div className="job-footer-right">
                                  <div className="price">
                                    <span style={{ fontSize: '12px' }}>Posted on {formatDate(job.creationDate)}</span>
                                  </div>
                                  <button className="button-status">
                                    <Link
                                      to={`/applicant-interview-status?jobId=${job.id}`}
                                      style={{ color: 'white' }}
                                      onClick={() => setSelectedJobId(job.applyJobId)}
                                    >
                                      Check Status
                                    </Link>
                                  </button>
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicantAppliedJobs;
