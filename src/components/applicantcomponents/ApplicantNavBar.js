import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import $ from 'jquery';
import 'jquery.cookie';
import 'metismenu';
import { useState, useEffect, useReducer } from "react";
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import ResumeBuilder from './ResumeBuilder';
import clearJWTToken from '../common/clearJWTToken';
import axios from "axios";
import { Switch } from 'antd';
 
function ApplicantNavBar() {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const { user } = useUserContext();
  const [imageSrc, setImageSrc] = useState('');
  const [alertCount, setAlertCount] = useState(0);
  const [profileStatus, setProfileStatus] = useState(true); // Define profileStatus state
  const location = useLocation();
  const [url, setUrl] = useState('');
  const [loginUrl, setLoginUrl] = useState('');
  
  
 
  const toggleProfileStatus = async checked => {
    try {
      // Make API call to update status in backend
      await axios.post(`${apiUrl}/applicant/changeStatus/${user.id}`, { isActive: checked });
      setProfileStatus(checked);
    } catch (error) {
      console.error('Error updating profile status:', error);
    }
  };
  const [requestData, setRequestData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Make API call to update status in backend
                const response = await axios.get(`${apiUrl}/applicant/getApplicantById/${user.id}`);
                
                // Construct requestData
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
      }, []); // Empty dependency array to run the effect only once
      
      
  const handleClick = () => {
    // API endpoint URL
    const apiUrl = 'http://localhost:5173/api/auth/login';

    // Options for the fetch request
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Add any other headers if needed
      },
      body: JSON.stringify(requestData)
    };

    // Make the API call
    fetch(apiUrl, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // window.location.href = `http://localhost:5173/auth/login?identifier=${encodeURIComponent(requestData.identifier)}&password=${encodeURIComponent(requestData.password)}`; 
        const loginUrl = `http://localhost:5173/auth/login?identifier=${encodeURIComponent(requestData.identifier)}&password=${encodeURIComponent(requestData.password)}`;
       window.open(loginUrl, '_blank');
        //setUrl(loginUrl);
        setLoginUrl(loginUrl);
      })
      .catch(error => {
        // Handle errors here
        console.error('There was a problem with the fetch operation:', error);
      });
  };
 
 
 
  const handleToggleMenu = e => {
    e.stopPropagation(); // Stop event propagation
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
    };
     window.addEventListener('resize', handleResize);
    $("#left-menu-btn").on("click", function(e) {
      e.preventDefault();
      if ($("body").hasClass("sidebar-enable") == true) {
        $("body").removeClass("sidebar-enable");
        $.cookie("isButtonActive", "0");
      } else {
        $("body").addClass("sidebar-enable");
        $.cookie("isButtonActive", "1");
      }
      1400 <= $(window).width()
        ? $("body").toggleClass("show-job")
        : $("body").removeClass("show-job");
      var width = $(window).width();
      if (width < 1400) {
        $.cookie('isButtonActive', null);
      }
    });
    if ($.cookie("isButtonActive") == 1) {
      $("body").addClass("sidebar-enable show-job");
    }
    fetch(`${apiUrl}/applicant-image/getphoto/${user.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    })
      .then(response => response.blob())
      .then(blob => {
        const imageUrl = URL.createObjectURL(blob);
        setImageSrc(imageUrl);
      })
      .catch(error => {
        console.error('Error fetching image URL:', error);
        setImageSrc(null);
      });
      return () => {
        window.removeEventListener('resize', handleResize);
      };
  }, [user.id]);
  const logout = () => {
    const confirmLogout = window.confirm("Do you want to logout?");
    if (confirmLogout) {
      try {
        clearJWTToken(); // Call the function here
        window.location.href = "/";
      } catch (error) {
        console.error('Logout failed', error);
      }
    }
  };
 const fetchAlertCount = async () => {
  try {
    const response = await axios.get(`${apiUrl}/applyjob/applicants/${user.id}/unread-alert-count`);
    setAlertCount(response.data);
    window.location.reload();
  } catch (error) {
    console.error('Error fetching alert count:', error);
  }
};
useEffect(() => {
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
  fetchAlertCount();
}, [user.id]);
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
              <div id="logo" className="logo">
                <a href="/applicanthome">
                  <img
                    className="site-logo"
                    src="../images/logo.png"
                    alt="Image"
                  />
                </a>
              </div>
            </div>
            <div className="header-ct-center"></div>
            <div className="header-ct-right">
               
              <div className="header-customize-item account">
               
              <img width="40px" height="30px" src={imageSrc || '../images/user/avatar/image-01.jpg'} alt="Profile" onError={() => setImageSrc('../images/user/avatar/image-01.jpg')} />
                <div className="name">
                  {/* <span className="icon-keyboard_arrow_down" /> */}
                </div>
                <div className="sub-account">
               
                  {/* <h4>Welcome {user.username}</h4> */}
                 
                  <div className="profile-status-toggle" >
                      <span style={{
                          font: '16px/28px "Plus Jakarta Sans", sans-serif',
                          fontStyle: 'normal',
                          fontVariantNumeric: 'normal',
                          fontVariantEastAsian: 'normal',
                          fontKerning: 'auto',
                          fontOpticalSizing: 'auto',
                          fontFeatureSettings: 'normal',
                          fontVariationSettings: 'normal',
                          fontWeight: 500,
                          fontSize: '16px',
                          lineHeight: '28px',
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                      }}>
                          {profileStatus ? 'Job Looking Status: Active' : 'Job Looking Status: Inactive'}
                      </span>
 
                  {/* <span style={{ fontSize: '14px', fontWeight: 'bold', verticalAlign: 'middle' }}>Job Looking Status: {profileStatus ? 'Active' : 'Inactive'}</span> */}
                      <Switch
                      checked={profileStatus}
                      onChange={toggleProfileStatus}
                      size="small" // Set the size to "small"
                      style={{ backgroundColor:'#F97316',marginLeft: '10px', width: '40px', height: '20px', borderRadius: '16px' }} />
                  </div>
               
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
                    <a onClick={logout}>
                      <span className="icon-log-out" /> Log Out
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="nav-filter">
              <div className="nav-mobile">
                <span />
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
    <div className="btn header-item " id="left-menu-btn">
    {window.innerWidth < 768 && (
            <span className="hamburger-icon" onClick={handleToggleMenu}>
              <span />
              <span />
              <span />
            </span>
          )}
    </div>
  </header>
  {(isOpen &&
  <div className="left-menu" >
      <div id="sidebar-menu">
        <ul className="downmenu list-unstyled" id="side-menu">
          <li>
            <Link to="/applicanthome"  className={location.pathname === "/applicanthome" ? "tf-effect active" : ""}>
              <span className="icon-dashboard dash-icon"></span>
              <span className="dash-titles">Dashboard</span>
            </Link>
          </li>
          {/* <li>
            <Link to="/applicant-update-profile">
              <span className="icon-profile dash-icon"></span>
              <span className="dash-titles">Update Profile</span>
            </Link>
          </li> */}
          <li>
            <Link to="/applicant-find-jobs"  className={location.pathname === "/applicant-find-jobs" || location.pathname === "/applicant-view-job" ? "tf-effect active" : ""}>
              <span className="icon-resumes dash-icon"></span>
              <span className="dash-titles">Recommended Jobs</span>
            </Link>
          </li>
          <li>
            <Link to="/applicant-applied-jobs" className={location.pathname === "/applicant-applied-jobs" || location.pathname.includes("/applicant-interview-status") ? "tf-effect active" : ""}>
              <span className="icon-my-apply dash-icon"></span>
              <span className="dash-titles">Applied Jobs</span>
            </Link>
          </li>
          <li>
            <Link to="/applicant-saved-jobs" className={location.pathname === "/applicant-saved-jobs" ? "tf-effect active" : ""}>
              <span className="icon-work dash-icon"></span>
              <span className="dash-titles">Saved Jobs</span>
            </Link>
          </li>
          <li>
      <Link to="/applicant-job-alerts" className={location.pathname === "/applicant-job-alerts" ? "tf-effect active" : ""} onClick={fetchAlertCount}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span className="icon-bell1 dash-icon">
            <sup
              style={{
                background: 'red',
                borderRadius: '50%',
                padding: '2px 5px',
                color: 'white',
                fontSize: '10px',
                textAlign: 'center',
                lineHeight: '1',
                marginLeft: '-10px',
              }}
            >
              {alertCount}
            </sup>
          </span>
        </div>
        <span className="dash-titles">Job Alerts</span>
      </Link>
    </li>
          <li>
            <Link to="/applicant-resume" className={location.pathname === "/applicant-resume" ? "tf-effect active" : ""}>
              <span className="icon-chat dash-icon"></span>
              <span className="dash-titles">My Resume</span>
            </Link>
          </li>
          <li>
          {/* <button onClick={handleClick} className="tf-effect" style={{ backgroundColor: '#F97316' }}>
    Build Your Resume
</button>
<ResumeBuilder loginUrl={loginUrl} /> */}
</li>
<li>
            <Link to="#" className={location.pathname === "/applicant-resume-builder" ? "tf-effect active" : ""}>
              <span className="icon-chat dash-icon"></span>
              <span className="dash-titles">Build Your Resume</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )}
</div>
  )
}
export default ApplicantNavBar;