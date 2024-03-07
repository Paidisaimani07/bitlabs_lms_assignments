import React, { useState, useEffect, useRef } from 'react';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';
import $ from 'jquery';
import ScheduleInterviewPopup from './ScheduleInterviewPopup';
import { useParams } from 'react-router-dom';
import RecruiterNavBar from '../recruitercomponents/RecruiterNavBar';
 
function AppliedApplicantsBasedOnJobs() {
  const [applicants, setApplicants] = useState([]);
  const { user } = useUserContext();
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedMenuOption, setSelectedMenuOption] = useState('All');
  const isMounted = useRef(true);
  const [search, setSearch] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const tableref=useRef(null);
  const { id } = useParams();
 
  const fetchAllApplicants = async () => {
   
    try {
      const response = await axios.get(`${apiUrl}/applyjob/recruiter/${user.id}/appliedapplicants/${id}`);
    const applicantsArray = Object.values(response.data).flat();
        setApplicants(applicantsArray);
        const $table= window.$(tableref.current);
          const timeoutId = setTimeout(() => {  
           $table.DataTable().destroy();
            $table.DataTable({responsive:true});
                  }, 500);
         return () => {
            isMounted.current = false;
         };
    } catch (error) {
      console.error('Error fetching applicants:', error);
    }
  };
 
  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    }
    fetchAllApplicants();
  }, [user.id]);
 
  const handleSelectChange = async (e) => {
    const newStatus = e.target.value;
    try {
      if (selectedApplicant && newStatus) {
        const applyJobId = selectedApplicant.applyjobid;
        const response = await axios.put(
          `${apiUrl}/applyjob/recruiters/applyjob-update-status/${applyJobId}/${newStatus}`
        );
        if (isMounted.current) {
          const updatedApplicants = applicants.map((application) => {
            if (application.applyjobid === applyJobId) {
              return { ...application, applicantStatus: newStatus };
            }
            return application;
          });
          setApplicants(updatedApplicants);
          setSelectedStatus(newStatus);
          setSelectedApplicant(null);
        }
        alert(`Status changed to ${newStatus}`);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
   
 return (
 
    <div  class="dashboard show ">
      <RecruiterNavBar />
      <div className="dashboard__content">
       
        <section className="page-title-dashboard">
          <div className="themes-container">
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="title-dashboard">
                  <div className="title-dash flex2">All Applicants</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="flat-dashboard-setting bg-white">
          <div className="themes-container">
            <div className="row">
              <div className="col-lg-4 col-md-4">
                <div className="dropdown-container">
                <select value={selectedStatus} onChange={handleSelectChange}>
            <option value="" disabled>
              Change Status
            </option>
            <option value="screening">Screening</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interviewing">Interviewing</option>
            <option value="selected">Selected</option>
          </select>
                </div>
              </div>
            </div>
          </div>
        </section>
 
        <section className="flat-dashboard-setting bg-white">
          <div className="themes-container">
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="profile-setting">
                <div className="table-container-wrapper">
                  <div className="table-container">
                  {Array.isArray(applicants) && applicants.length === 0 ? (
   
                          <p>No Applicants are available.</p>
                        ) : (
                    <table ref={tableref} className="responsive-table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile Number</th>
                          <th>Job Title</th>
                          <th>Applicant Status</th>
                          <th>Experience</th>
                          <th>Skill Name</th>
                          <th>Qualification</th>
                          <th>Location</th>
                        </tr>
                      </thead>
                      <tbody>
                      {Array.isArray(applicants) && applicants.map((application) => (
                          <tr key={application.email}>
                            <td>
                              <input
                                type="radio"
                                value={application.applyjobid}
                                checked={
                                  selectedApplicant &&
                                  selectedApplicant.applyjobid === application.applyjobid
                                }
                                onChange={() => setSelectedApplicant(application)}
                                name={`applicantRadio-${application.applyjobid}`}
                              />
                            </td>
                            <td>{application.name}</td>
                            <td>{application.email}</td>
                            <td>{application.mobilenumber}</td>
                            <td>{application.jobTitle}</td>
                            <td>{application.applicantStatus}</td>
                            <td>{application.minimumExperience}</td>
                            <td>{application.skillName}</td>
                            <td>{application.minimumQualification}</td>
                            <td>{application.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                        )}
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      </div>
    );
  }
  export default AppliedApplicantsBasedOnJobs;