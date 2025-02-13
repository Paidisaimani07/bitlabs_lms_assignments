import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../common/UserProvider";
import Spinner from "../common/Spinner";
import Snackbar from "../common/Snackbar";
import "./ApplicantFindJobs.css";
 
function ApplicantFindJobs({ setSelectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileid1, setProfileId] = useState(null);
  const [snackbars, setSnackbars] = useState([]);
  const [page, setPage] = useState(1);
  const [size] = useState(16); // Set the size of jobs per request
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1); // For total pages
  const [totalJobCount, setTotalJobCount] = useState(0); // Total jobs count
 
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const userId = user.id;
  const jwtToken = user.data.jwt;
 
  useEffect(() => {
    localStorage.setItem("jwtToken", jwtToken);
    fetchProfileId();
  }, []);
 
  const fetchProfileId = async () => {
    try {
      const profileRes = await axiosInstance.get(`${apiUrl}/applicantprofile/${userId}/profileid`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setProfileId(profileRes.data);
      fetchJobCount(); // Fetch the total job count
      fetchJobs(1, profileRes.data); // Load first page of jobs based on profile
    } catch (error) {
      console.error("Error fetching profile ID:", error);
    }
  };
 
  const fetchJobCount = async () => {
    try {
      const response = await axiosInstance.get(`${apiUrl}/recommendedjob/countRecommendedJobsForApplicant/${userId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const count = response.data; // Get total job count
      setTotalJobCount(count);
      setTotalPages(Math.ceil(count / size)); // Calculate total pages
    } catch (error) {
      console.error("Error fetching job count:", error);
    }
  };
 
  const fetchJobs = async (pageNum = 1, profileId = profileid1) => {
    setLoading(true);
    try {
      const url =
        profileId === 0
          ? `${apiUrl}/job/promote/${userId}/yes`
          : `${apiUrl}/recommendedjob/findrecommendedjob/${userId}?page=${pageNum}&size=${size}`;
 
      const response = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
 
      const newJobs = response.data;
      if (newJobs.length < size) setHasMore(false);
      setJobs(newJobs); // Set only the current page jobs
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };
 
  const handleSaveJob = async (jobId) => {
    try {
      await axiosInstance.post(`${apiUrl}/savedjob/applicants/savejob/${userId}/${jobId}`, null, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      addSnackbar({ message: "Job saved successfully.", link: "/applicant-saved-jobs", linkText: "View Saved Jobs", type: "success" });
    } catch (error) {
      console.error("Error saving job:", error);
      addSnackbar({ message: "Error saving job. Please try again later.", type: "error" });
    }
  };
 
  const addSnackbar = (snackbar) => {
    setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
  };
 
    const handleApplyNowClick = (jobId) => {
    setSelectedJobId(jobId);
    navigate('/applicant-view-job', { state: { from: location.pathname } });
  };
 
 
  const handleCloseSnackbar = (index) => {
        setSnackbars((prevSnackbars) => prevSnackbars.filter((_, i) => i !== index));
      };
 
  const handlePreviousPage = () => {
    if (page > 1) fetchJobs(page - 1);
  };
 
  const handleNextPage = () => {
    if (page < totalPages) fetchJobs(page + 1);
  };
 
  const handlePageClick = (pageNum) => {
    fetchJobs(pageNum);
  };
 
  const generatePageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };
 
  return (
    <div>
      <div className="dashboard__content">
        <div className="row mr-0 ml-10">
          <div className="col-lg-12 col-md-12">
            <section className="page-title-dashboard">
              <div className="themes-container">
                <div className="row">
                  <div className="col-lg-12 col-md-12">
                    <div className="title-dashboard">
                      <div className="title-dash flex2">{profileid1 === 0 ? "no jobs" : "Recommended Jobs"}</div>
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
                        jobs.map((job) => (
                          <div className="features-job cl2 bg-white" key={job.id} onClick={(e) => {
                            handleApplyNowClick(job.id, e);
                            setSelectedJobId(job.id);
                        }}
                         >
                            <div className="job-archive-header">
                              <div className="inner-box">
                                <div className="box-content">
                                  <h4>
                                    <a href="javascript:void(0);">{job.companyname || job?.jobRecruiter?.companyname}</a>
                                  </h4>
                                  <h3>
                                    <a href="javascript:void(0);">{job.jobTitle}</a>
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
                                    <a href="javascript:void(0);">{job.remote ? "Remote" : "Office-based"}</a>
                                  </li>
                                  <li>
                                    <a href="javascript:void(0);">Exp {job.minimumExperience} - {job.maximumExperience} years</a>
                                  </li>
                                  <li>
                                    <a href="javascript:void(0);">₹ {job.minSalary} - ₹ {job.maxSalary} LPA</a>
                                  </li>
                                </ul>
                              </div>
                              <div className="job-footer-right">
                                <div className="price">
                                  <span>
                                    <span style={{ fontSize: "12px" }}>Posted on {new Date(job.creationDate).toLocaleDateString()}</span>
                                  </span>
                                </div>
                                <ul className="job-tag">
                                  <li>
                                    <button onClick={() => handleSaveJob(job.id)} className="button-status2">
                                      Save Job
                                    </button>
                                  </li>
                                  <li>
                                  {job && (
                                        <button
                                         // onClick={() => handleApplyNowClick(job.id)}
                                          className="button-status1"
                                        >
                                          View Job
                                        </button>
                                      )}                                  </li>
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
 
              {/* Pagination Section */}
              <div className="pagination" style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", gap: "10px" }}>
  <button
    onClick={handlePreviousPage}
    className="arrow-button"
    disabled={page === 1}
    style={page === 1 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
  >
    <span aria-hidden="true">&lsaquo;</span> {/* Left Arrow */}
  </button>
 
  {/* Page Numbers */}
  {generatePageNumbers().map((number, index) => (
    <button
      key={index}
      onClick={() => handlePageClick(number)}
      className={`pagination-button ${number === page ? "active" : ""}`}
    >
      {number}
    </button>
  ))}
 
  <button
    onClick={handleNextPage}
    className="arrow-button"
    disabled={page === totalPages}
    style={page === totalPages ? { opacity: 0.5, cursor: "not-allowed" } : {}}
  >
    <span aria-hidden="true">&rsaquo;</span> {/* Right Arrow */}
  </button>
</div>
 
            </section>
          </div>
        </div>
      </div>
 
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