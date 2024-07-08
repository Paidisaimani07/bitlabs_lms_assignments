import React from 'react'
import { useState, useEffect } from 'react';
import axios from "axios";
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useNavigate } from "react-router-dom";
import { Link, useLocation } from 'react-router-dom';
import Postjobimg from '../../images/user/avatar/Postjobimg.png';



function RecruiterDashboard() {
    const [token, setToken] = useState('');
    const { user } = useUserContext();
    const [contActiveJobs, setActiveCountJobs] = useState(0);
    const [contJobApplicants, setJobApplicants] = useState(0);
    const [contJobHires, setJobHires] = useState(0);
    const [countInterviews, setInterviews] = useState(0);
    const [applicants, setApplicants] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        }
        axios
            .get(`${apiUrl}/job/recruiterscountjobs/${user.id}`)
            .then((response) => {
                setActiveCountJobs(response.data);
            })
            .catch((error) => {
                console.error('Error fetching team members:', error);
            });
    }, [user.id]); 
    useEffect(() => {
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        }
        axios
            .get(`${apiUrl}/applyjob/recruiters/applyjobapplicantscount/${user.id}`)
            .then((response) => {
                setJobApplicants(response.data);
            })
            .catch((error) => {
                console.error('Error fetching team members:', error);
            });
    }, [user.id]);

    useEffect(() => {
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        }
        axios
            .get(`${apiUrl}/applyjob/recruiters/selected/count`)
            .then((response) => {
                setJobHires(response.data);
            })
            .catch((error) => {
                console.error('Error fetching team members:', error);
            });
    }, [user.id]);

    useEffect(() => {
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        }
        axios
            .get(`${apiUrl}/applyjob/recruiters/countShortlistedAndInterviewed/${user.id}`)
            .then((response) => {
                setInterviews(response.data);
            })
            .catch((error) => {
                console.error('Error fetching team members:', error);
            });
    }, [user.id]);

    useEffect(() => {
        const storedToken = localStorage.getItem('jwtToken');
        if (storedToken) {
          setToken(storedToken);
        }
      }, []);

      useEffect(() => {
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        }
        axios
        .get(`${apiUrl}/applyjob/recruiter/${user.id}/interviews/Interviewing`)
          .then((response) => {
            setApplicants(response.data);
          })
          .catch((error) => {
            console.error('Error fetching job details:', error);
          });
      }, []);

      const todayApplicants = applicants.filter(applicant => {
        const [year, month, day, hour, minute] = applicant.timeAndDate;
        const interviewTimestamp = new Date(year, month - 1, day, hour, minute).getTime();
        const todayTimestamp = new Date().setHours(0, 0, 0, 0);
        return interviewTimestamp >= todayTimestamp && interviewTimestamp < todayTimestamp + 24 * 60 * 60 * 1000;
      });
      const jobopenings = () => {
    
        navigate("/recruiter-jobopenings");
      };
      const allapplicants = () => {
        navigate("/recruiter-allapplicants");
      };
      const interviews = () => {
        navigate("/recruiter-applicantinterviews");
      };
      const Postajob = () => {
        navigate("/recruiter-postjob");
      };
      const handleMouseEnter = () => {
        setIsHovered(true);
      };
    
      const handleMouseLeave = () => {
        setIsHovered(false);
      };

  return (
    <div>
<div className="dashboard__content">
  <section className="page-title-dashboard">
    <div className="themes-container">
      <div className="row">
        <div className="col-lg-12 col-md-12 ">
          <div className="title-dashboard">
            <div className="title-dash flex2">Dashboard</div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section className="flat-icon-dashboard">
    <div className="themes-container">
      <div className="row">
        <div className="col-lg-12 col-md-12 ">
          <div className="wrap-icon widget-counter">
            <div className="box-icon wrap-counter flex" onClick={jobopenings}>
              <div className="icon style1">
                <span className="icon-bag">
                  <svg
                    width={49}
                    height={43}
                    viewBox="0 0 49 43"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M25.6562 29.5312C26.4328 29.5312 27.0625 28.9016 27.0625 28.125V22.5C27.0625 21.7235 26.4331 21.0938 25.6562 21.0938H22.8438C22.0672 21.0938 21.4375 21.7232 21.4375 22.5V28.125C21.4375 28.9015 22.0671 29.5312 22.8438 29.5312H25.6562Z"
                      fill="#504CFE"
                    />
                    <path
                      d="M44.0312 5.625H34.0938C34.0938 5.34178 34.0938 3.93553 34.0938 4.21875C34.0938 1.89244 32.2014 0 29.875 0C29.5697 0 18.2073 0 18.625 0C16.2987 0 14.4062 1.89234 14.4062 4.21875C14.4062 4.50197 14.4062 5.90822 14.4062 5.625H4.46875C2.14244 5.625 0.25 7.51734 0.25 9.84375C0.25 12.5978 0.5875 15.0097 1.25763 17.0652C1.92775 19.1207 2.93059 20.8198 4.26137 22.1484C6.50078 24.3848 9.35322 25.3125 12.5561 25.3125H18.625C18.625 25.0293 18.625 22.2168 18.625 22.5C18.625 20.1737 20.5173 18.2812 22.8438 18.2812C23.127 18.2812 25.9395 18.2812 25.6562 18.2812C27.9826 18.2812 29.875 20.1736 29.875 22.5C29.875 22.7832 29.875 25.5957 29.875 25.3125H32.9996C35.799 25.1962 40.378 26.0474 44.2372 22.2061C45.5687 20.8808 46.5718 19.1787 47.2422 17.1136C47.9126 15.0485 48.25 12.6205 48.25 9.84375C48.25 7.51744 46.3577 5.625 44.0312 5.625ZM17.2188 4.21875C17.2188 3.44287 17.849 2.8125 18.625 2.8125H29.875C30.6509 2.8125 31.2812 3.44278 31.2812 4.21875C31.2812 4.50197 31.2812 5.90822 31.2812 5.625H17.2188C17.2188 5.34178 17.2188 3.93553 17.2188 4.21875Z"
                      fill="#504CFE"
                    />
                    <path
                      d="M33.038 28.1219H29.875C29.875 30.4482 27.9827 32.3406 25.6562 32.3406C25.373 32.3406 22.5605 32.3406 22.8438 32.3406C20.5174 32.3406 18.625 30.4483 18.625 28.1219C18.3037 28.1219 12.2211 28.1219 12.5684 28.1219C8.55737 28.1219 5.03434 26.8911 2.27416 24.1353C1.49444 23.3568 0.828625 22.4804 0.25 21.543V40.7781C0.25 41.5554 0.878969 42.1844 1.65625 42.1844H46.8438C47.621 42.1844 48.25 41.5554 48.25 40.7781V21.6008C47.6636 22.5525 46.9951 23.4269 46.2216 24.197C41.7843 28.6111 37.0588 27.9319 33.038 28.1219Z"
                      fill="#504CFE"
                    />
                  </svg>
                </span>
              </div>
              <div className="content">
              <h3>{contActiveJobs}</h3>
              <h4
        className="title-count"
        onClick={jobopenings}
        style={{ cursor: "pointer" }}
      >
        Active Jobs
      </h4>
               
              </div>
            </div>
            <div className="box-icon wrap-counter flex" onClick={allapplicants}>
              <div className="icon style2">
                <span className="icon-bag">
                  <svg
                    width={45}
                    height={45}
                    viewBox="0 0 45 45"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M27.3902 35.2336C32.1362 35.2336 35.9836 31.3862 35.9836 26.6402C35.9836 21.8943 32.1362 18.0469 27.3902 18.0469C22.6443 18.0469 18.7969 21.8943 18.7969 26.6402C18.7969 31.3862 22.6443 35.2336 27.3902 35.2336Z"
                      fill="#EB4D4D"
                    />
                    <path
                      d="M43.9986 39.6008L36.9017 32.5039C35.9862 33.9834 34.7354 35.2343 33.2559 36.1498L40.3528 43.2467C41.3596 44.2535 42.9919 44.2535 43.9986 43.2467C45.0054 42.2399 45.0054 40.6076 43.9986 39.6008Z"
                      fill="#EB4D4D"
                    />
                    <path
                      d="M9.34021 3.17984C9.34021 2.28893 8.26307 1.84277 7.6331 2.47273L3.20906 6.89677C2.5791 7.52674 3.02526 8.60388 3.91617 8.60388H8.34021C8.89249 8.60388 9.34021 8.15617 9.34021 7.60388V3.17984Z"
                      fill="#EB4D4D"
                    />
                    <path
                      d="M8.48438 22.3436H17.0782C17.7802 20.6653 18.8801 19.1935 20.2597 18.0469H8.48438V22.3436Z"
                      fill="#EB4D4D"
                    />
                    <path
                      d="M16.3503 24.9207H7.19502C6.48314 24.9207 5.90601 24.3436 5.90601 23.6317V16.757C5.90601 16.0452 6.48314 15.468 7.19502 15.468H27.3894C29.98 15.468 32.3671 16.3545 34.2641 17.8398V3.86701C34.2641 1.73474 32.5293 0 30.3971 0H11.9214V9.88236C11.9214 10.5942 11.3442 11.1714 10.6324 11.1714H0.75V40.131C0.75 42.2632 2.48474 43.998 4.61701 43.998H30.3971C32.317 43.998 33.9138 42.5913 34.213 40.7548L30.7516 37.2933C29.6899 37.629 28.5606 37.8108 27.3894 37.8108C24.6812 37.8108 22.1952 36.8418 20.2593 35.2328H7.19502C6.48314 35.2328 5.90601 34.6556 5.90601 33.9437C5.90601 33.2319 6.48314 32.6547 7.19502 32.6547H17.9795C17.4687 31.8585 17.0569 30.9932 16.7599 30.0767H7.19502C6.48314 30.0767 5.90601 29.4996 5.90601 28.7877C5.90601 28.0759 6.48314 27.4987 7.19502 27.4987H16.2508C16.1331 26.2121 16.3503 24.9207 16.3503 24.9207ZM27.8191 12.89H15.7884C15.0765 12.89 14.4994 12.3129 14.4994 11.601C14.4994 10.8892 15.0765 10.312 15.7884 10.312H27.8191C28.5309 10.312 29.1081 10.8892 29.1081 11.601C29.1081 12.3129 28.5309 12.89 27.8191 12.89ZM27.8191 7.73402H15.7884C15.0765 7.73402 14.4994 7.15689 14.4994 6.44502C14.4994 5.73314 15.0765 5.15601 15.7884 5.15601H27.8191C28.5309 5.15601 29.1081 5.73314 29.1081 6.44502C29.1081 7.15689 28.5309 7.73402 27.8191 7.73402Z"
                      fill="#EB4D4D"
                    />
                  </svg>
                </span>
              </div>
              <div className="content">
              <h3>{contJobApplicants}</h3>
              <h4
        className="title-count"
        onClick={allapplicants}
        style={{ cursor: "pointer" }}
      >
        Applicants
      </h4>
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/*New Change In the Dash Board*/}
    <div className="box-icon1 wrap-counter" style={{ display: "flex", alignItems: "center", marginLeft: '25px', width: '75%' }} onClick={Postajob}>
      
    <div>
    <h2 className="heading">Find the right candidate</h2>

        <div className="">
            <span className=""></span>
        </div>
        <div className="content">
           
            <h4 className="title-count1" style={{paddingRight:"80px",color: "#8D8D8D"}}>
            Get access to certified entry-level candidates for your hiring requirements.
            </h4>
            
        </div>
        
        <Link
  to="/recruiter-postjob"style={{ backgroundColor: isHovered ? '#ea670c' : '#f97316' }}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
  className={`button-link ${location.pathname === "/recruiter-postjob" ? "tf-effect active" : ""}`}
>
            <span className=""></span>
            <span
      className="button button-custom"
      
    >
      Post <span className="lowercase">a</span> Job
    </span>

        </Link>
    </div>
    
    <img 
  src={Postjobimg}
  alt="Post Job Image"
  className='Post-Job-Image'
  width="200"
  height="300"
/>
</div>


  </section>
 
      <br />

<br />
</div>




    </div>
  )
}

export default RecruiterDashboard;
function formatDateTime(dateTimeArray) {
  const [year, month, day, hour, minute] = dateTimeArray;
  const formattedDate = new Date(year, month - 1, day).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date(year, month - 1, day, hour, minute).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
 
  return `${formattedDate} ${formattedTime}`;
}