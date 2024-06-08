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
import logos from '../../images/logos2.png';

function ApplicantNavBar() {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1302
  );
  const { user } = useUserContext();
  const [imageSrc, setImageSrc] = useState('');
  const [alertCount, setAlertCount] = useState(0);
  //const [profileStatus, setProfileStatus] = useState(true); // Define profileStatus state
  const location = useLocation();
  const [url, setUrl] = useState('');
  const [loginUrl, setLoginUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubAccountVisible, setIsSubAccountVisible] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const id = user.id;
  const [hamburgerClass, setHamburgerClass] = useState('fa fa-bars');

  const toggleSubAccount = () => {
    setIsSubAccountVisible(!isSubAccountVisible);
  };

  // Function to handle clicks outside the account element
  const handleOutsideClick = (event) => {
    const accountElement = document.querySelector(".account"); // Assuming "account" is the class name of your account element

    if (accountElement && !accountElement.contains(event.target)) {
      // Click occurred outside the account element, hide sub-account
      setIsSubAccountVisible(false);
    }
  };

  // Event listener to detect clicks outside the account element
  document.addEventListener("click", handleOutsideClick);

  // useEffect(() => {
  //   const fetchProfileStatus = async () => {
  //     try {
  //       const response = await axios.get(`${apiUrl}/applicant/${user.id}/profilestatus`);
  //       setProfileStatus(response.data === 'active'); // Assuming the API returns 'active' or 'inactive'
  //     } catch (error) {
  //       console.error('Error fetching profile status:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProfileStatus();
  // }, [apiUrl, user.id]);

  // const toggleProfileStatus = async (checked) => {
  //   try {
  //     const authToken = localStorage.getItem('jwtToken'); // Get JWT token from local storage
  //     const response = await axios.post(
  //       `${apiUrl}/applicant/changeStatus/${user.id}`,
  //       { isActive: checked },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${authToken}`, // Add authorization header with JWT token
  //         },
  //       }
  //     );

  //     setProfileStatus(checked);
  //     localStorage.setItem('profileStatus', checked.toString());
  //     window.location.reload();
  //   } catch (error) {
  //     console.error('Error updating profile status:', error);
  //     // Rollback the change in UI if there's an error
  //     setProfileStatus(!checked);
  //   }
  // };

  const handleProfileImageError = (event) => {
    // Reset the image source to trigger a reload
    event.target.src = `data:image/svg+xml,
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
        <g clip-path="url(#clip0_341_8986)">
          <path d="M32 16C32 21.0701 29.6418 25.5894 25.9621 28.5207C23.229 30.6988 19.7664 32 16 32C12.2336 32 8.77097 30.6988 6.03788 28.5207C2.35823 25.5894 0 21.0701 0 16C0 7.16354 7.16354 0 16 0C24.8365 0 32 7.16354 32 16Z" fill="#D6D9DC"/>
          <path d="M16.0001 19.1504C19.7146 19.1504 22.7257 16.1392 22.7257 12.4248C22.7257 8.71028 19.7146 5.6991 16.0001 5.6991C12.2856 5.6991 9.27441 8.71028 9.27441 12.4248C9.27441 16.1392 12.2856 19.1504 16.0001 19.1504Z" fill="#5F5F5F"/>
          <path d="M25.9623 28.5207C23.2292 30.6987 19.7666 31.9999 16.0002 31.9999C12.2338 31.9999 8.77118 30.6987 6.03809 28.5207C7.33189 24.2453 11.3025 21.1327 16.0002 21.1327C20.6979 21.1327 24.6685 24.2453 25.9623 28.5207Z" fill="#5F5F5F"/>
        </g>
        <defs>
          <clipPath id="clip0_341_8986">
            <rect width="32" height="32" fill="white"/>
          </clipPath>
        </defs>
      </svg>`;
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
    const apiUrl = 'http://43.204.125.6:5173/api/auth/login';

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
        const loginUrl = `http://43.204.125.6:5173/auth/login?identifier=${encodeURIComponent(requestData.identifier)}&password=${encodeURIComponent(requestData.password)}`;
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
    if (hamburgerClass === 'fa fa-bars') {
      setHamburgerClass('fa fa-arrow-left');
    } else {
      setHamburgerClass('fa fa-bars');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 1302);
    };
    window.addEventListener('resize', handleResize);
    $("#left-menu-btn").on("click", function (e) {
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
  //  const fetchAlertCount = async () => {
  //   try {
  //     const response = await axios.get(`${apiUrl}/applyjob/applicants/${user.id}/unread-alert-count`);
  //     setAlertCount(response.data);
  //     //window.location.reload();
  //   } catch (error) {
  //     console.error('Error fetching alert count:', error);
  //   }
  // };
  // useEffect(() => {
  //   const fetchAlertCount = async () => {
  //     try {
  //       const response = await axios.get(`${apiUrl}/applyjob/applicants/${user.id}/unread-alert-count`, {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
  //         },
  //       });
  //       setAlertCount(response.data);
  //     } catch (error) {
  //       console.error('Error fetching alert count:', error);
  //     }
  //   };
  //   fetchAlertCount();
  // }, [user.id]);


  useEffect(() => {
    fetchAlertCount(); // Fetch alert count when component mounts
  }, []);

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

  const handleBellClick = () => {
    // Reset the alert count
    setAlertCount(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await axios.get(`${apiUrl}/applicantprofile/${id}/profile-view`);
        setProfileData(profileResponse.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchData();
  }, []);

  const nameStyle = {
    marginRight: '5px',
    whiteSpace: 'nowrap', // Ensures the name is displayed on a single line
  };

  const linkStyle = {
    textDecoration: 'none',
    color: 'inherit', // Inherit color from parent
    transition: 'color 0.3s', // Smooth transition for color change
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
                  {window.innerWidth < 1400 && (
                    <span id="hamburger" className={hamburgerClass} onClick={handleToggleMenu}></span>
                    // <div className="hamburger-icon" onClick={handleToggleMenu}>
                    //   <span />
                    //   <span />
                    //   <span />
                    // </div>
                  )}
                  <span style={{ width: '20px', height: '2px' }}></span>
                  <div id="logo" className="logo">
                    <a href="/applicanthome">
                      <img
                        className="site-logo"
                        // src="../images/logo.png"
                        // src="../../images/logos2.png"
                        src={logos}
                        alt="Image"
                      />
                    </a>
                    {/* <p className="para1">A <a href="https://www.tekworks.in/" target='_blank'><span style={{color:'#808080'}}>TekWorks</span></a> Product</p> */}
                  </div>
                </div>
                <div className="header-ct-center"></div>
                <div className="header-ct-right">
                  <div style={{ position: 'relative', display: 'inline-block', marginTop: '10px', marginRight: '30px' }}>
                    <Link to="/applicant-job-alerts" className={location.pathname === "/applicant-job-alerts" ? "tf-effect active" : ""}>
                      {/* <span className={"icon-bell1 dash-icon1" + (alertCount > 0 ? " dash-titles" : "")} onClick={handleBellClick} > */}
                      <span className="fa fa-bell notify-bell" onClick={handleBellClick}>
                        {alertCount > 0 && (
                          <span class="notify-count position-absolute top-0 start-100 translate-middle badge rounded-pill">
                            {alertCount}
                            <span class="visually-hidden">unread messages</span>
                          </span>
                        )}
                      </span>
                      {/* <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="23"
                        viewBox="0 0 18 23"
                        fill="none"
                        // onError={handleProfileImageError}
                        className={"dash-icon1" + (alertCount > 0 ? " dash-titles" : "")}
                        onClick={handleBellClick}
                      >
                        <path d="M1.21942 18.8525C0.993277 18.8525 0.801167 18.7735 0.643083 18.6154C0.485194 18.4573 0.40625 18.2651 0.40625 18.0388C0.40625 17.8125 0.485194 17.6195 0.643083 17.4598C0.801167 17.3002 0.993277 17.2204 1.21942 17.2204H2.39746V8.72733C2.39746 7.16206 2.88357 5.77664 3.85579 4.57109C4.82801 3.36553 6.07246 2.5896 7.58912 2.24329V1.56283C7.58912 1.17006 7.72592 0.838335 7.9995 0.567668C8.27308 0.296807 8.60617 0.161377 8.99875 0.161377C9.39153 0.161377 9.72519 0.296807 9.99975 0.567668C10.2741 0.838335 10.4113 1.17006 10.4113 1.56283V2.24329C11.9295 2.5896 13.1753 3.36553 14.1487 4.57109C15.1221 5.77664 15.6088 7.16206 15.6088 8.72733V17.2204H16.7836C17.0065 17.2204 17.1982 17.3004 17.3588 17.4604C17.5194 17.6203 17.5997 17.8133 17.5997 18.0397C17.5997 18.266 17.5198 18.4581 17.36 18.616C17.2001 18.7737 17.0071 18.8525 16.781 18.8525H1.21942ZM8.99817 22.025C8.42747 22.025 7.94146 21.8239 7.54012 21.4218C7.13899 21.0195 6.93842 20.5333 6.93842 19.9632H11.062C11.062 20.5353 10.8608 21.0219 10.4583 21.423C10.0557 21.8243 9.56905 22.025 8.99817 22.025Z" fill="#5F5F5F" />
                      </svg> */}
                      {/* {alertCount > 0 && (
                        <sup
                          style={{
                            // background: 'red',
                            background: '#f97316',
                            borderRadius: '50%',
                            padding: '2px 5px',
                            color: 'white',
                            fontSize: '8px',
                            textAlign: 'center',
                            lineHeight: '25px',
                            marginLeft: '-10px',
                            top: '-21px'
                          }}
                        >
                          {alertCount}
                        </sup>
                      )} */}
                      {/* </span> */}
                    </Link>
                  </div>
                  {/* <div className="name" style={nameStyle}>
        {profileData && (
          <a href="#" style={linkStyle}>{profileData.applicant.name}</a>
        )}
      </div> */}

                  {/* <h4 className="username-text">{user.username}</h4> */}

                  <div className="header-customize-item account">
                    <img width="32px" height="32px" src={imageSrc || '../images/user/avatar/image-01.jpg'} alt="Profile" onError={() => setImageSrc('../images/user/avatar/image-01.jpg')} />

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

                      {/* <h4>Welcome {user.username}</h4> */}

                      {/* <div className="profile-status-toggle">
                    <span className="job-looking-status">
                    {profileStatus ? 'Job Looking Status: Active' : 'Job Looking Status: Inactive'}
                   </span>
                    <Switch
                    checked={profileStatus}
                    onChange={toggleProfileStatus}
                    size="small"
                    style={{ backgroundColor:'#F97316',marginLeft: '10px', width: '40px', height: '20px', borderRadius: '16px' }}
                    />
                    </div> */}
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
        {/* <div className="btn header-item " id="left-menu-btn">
    {window.innerWidth < 768 && (
            <span className="hamburger-icon" onClick={handleToggleMenu}>
              <span />
              <span />
              <span />
            </span>
          )}
    </div> */}
      </header>
      {(isOpen &&
        <div className="left-menu" >
          <div id="sidebar-menu">
            <ul className="downmenu list-unstyled" id="side-menu">
              <li>
                <Link to="/applicanthome" className={location.pathname === "/applicanthome" ? "tf-effect active" : ""}>
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
                <Link to="/applicant-find-jobs" className={location.pathname === "/applicant-find-jobs" || location.pathname === "/applicant-view-job" ? "tf-effect active" : ""}>
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
                {/* <Link to="/applicant-job-alerts" className={location.pathname === "/applicant-job-alerts" ? "tf-effect active" : ""} onClick={fetchAlertCount}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                  <span className="icon-bell1 dash-icon">
                  {alertCount > 0 && (
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
)}

                    </span>
                  </div>
                  <span className="dash-titles">Job Alerts</span>
                </Link> */}
              </li>
              {/* <li>
            <Link to="/applicant-resume" className={location.pathname === "/applicant-resume" ? "tf-effect active" : ""}>
              <span className="icon-chat dash-icon"></span>
              <span className="dash-titles">My Resume</span>
            </Link>
          </li> */}
              <li>
                {/* <button onClick={handleClick} className="tf-effect" style={{ backgroundColor: '#F97316' }}>
    Build Your Resume
</button>
<ResumeBuilder loginUrl={loginUrl} /> */}
              </li>
              <li>
                <Link to="/applicant-resume-builder" className={location.pathname === "/applicant-resume-builder" ? "tf-effect active" : ""}>
                  <span className="icon-chat dash-icon"></span>
                  <span className="dash-titles">My Resume</span>
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