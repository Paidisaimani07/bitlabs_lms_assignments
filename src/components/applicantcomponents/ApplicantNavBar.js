import React from 'react';
import { Link, useLocation,useNavigate } from 'react-router-dom';
import $ from 'jquery';
import 'jquery.cookie';
import 'metismenu';
import { useState, useEffect, useReducer } from "react";
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import ResumeBuilder from './ResumeBuilder';
import clearJWTToken from '../common/clearJWTToken';
import ModalLogout from '../common/ModalLogout';
import axios from "axios";
import { Switch } from 'antd';
import logos from '../../images/profileIcon.png';
import ApplicantTakeTest from './ApplicantTakeTest';
import NotificationToggleWeb from '../../notifications/NotificationToggleWeb';
import shape8 from "../../images/dashboard/mobilebanners/power.jpg";
import shape7 from "../../images/dashboard/mobilebanners/write.jpg";
import shape6 from "../../images/dashboard/mobilebanners/solar-energy.jpg";
import shape5 from "../../images/dashboard/mobilebanners/coding.jpg";
import shape3 from "../../images/dashboard/mobilebanners/score.jpg";
import shape4 from "../../images/dashboard/mobilebanners/mentoring.jpg";
import shape from "../../images/dashboard/mobilebanners/shape.jpg";
import shape2 from "../../images/dashboard/mobilebanners/curriculum-vitae.jpg";
const backgroundImage = '/images/backgrounds/power.jpg';


function ApplicantNavBar() {
  const location = useLocation();
  const hideSidebarRoutes = [];
  const [isOpen, setIsOpen] = useState(
     window.innerWidth >= 1302 &&  !hideSidebarRoutes.some(route => location.pathname.startsWith(route))
  );
  const { user } = useUserContext();
  const [imageSrc, setImageSrc] = useState('');
  const [alertCount, setAlertCount] = useState(0);
  
  const [url, setUrl] = useState('');
  const [loginUrl, setLoginUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubAccountVisible, setIsSubAccountVisible] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const id = user.id;
  const [hamburgerClass, setHamburgerClass] = useState('fa fa-bars');
  const navigate = useNavigate();
  const frompath = location.state?.from;
  const { pathname } = useLocation();

  const [showTestPopup, setShowTestPopup] = useState(false);
  const [testName, setTestName] = useState('');

  const toggleSubAccount = () => {
    setIsSubAccountVisible(!isSubAccountVisible);
  };

  useEffect(() => {
  const updateSidebarClasses = () => {
    const shouldHide = hideSidebarRoutes.some(route =>
      location.pathname === route || location.pathname.startsWith(route + "/")
    );

    if (window.innerWidth >= 1301 && !shouldHide) {
      document.body.classList.add("grid-handler");
      document.body.classList.add("hide-hamburger");
    } else {
      document.body.classList.add("close-sidebar");
      document.body.classList.remove("hide-hamburger");
    }
  };

  window.addEventListener("resize", updateSidebarClasses);

  updateSidebarClasses();

  return () => window.removeEventListener("resize", updateSidebarClasses);
}, [pathname]);

  const handleOutsideClick = (event) => {
    const accountElement = document.querySelector(".account"); 

    if (accountElement && !accountElement.contains(event.target)) {
    
      setIsSubAccountVisible(false);
    }
  };

  
  document.addEventListener("click", handleOutsideClick);



  const [requestData, setRequestData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const response = await axios.get(`${apiUrl}/applicant/getApplicantById/${user.id}`);

        
        const newData = {
          identifier: response.data.email,
          password: response.data.password
        };

        setRequestData(newData);
      } catch (error) {
        console.error('Error updating profile status:', error);
      }
    };
    fetchData();
  }, []); 


  const handleClick = () => {
    
    const apiUrl = 'http://localhost:5173/api/auth/login';

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      
      },
      body: JSON.stringify(requestData)
    };

  
    fetch(apiUrl, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        
        const loginUrl = `http://localhost:5173/auth/login?identifier=${encodeURIComponent(requestData.identifier)}&password=${encodeURIComponent(requestData.password)}`;
        window.open(loginUrl, '_blank');
       
        setLoginUrl(loginUrl);
      })
      .catch(error => {

        console.error('There was a problem with the fetch operation:', error);
      });
  };


  const handleToggleMenu = e => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (hamburgerClass === 'fa fa-bars') {
      setHamburgerClass('fa fa-arrow-left');
      document.body.classList.remove("close-sidebar");
      document.body.classList.add("grid-handler");
    } else {
      setHamburgerClass('fa fa-bars');
      document.body.classList.add("close-sidebar");
      document.body.classList.remove("grid-handler");
    }
  };


  const hideMenu = e => {
    e.stopPropagation(); 
    setIsOpen(window.innerWidth >= 1302);
    setHamburgerClass('fa fa-bars');
  };

