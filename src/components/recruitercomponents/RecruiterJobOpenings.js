import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserContext } from '../common/UserProvider';
import logoCompany1 from '../../images/cty12.png';
import editlogo from '../../images/edit.png';
import { Link } from 'react-router-dom';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';
import { apiUrl } from '../../services/ApplicantAPIService';
import BackButton from '../common/BackButton';

function RecruiterJobOpenings({ setSelectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user1 = useUserContext();
  const user = user1.user;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeButton, setActiveButton] = useState('active');
  // useEffect(() => {
  //   const handleResize = () => {
  //     setWindowWidth(window.innerWidth);
  //   };

  //   window.addEventListener('resize', handleResize);

  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, []);

  // useEffect(() => {
  //   const fetchJobs = async () => {
  //     try {
  //       const jwtToken = localStorage.getItem('jwtToken');
  //       if (jwtToken) {
  //         axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
  //       }

  //       const localJobs = JSON.parse(localStorage.getItem('jobs')) || [];

  //       if (localJobs.length > 0) {
  //         const updatedJobs = await Promise.all(
  //           localJobs.map(async (job) => {
  //             const statusResponse = await axios.get(`${apiUrl}/job/getStatus/${job.id}`);
  //             const status = statusResponse.data;
  //             return { ...job, status };
  //           })
  //         );

  //         setJobs(updatedJobs);
  //         setLoading(false);
  //       } else {
  //         const jobsResponse = await axios.get(`${apiUrl}/job/recruiters/viewJobs/${user.id}`);
  //         const jobsData = jobsResponse.data;

  //         const updatedJobs = await Promise.all(
  //           jobsData.map(async (job) => {
  //             const statusResponse = await axios.get(`${apiUrl}/job/getStatus/${job.id}`);
  //             const status = statusResponse.data;
  //             return { ...job, status };
  //           })
  //         );

  //         localStorage.setItem('jobs', JSON.stringify(updatedJobs));

  //         setJobs(updatedJobs);
  //         setLoading(false);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching job details:', error);
  //       setLoading(false);
  //     }
  //   };

  //   fetchJobs();
  // }, [user.id]);

  
 useEffect(() => {
  fetchActiveJobs(); // Fetch active jobs when component mounts
}, [user.id]);
const fetchActiveJobs = async () => {
  try {
    setLoading(true);
    const activeJobsResponse = await axios.get(`${apiUrl}/job/${user.id}/active`);
    const sortedActiveJobs = activeJobsResponse.data.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
    setJobs(sortedActiveJobs);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching active jobs:', error);
    setLoading(false);
  }
};

