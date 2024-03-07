import React, { useState,useEffect } from "react";
import ApplicantAPIService,{ apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import axios from 'axios';
import clearJWTToken from '../common/clearJWTToken';
import { Link } from 'react-router-dom';
import $ from 'jquery';

function RecruiterNavBar() {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const { user } = useUserContext();
  const [imageSrc, setImageSrc] = useState('');
  const [alertCount, setAlertCount] = useState(1);
 
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
    fetch(`${apiUrl}/recruiters/companylogo/download/${user.id}`, {
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
    
     const confirm = window.confirm("Do you want to log out?");
     console.log("confirm is:",confirm);
     if(confirm===true){
       clearJWTToken();
         window.location.href = "/";
     }else {
     }
 }
 const handleToggleMenu = () => {
  console.log("function called..")
  setIsOpen(!isOpen);
};

const fetchAlertCount = async () => {
  try {
    const response = await axios.get(`${apiUrl}/recuriters/appledjobs/${user.id}/unread-alert-count`);
    setAlertCount(response.data);
    window.location.reload();
  } catch (error) {
    console.error('Error fetching alert count:', error);
  }
};
useEffect(() => {
  const fetchAlertCount = async () => {
    try {
      const response = await axios.get(`${apiUrl}/recuriters/appledjobs/${user.id}/unread-alert-count`, {
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
          <a href="/recruiterhome">
            <img className="site-logo" src="../images/logo.png" alt="Image" />
          </a>
        </div>
        <a className="title-button-group">
          <i className="icon-close" />
        </a>
      </div>
      <div className="header-customize-item button">
        <a href="/recruiter-postjob">Post Job</a>
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
                <a href="/recruiterhome">
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
                <h4>Welcome {user.username}</h4>
                  <div className="sub-account-item">
                    <a href="/recruiter-change-password">
                      <span className="icon-change-passwords" /> Change
                      Password
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
      <span className="hamburger-icon" onClick={handleToggleMenu}>
        <span />
        <span />
        <span />
      </span>
    </div>
  </header>
  {(isOpen &&
  <div className="left-menu">
      <div id="sidebar-menu">
        <ul className="downmenu list-unstyled" id="side-menu">
          <li>
            <Link to="/recruiterhome" className="tf-effect">
              <span className="icon-dashboard dash-icon"></span>
              <span className="dash-titles">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/recruiter-postjob" className="tf-effect">
              <span className="icon-work dash-icon"></span>
              <span className="dash-titles">Post Job</span>
            </Link>
          </li>
          <li>
            <Link to="/recruiter-jobopenings" className="tf-effect">
              <span className="icon-submit dash-icon"></span>
              <span className="dash-titles">Job Openings</span>
            </Link>
          </li>
          <li>
            <Link to="/recruiter-allapplicants" className="tf-effect">
              <span className="icon-applicant dash-icon"></span>
              <span className="dash-titles">Applicants</span>
            </Link>
          </li>
          <li>
            <Link to="/recruiter-applicantinterviews" className="tf-effect">
              <span className="icon-chat dash-icon"></span>
              <span className="dash-titles">Interviews</span>
            </Link>
          </li>
          {/* <li>
            <Link to="/recruiter-team-member" className="tf-effect">
              <span className="icon-meeting dash-icon"></span>
              <span className="dash-titles">Team Members</span>
            </Link>
          </li> */}
          <li>
          <Link to="/job-applicant-alerts" className="tf-effect" onClick={fetchAlertCount}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span className="icon-bell1 dash-icon">
            <sup
              style={{
                background: '#121212',
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
        <span className="dash-titles">Alerts</span>
      </Link>
      </li>
          <li>
            <Link to="/recruiter-my-organization" className="tf-effect">
              <span className="icon-mypackage dash-icon"></span>
              <span className="dash-titles">My Organization</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )}
</div>
  )
}
export default RecruiterNavBar;