useEffect(() => {
  const handleResize = () => {
    const shouldHide = hideSidebarRoutes.some(route =>
      pathname.startsWith(route)
    );

    if (shouldHide) {
      setIsOpen(false);
      document.body.classList.add("close-sidebar");
       document.body.classList.remove("grid-handler");
    } else {
      const open = window.innerWidth >= 1302;
      setIsOpen(open);

      if (open) {
        document.body.classList.remove("close-sidebar");
        document.body.classList.add("grid-handler");
      } else {
        document.body.classList.add("close-sidebar");
        document.body.classList.remove("grid-handler");
      }
    }

    setHamburgerClass("fa fa-bars");
  };

  window.addEventListener("resize", handleResize);
  handleResize();

  $("#left-menu-btn").on("click", function (e) {
    e.preventDefault();
    if ($("body").hasClass("sidebar-enable")) {
      $("body").removeClass("sidebar-enable");
      $.cookie("isButtonActive", "0");
    } else {
      $("body").addClass("sidebar-enable");
      $.cookie("isButtonActive", "1");
    }
    if ($(window).width() >= 1400) {
      $("body").toggleClass("show-job");
    } else {
      $("body").removeClass("show-job");
      $.cookie("isButtonActive", null);
    }
  });

  if ($.cookie("isButtonActive") == 1) {
    $("body").addClass("sidebar-enable show-job");
  }

  fetch(`${apiUrl}/applicant-image/getphoto/${user.id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
  })
   .then(response => response.blob())
    .then(blob => {
        const imageUrl = URL.createObjectURL(blob);
        setImageSrc(imageUrl);
    })
    .catch(() => {
        setImageSrc('../images/user/avatar/image-01.jpg');
    });

    return () => {
        window.removeEventListener("resize", handleResize);
        $("#left-menu-btn").off("click");
    };
}, [pathname, user.id]);

 
  const handleLogout =  () => {
    console.log('Logout button clicked'); 
    try {
       
       localStorage.removeItem('jwtToken');
       localStorage.removeItem('user');
       localStorage.removeItem('userType');
      window.location.href = "https://www.bitlabs.in/jobs";
    } catch (error) {
      console.error('Logout failed', error);
    }
  };
  
 


  useEffect(() => {
    fetchAlertCount(); 
  }, [location.key]);
  
  const fetchAlertCount = async () => {
    try {
      const response = await axios.get(`${apiUrl}/applyjob/applicants/${user.id}/unread-alert-count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      setAlertCount(response.data);
    } catch (error) {
      console.error('Error fetching alert count:', error);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await axios.get(`${apiUrl}/applicantprofile/${id}/profile-view`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        });
        setProfileData(profileResponse.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchData();
  }, []);

  const nameStyle = {
    marginRight: '5px',
    whiteSpace: 'nowrap',
  };

  const linkStyle = {
    textDecoration: 'none',
    color: 'inherit', 
    transition: 'color 0.3s', 
  };

  const handleResumeClick = () => {
    navigate('/applicant-resume-builder');
  };


  return (
    <div>
      <div className="menu-mobile-popup">
        <div className="modal-menu__backdrop" />
        <div className="widget-filter">
          <div className="mobile-header">
            <div id="logo" className="logo">
              <a href="/applicanthome">
                <img src={imageSrc || '../images/user/avatar/image-01.jpg'} alt="Profile" onError={() => setImageSrc('../images/user/avatar/image-01.jpg')} />
              </a>
            </div>
            <a className="title-button-group">
              <i className="icon-close" />
            </a>
          </div>
          <div className="header-customize-item button">
            <a href="/applicant-update-profile">Upload Resume</a>
          </div>
        </div>
      </div>
      <header id="header" className="header header-default ">
        <div className="tf-container ct2">
          <div className="row">
            <div className="col-md-12">
              <div className="sticky-area-wrap">
                <div className="header-ct-left">
                  {window.innerWidth < 2000 && (
                    <span id="hamburger" className={hamburgerClass} onClick={handleToggleMenu}></span>
                   
                  )}
                  <span style={{ width: '20px', height: '2px' }}></span>
                  <div id="logo" className="logo">
                    <a href="/applicanthome">
                      <img
                        className="site-logo"
                       
                        src={logos}
                        alt="Image"
                      />
                    </a>
                    
                  </div>
                </div>
                <div className="header-ct-center"></div>
                <div className="header-ct-right">
                  <div style={{ position: 'relative', display: 'inline-block', marginTop: '10px', marginRight: '22px' }}>
                    <Link to="/applicant-job-alerts" className={location.pathname === "/applicant-job-alerts" ? "tf-effect active" : ""}>
                     
                      <span className="fa fa-bell notify-bell">
                        {alertCount > 0 && (
                          <span class="notify-count position-absolute top-0 start-100 translate-middle badge rounded-pill">
                            {alertCount}
                            <span class="visually-hidden">unread messages</span>
                          </span>
                        )}
                      </span>
                   
                      
                    </Link>
                  </div>
                 

                    <div id="specificDiv" className="header-customize-item account">
                     
                      {/* <h4 className="username-text" >{(profileData && profileData.basicDetails && profileData.basicDetails.firstName !== null) ? profileData.basicDetails.firstName : ''}</h4> */}
                    <div className="profile-icon"><img width="32px" height="32px" src={imageSrc || '../images/user/avatar/image-01.jpg'} alt="Profile" onClick={toggleSubAccount} onError={() => setImageSrc('../images/user/avatar/image-01.jpg')} /></div>

                    <div className="toggle-subaccount-icon" onClick={toggleSubAccount}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M11.9998 14.6038C11.8844 14.6038 11.7769 14.5833 11.6773 14.5423C11.5776 14.5013 11.4851 14.4365 11.3998 14.348L6.96602 9.91451C6.82769 9.77918 6.75894 9.61601 6.75977 9.42501C6.76077 9.23401 6.83211 9.07026 6.97377 8.93376C7.11544 8.79709 7.27894 8.72876 7.46427 8.72876C7.64944 8.72876 7.81027 8.79709 7.94677 8.93376L11.9998 12.9865L16.0528 8.93376C16.1828 8.80359 16.342 8.73693 16.5305 8.73376C16.719 8.73043 16.8841 8.79709 17.0258 8.93376C17.1674 9.07026 17.2404 9.23243 17.2445 9.42026C17.2487 9.60809 17.1799 9.77284 17.0383 9.91451L12.6045 14.348C12.516 14.4365 12.4219 14.5013 12.3223 14.5423C12.2226 14.5833 12.1151 14.6038 11.9998 14.6038Z"
                          fill="#5F6368"
                        />
                      </svg>
                    </div>

                    <div className={`sub-account ${isSubAccountVisible ? 'show' : ''}`}>

                     
                      <div className="sub-account-item">
                        <a href="/applicant-view-profile">
                          <span className="icon-profile" />View Profile
                        </a>
                      </div>
                      <div className="sub-account-item">
                        <a href="/applicant-change-password">
                          <span className="icon-change-passwords" /> Change Password
                        </a>
                      </div>
                       <div className="sub-account-item">

                                      <NotificationToggleWeb className="icon-change-passwords"/>
                                               </div>
                      <div className="sub-account-item">
                        
                         <a onClick={() => setShowModal(true)}><span className="icon-log-out" /> Log Out </a>
                         
                        
                      </div>
                    </div>
                  </div>
                </div>
              
              </div>
            </div>
          </div>
        </div>
       
      </header>
      {(
        <div className={`left-menu ${isOpen ? 'open' : ''}`}>
          <div id="sidebar-menu">
            <ul className="downmenu list-unstyled" id="side-menu">
             
              <li>
              <Link onClick={hideMenu} to="/applicanthome" className={location.pathname === "/applicanthome" ? "tf-effect active" : ""}>
  <span className="dash-icon" style={{ marginRight: "15px", display: 'flex', alignItems: 'center' }}>
    <img 
  src={shape} 
  alt="Dashboard Icon" 
  width="24" 
  height="24" 
/>
  </span>
  <span className="dash-titles">Dashboard</span>
</Link>
              </li>
             
              {/* <li>
                <Link onClick={hideMenu} to="/applicant-find-jobs" className={location.pathname === "/applicant-find-jobs" || frompath === "/applicant-find-jobs" ? "tf-effect active" : ""}>
                  <span className="dash-icon" >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4.125 20.75C3.60933 20.75 3.16792 20.5664 2.80075 20.1992C2.43358 19.8321 2.25 19.3907 2.25 18.875V7.875C2.25 7.35933 2.43358 6.91792 2.80075 6.55075C3.16792 6.18358 3.60933 6 4.125 6H8.15V4.124C8.15 3.608 8.33358 3.16667 8.70075 2.8C9.06792 2.43333 9.50933 2.25 10.025 2.25H13.975C14.4907 2.25 14.9321 2.43358 15.2992 2.80075C15.6664 3.16792 15.85 3.60933 15.85 4.125V6H19.875C20.3907 6 20.8321 6.18358 21.1992 6.55075C21.5664 6.91792 21.75 7.35933 21.75 7.875V18.875C21.75 19.3907 21.5664 19.8321 21.1992 20.1992C20.8321 20.5664 20.3907 20.75 19.875 20.75H4.125ZM10.025 6H13.975V4.125H10.025V6Z"/>
                  </svg>
                  </span>
                  <span className="dash-titles" >Myjobs</span>
                </Link>
              </li> */}
              <li>
                {/* <Link onClick={hideMenu} to="/applicant-applied-jobs" className={location.pathname === "/applicant-applied-jobs" || frompath === "/applicant-interview-status" || location.pathname.includes("/applicant-interview-status") ? "tf-effect active" : ""}>
                  <span className="dash-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18.0002 13.2C15.3002 13.2 13.2002 15.4 13.2002 18C13.2002 20.6 15.4002 22.8 18.0002 22.8C20.6002 22.8 22.8002 20.6 22.8002 18C22.8002 15.4 20.6002 13.2 18.0002 13.2ZM21.0002 16.9L17.6002 20.3C17.5002 20.4 17.3002 20.5 17.1002 20.5C16.9002 20.5 16.7002 20.5 16.6002 20.3L15.0002 18.6C14.9002 18.5 14.8002 18.3 14.8002 18.2C14.8002 18 14.8002 17.9 15.0002 17.7C15.1002 17.6 15.3002 17.5 15.4002 17.5C15.5002 17.5 15.7002 17.5 15.8002 17.7L17.1002 19L20.1002 16C20.2002 15.9 20.4002 15.8 20.5002 15.8C20.7002 15.8 20.8002 15.8 20.9002 16C21.0002 16.2 21.1002 16.3 21.1002 16.4C21.1002 16.5 21.1002 16.7 20.9002 16.8L21.0002 16.9Z"/>
                    <path d="M10.0002 5.99995H14.0002V4.09995H10.0002V5.99995ZM4.1002 20.7C3.6002 20.7 3.1002 20.5 2.8002 20.1C2.5002 19.7 2.2002 19.2999 2.2002 18.7999V7.89995C2.2002 7.39995 2.4002 6.89995 2.8002 6.59995C3.2002 6.19995 3.6002 5.99995 4.1002 5.99995H8.1002V4.09995C8.1002 3.59995 8.3002 3.09995 8.7002 2.79995C9.1002 2.39995 9.5002 2.19995 10.0002 2.19995H14.0002C14.5002 2.19995 15.0002 2.39995 15.3002 2.79995C15.7002 3.19995 15.9002 3.59995 15.9002 4.09995V5.99995H19.9002C20.4002 5.99995 20.9002 6.19995 21.2002 6.59995C21.6002 6.99995 21.8002 7.39995 21.8002 7.89995V11.2C21.8002 11.5 21.7002 11.7 21.4002 11.8C21.1002 11.9 20.9002 12 20.6002 11.8C20.2002 11.6 19.8002 11.5 19.3002 11.4C18.9002 11.4 18.4002 11.3 18.0002 11.3C16.1002 11.3 14.6002 12 13.3002 13.3C12.0002 14.6 11.3002 16.2 11.3002 18C11.3002 19.8 11.3002 18.5 11.3002 18.7999C11.3002 19.0999 11.3002 19.4 11.5002 19.6C11.5002 19.9 11.5002 20.1 11.4002 20.4C11.2002 20.6 11.0002 20.7 10.8002 20.7H4.2002H4.1002Z"/>
                    </svg>
                  </span>                  
                  <span className="dash-titles">Applied Jobs</span>
                </Link> */}
              </li>
              <li>
                {/* <Link onClick={hideMenu} to="/applicant-saved-jobs" className={location.pathname === "/applicant-saved-jobs" || frompath==="/applicant-saved-jobs" ? "tf-effect active" : ""}>
                  <span className="dash-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M10.3512 19.2188L6.40219 20.91C5.83169 21.1544 5.29078 21.1086 4.77945 20.7728C4.26828 20.4371 4.0127 19.9634 4.0127 19.3515V7.29254C4.0127 6.82004 4.1787 6.41787 4.5107 6.08604C4.84253 5.75404 5.24478 5.58804 5.71745 5.58804H14.9849C15.4574 5.58804 15.8597 5.75404 16.1917 6.08604C16.5237 6.41787 16.6897 6.82004 16.6897 7.29254V19.3515C16.6897 19.9634 16.434 20.4371 15.9227 20.7728C15.4115 21.1086 14.8707 21.1544 14.3002 20.91L10.3512 19.2188ZM19.2882 19.0755C19.0969 19.0755 18.9324 19.0079 18.7949 18.8725C18.6574 18.7374 18.5887 18.5726 18.5887 18.3783V3.99679C18.5887 3.91979 18.5566 3.84921 18.4924 3.78504C18.4283 3.72104 18.3578 3.68904 18.2809 3.68904H7.6137C7.41953 3.68904 7.25395 3.62137 7.11695 3.48604C6.98011 3.35087 6.9117 3.18612 6.9117 2.99179C6.9117 2.79762 6.98011 2.63212 7.11695 2.49529C7.25395 2.35846 7.41953 2.29004 7.6137 2.29004H18.2814C18.7551 2.29004 19.1579 2.45596 19.4897 2.78779C19.8217 3.11979 19.9877 3.52246 19.9877 3.99579V18.3783C19.9877 18.5726 19.9189 18.7374 19.7812 18.8725C19.6437 19.0079 19.4794 19.0755 19.2882 19.0755Z"/>
                    </svg>
                  </span>
                  <span className="dash-titles">Saved Jobs</span>
                </Link> */}
              </li>
             
              <li>
            <Link onClick={hideMenu} to="/applicant-resume" className={location.pathname === "/applicant-resume" ? "tf-effect active" : ""}>
             
              <span className="dash-icon">
                      <img 
  src={shape2} 
  alt="Dashboard Icon" 
  width="24" 
  height="24" 
/>
                  </span>
              <span className="dash-titles" style={{ textTransform: "none" }}>Build portfolio</span>
            </Link>
            {/*Verified badges */}
            <Link 
  onClick={hideMenu} 
  to="/applicant-verified-badges" 
  className={location.pathname === "/applicant-verified-badges" ? "tf-effect active" : ""}
  style={{ 
    display: 'inline-flex', 
    alignItems: 'center', 
    textDecoration: 'none', 
    marginTop: '13px' 
  }}
>
  <span 
    className="dash-icon" 
    style={{
      display: 'inline-block', 
      transition: 'fill 0.3s ease',
      marginRight: '12px',
    }}
  >
   <img 
  src={shape3} 
  alt="Dashboard Icon" 
  width="24" 
  height="24" 
/>
  </span>
  <span className="dash-titles" style={{ color: '#333', fontSize: '16px',textTransform: "none"}}>Skill validation</span>
  
</Link>
<Link 
  onClick={hideMenu} 
  to="/applicant-mentorconnect" 
  className={location.pathname === "/applicant-mentorconnect" ? "tf-effect active" : ""}
  style={{ 
    display: 'inline-flex', 
    alignItems: 'center', 
    textDecoration: 'none', 
    marginTop: '13px' 
  }}
>
  <span 
    className="dash-icon" 
    style={{
      display: 'inline-block', 
      transition: 'fill 0.3s ease',
      marginRight: '12px',
    }}
  >
    <img 
  src={shape4} 
  alt="Dashboard Icon" 
  width="24" 
  height="24" 
/>

  </span>
  <span className="dash-titles" style={{ color: '#333', fontSize: '16px',textTransform: "none" }}>Mentor sphere</span>
</Link>


<Link 
  onClick={hideMenu} 
  to="/applicant-verified-videos" 
  className={location.pathname === "/applicant-verified-videos" ? "tf-effect active" : ""}
  style={{ 
    display: 'inline-flex', 
    alignItems: 'center', 
    textDecoration: 'none', 
    marginTop: '13px' 
  }}
>
  <span 
    className="dash-icon" 
    style={{
      display: 'inline-block', 
      transition: 'fill 0.3s ease',
      marginRight: '12px',
    }}
  >
     <img 
  src={shape5} 
  alt="Dashboard Icon" 
  width="24" 
  height="24" 
/>
  </span>

  <span className="dash-titles" style={{ color: '#333', fontSize: '16px',textTransform: "none" }}>
    Tech buzz shorts
  </span>

 
</Link>

          </li>
        <li>
                <Link onClick={hideMenu} to="/applicant-hackathon" className={location.pathname === "/applicant-hackathon" || frompath === "/applicant-hackathon" || location.pathname.includes("/applicant-hackathon") ? "tf-effect active" : ""}>
                  <span className="dash-icon">
                       <img 
  src={shape6} 
  alt="Dashboard Icon" 
  width="24" 
  height="24" 
/>
                  </span>
                  <span className="dash-titles" style={{ textTransform: "none" }}>Innovation arena</span>
                </Link>
              </li>
        
 <li>
                <Link onClick={hideMenu} to="/applicant-blog-list" className={location.pathname === "/applicant-blog-list" ? "tf-effect active" : ""}>
                  <span className="dash-icon blog-icon">
                                         <img 
  src={shape7} 
  alt="Dashboard Icon" 
  width="24" 
  height="24" 
/>
                  </span>

                  <span className="dash-titles" style={{ textTransform: "none" }}>Tech vibes</span>
                </Link>
              </li>
              {/* <li>
                <Link onClick={hideMenu} to="/applicant-interview-prep" className={location.pathname === "/applicant-interview-prep" ? "tf-effect active" : ""}>
                  <span className="dash-icon" style={{ display: 'inline-block', transition: 'fill 0.3s ease', marginRight: '12px' }}>
                   <svg width="24" height="24" viewBox="0 0 400 400" fill={location.pathname === "/applicant-interview-prep" ? "#F46F16" : "#888888"} xmlns="http://www.w3.org/2000/svg" onMouseEnter={(e) => (e.currentTarget.style.fill = "#F46F16")} onMouseLeave={(e) => (e.currentTarget.style.fill = location.pathname === "/applicant-interview-prep" ? "#F46F16" : "#888888")}>
  <circle cx="200" cy="200" r="150" />
  <circle cx="200" cy="173" r="40" stroke="white" stroke-width="9" fill="none"/>
  <rect x="130" y="220" width="140" height="100" rx="60" stroke="white" stroke-width="9" fill="none"/>
  <rect x="230" y="110" width="95" height="65" rx="20" stroke="white" stroke-width="8" fill="none"/>
  <g>
    <polygon points="265,142 275,150 265,158" fill="white"/>
    <rect x="282" y="143" width="3" height="13" fill="white"/>
  </g>
</svg>

                  </span>

                  <span className="dash-titles">Ask newton</span>
                </Link>
              </li> */}
            </ul>
            
            {/* Logout Button */}
            <div style={{ marginTop: 'auto' }}>
              <div 
                onClick={() => setShowModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  // padding: '10px 15px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  margin: '0 10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.querySelector('img').style.filter = 'none';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.querySelector('img').style.filter = 'none';
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  marginRight: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                 <img 
  src={shape8} 
  alt="Dashboard Icon" 
  width="24" 
  height="24" 
/>
                  
                </div>
                <span className="dash-titles" style={{ color: '#1A1A17' }}>Logout</span>
              </div>
            </div>
            
          </div>
        </div>
      )}
                               <ModalLogout
                                       isOpen={showModal}
                                       onClose={() => setShowModal(false)}
                                       onConfirm={handleLogout}
                                    />
      
    </div>
  )
}
export default ApplicantNavBar;