const getInactiveJobs = async () => {
  try {
    setLoading(true);
    const inactiveJobsResponse = await axios.get(`${apiUrl}/job/${user.id}/inactive`);
    const sortedInactiveJobs = inactiveJobsResponse.data.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
    setJobs(sortedInactiveJobs);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching inactive jobs:', error);
    setLoading(false);
  }
};

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await axios.post(`${apiUrl}/job/changeStatus/${jobId}/${newStatus}`);

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: newStatus } : job
        )
      );

      const updatedJobs = jobs.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      );
      localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  const convertToLakhs = (amountInRupees) => {
    return (amountInRupees / 100000).toFixed(2); // Assuming salary is in rupees
  };

  const handleActiveButtonClick = () => {
    setActiveButton('active'); // Set active button state to 'active'
    fetchActiveJobs();
  };

  const handleInactiveButtonClick = () => {
    setActiveButton('inactive'); // Set active button state to 'inactive'
    getInactiveJobs();
  };

  const activeButtonStyles = {
    color: activeButton === 'active' ? '#FFFFFF' : '#FFFFFF',
    backgroundColor: '#f97316',
    border: '1px solid #f97316',
    padding: '12px 24px',
    borderRadius: '37px',
    display: 'inline-flex',
    width: '160px',
    justifyContent: 'center',
    marginRight: '10px',
    gap: '10px'
  };

  const inactiveButtonStyles = {
    color: activeButton === 'inactive' ? 'gray' : 'gray',
    backgroundColor: 'white',
    border: '1px solid 	#D3D3D3',
    padding: '12px 24px',
    borderRadius: '37px',
    display: 'inline-flex',
    width: '170px',
    justifyContent: 'center',
    marginRight: '10px',
    gap: '10px'
  };

  return (
    <div>
      <div className="dashboard__content">
        <section className="page-title-dashboard">
          <div className="themes-container">
            <div className="row">
              <div className="col-lg-12 col-md-12 ">
                <div className="title-dashboard">
                <BackButton />
                <div className="title-dash flex2">Posted Jobs</div> 
                   <br></br>
                   <br></br>
                   
                   
                    <button style={activeButton === 'active' ? activeButtonStyles : inactiveButtonStyles} onClick={handleActiveButtonClick}>
        Active Jobs
      </button>
      &nbsp;&nbsp;
      <button style={activeButton === 'inactive' ? activeButtonStyles : inactiveButtonStyles} onClick={handleInactiveButtonClick}>
        Closed Jobs
      </button>
                  
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
                  {jobs.map((job) => (
                     <div className={`features-job cl2 bg-white ${job.status.toLowerCase() === 'inactive' ? 'inactive-job' : ''}`} key={job.id}>
                      
                      <div className="job-archive-header">
                        <div className="inner-box">
                          {/* <div className="logo-company">
                            {job.logoFile ? (
                              <img src={`data:image/png;base64,${job.logoFile}`} alt="Company Logo" />
                            ) : (
                              <img src={logoCompany1} alt={`Default Company Logo ${job.id}`} />
                            )}
                          </div>*/}
                          <div className="box-content">
                            {/* <h4>
                              <a>{job.companyname}</a>
                            </h4> */}
                            <h3>
                              <a>{job.jobTitle}</a>
                            </h3>
                            <ul>
                              <li>
                                <span className="icon-map-pin"></span>
                                &nbsp;{job.location}
                              </li>
                              {/* <li>
                                <span className="icon-calendar"></span>
                                 &nbsp;{formatDate(job.creationDate)}
                              </li> */}
                            </ul>
                            {/* <span class="tog-but">
                            <Toggle
                        checked={job.status.toLowerCase() === 'active'}
                        onChange={(e) => {
                          const newStatus = e.target.checked ? 'active' : 'inactive';
                          handleStatusChange(job.id, newStatus);
                        }}
                        icons={false}
                       // disabled={loading || job.status === 'Inactive'}
                      /><br />
                      <span style={{color:'#656060'}}>{job.status}</span>
                            </span> */}
                          </div>
                        </div>
                      </div>
                      <div className="job-archive-footer">
                        <div className="job-footer-left">
                          <ul className="job-tag">
                            <li>
                              <a href="javascript:void(0);" onClick={(e) => { e.preventDefault(); }}>{job.employeeType}</a>
                            </li>
                            <li>
                              <a href="javascript:void(0);" onClick={(e) => { e.preventDefault(); }}>{job.remote ? 'Remote' : 'Office-based'}</a>
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
<span style={{fontSize:'12px'}}>Posted on {formatDate(job.creationDate)}</span></span>
                          </div>

                           {/* <div style={{marginTop:'8px',marginLeft:'25px'}}>
                          <Link to={`/recruiter-edit-job/${job.id}`}>
                            <img src={editlogo}  title="Edit Job" />&nbsp;
                            <span style={{fontSize:'15px',color:'#656060'}}>Edit</span>
                          </Link>


                          </div> */}

                          <Link to={`/recruiter-view-job`} className="custom-link">
                            <button
                              onClick={() => setSelectedJobId(job.id)}
                              type="button"
                              // style={{
                              //   backgroundColor: job.status === 'Inactive' ? '#f2f2f2' : '',
                              //   color: job.status === 'Inactive' ? '#808080' : ''
                              // }}
                              className={`button-status ${job.status === 'Inactive' ? 'disabled-button' : ''}`}
                              // disabled={job.status === 'Inactive'}
                            >
                              View Job Details
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RecruiterJobOpenings;
