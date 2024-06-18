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
import axios from "axios";
import { Switch } from 'antd';
import logos from '../../images/profileIcon.svg';
import ModalWrapper from './ModalWrapper';
import Button from '@mui/material/Button';

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
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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

  // const handleProfileImageError = (event) => {
  //   // Reset the image source to trigger a reload
  //   event.target.src = `data:image/svg+xml,
  //     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  //       <g clip-path="url(#clip0_341_8986)">
  //         <path d="M32 16C32 21.0701 29.6418 25.5894 25.9621 28.5207C23.229 30.6988 19.7664 32 16 32C12.2336 32 8.77097 30.6988 6.03788 28.5207C2.35823 25.5894 0 21.0701 0 16C0 7.16354 7.16354 0 16 0C24.8365 0 32 7.16354 32 16Z" fill="#D6D9DC"/>
  //         <path d="M16.0001 19.1504C19.7146 19.1504 22.7257 16.1392 22.7257 12.4248C22.7257 8.71028 19.7146 5.6991 16.0001 5.6991C12.2856 5.6991 9.27441 8.71028 9.27441 12.4248C9.27441 16.1392 12.2856 19.1504 16.0001 19.1504Z" fill="#5F5F5F"/>
  //         <path d="M25.9623 28.5207C23.2292 30.6987 19.7666 31.9999 16.0002 31.9999C12.2338 31.9999 8.77118 30.6987 6.03809 28.5207C7.33189 24.2453 11.3025 21.1327 16.0002 21.1327C20.6979 21.1327 24.6685 24.2453 25.9623 28.5207Z" fill="#5F5F5F"/>
  //       </g>
  //       <defs>
  //         <clipPath id="clip0_341_8986">
  //           <rect width="32" height="32" fill="white"/>
  //         </clipPath>
  //       </defs>
  //     </svg>`;
  // };

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
    if (hamburgerClass === 'fa fa-bars') {
      setHamburgerClass('fa fa-arrow-left');
    } else {
      setHamburgerClass('fa fa-bars');
    }
  };

//   const handleToggleMenu = e => {
//     e.stopPropagation();
//     setIsOpen(prevIsOpen => {
//         const newIsOpen = !prevIsOpen;
//         setHamburgerClass(newIsOpen ? 'fa fa-arrow-left' : 'fa fa-bars');
//         return newIsOpen;
//     });
// };
  const hideMenu = e => {
    e.stopPropagation(); // Stop event propagation
    setIsOpen(window.innerWidth >= 1302);
    setHamburgerClass('fa fa-bars');
  };

  useEffect(() => {
    const handleResize = () => {
      setHamburgerClass('fa fa-bars');
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
    whiteSpace: 'nowrap', // Ensures the name is displayed on a single line
  };

  const linkStyle = {
    textDecoration: 'none',
    color: 'inherit', // Inherit color from parent
    transition: 'color 0.3s', // Smooth transition for color change
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
                  <div style={{ position: 'relative', display: 'inline-block', marginTop: '10px', marginRight: '22px' }}>
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

                    <div id="specificDiv" className="header-customize-item account">
                      {/* <h4 className="username-text">{profileData && profileData.basicDetails && profileData.basicDetails.firstName !== null ? profileData.basicDetails.firstName : user.username}</h4> */}
                      <h4 className="username-text" >{(profileData && profileData.basicDetails && profileData.basicDetails.firstName !== null) ? profileData.basicDetails.firstName : ''}</h4>
                    <img width="32px" height="32px" src={imageSrc || '../images/user/avatar/image-01.jpg'} alt="Profile" onClick={toggleSubAccount} onError={() => setImageSrc('../images/user/avatar/image-01.jpg')} />

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
      {(
        <div className={`left-menu ${isOpen ? 'open' : ''}`}>
          <div id="sidebar-menu">
            <ul className="downmenu list-unstyled" id="side-menu">
              {/* <li>
                <Link to="/applicanthome" className={location.pathname === "/applicanthome" ? "tf-effect active" : ""}>
                  <span className="icon-dashboard dash-icon"></span>
                  <span className="dash-titles">Dashboard</span>
                </Link>
              </li> */}
              <li>
              <Link onClick={hideMenu} to="/applicanthome" className={location.pathname === "/applicanthome" ? "tf-effect active" : ""}>
                <span className="dash-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
                    <path d="M10.725 7.20456C10.463 7.20456 10.2433 7.1081 10.066 6.91518C9.88867 6.72226 9.8 6.48328 9.8 6.19825V1.87386C9.8 1.58883 9.88867 1.34986 10.066 1.15694C10.2433 0.964014 10.463 0.867554 10.725 0.867554H16.625C16.887 0.867554 17.1067 0.964014 17.284 1.15694C17.4613 1.34986 17.55 1.58883 17.55 1.87386V6.19825C17.55 6.48328 17.4613 6.72226 17.284 6.91518C17.1067 7.1081 16.887 7.20456 16.625 7.20456H10.725ZM0.925 11.393C0.662833 11.393 0.443167 11.2965 0.266 11.1036C0.0886667 10.9108 0 10.6719 0 10.3867V1.87386C0 1.58883 0.0886667 1.34986 0.266 1.15694C0.443167 0.964014 0.662833 0.867554 0.925 0.867554H6.825C7.08717 0.867554 7.30683 0.964014 7.484 1.15694C7.66133 1.34986 7.75 1.58883 7.75 1.87386V10.3867C7.75 10.6719 7.66133 10.9108 7.484 11.1036C7.30683 11.2965 7.08717 11.393 6.825 11.393H0.925ZM10.725 19.9602C10.463 19.9602 10.2433 19.8637 10.066 19.6708C9.88867 19.478 9.8 19.2391 9.8 18.9539V10.4411C9.8 10.1558 9.88867 9.91687 10.066 9.72413C10.2433 9.53121 10.463 9.43475 10.725 9.43475H16.625C16.887 9.43475 17.1067 9.53121 17.284 9.72413C17.4613 9.91687 17.55 10.1558 17.55 10.4411V18.9539C17.55 19.2391 17.4613 19.478 17.284 19.6708C17.1067 19.8637 16.887 19.9602 16.625 19.9602H10.725ZM0.925 19.9602C0.662833 19.9602 0.443167 19.8637 0.266 19.6708C0.0886667 19.478 0 19.2391 0 18.9539V14.6295C0 14.3443 0.0886667 14.1053 0.266 13.9125C0.443167 13.7196 0.662833 13.6232 0.925 13.6232H6.825C7.08717 13.6232 7.30683 13.7196 7.484 13.9125C7.66133 14.1053 7.75 14.3443 7.75 14.6295V18.9539C7.75 19.2391 7.66133 19.478 7.484 19.6708C7.30683 19.8637 7.08717 19.9602 6.825 19.9602H0.925Z"/>
                  </svg>
                </span>
                <span className="dash-titles">DashBoard</span>
              </Link>
              </li>
              {/* <li>
            <Link to="/applicant-update-profile">
              <span className="icon-profile dash-icon"></span>
              <span className="dash-titles">Update Profile</span>
            </Link>
          </li> */}
              <li>
                <Link onClick={hideMenu} to="/applicant-find-jobs" className={location.pathname === "/applicant-find-jobs" || location.pathname === "/applicant-view-job" ? "tf-effect active" : ""}>
                  <span className="dash-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4.125 20.75C3.60933 20.75 3.16792 20.5664 2.80075 20.1992C2.43358 19.8321 2.25 19.3907 2.25 18.875V7.875C2.25 7.35933 2.43358 6.91792 2.80075 6.55075C3.16792 6.18358 3.60933 6 4.125 6H8.15V4.124C8.15 3.608 8.33358 3.16667 8.70075 2.8C9.06792 2.43333 9.50933 2.25 10.025 2.25H13.975C14.4907 2.25 14.9321 2.43358 15.2992 2.80075C15.6664 3.16792 15.85 3.60933 15.85 4.125V6H19.875C20.3907 6 20.8321 6.18358 21.1992 6.55075C21.5664 6.91792 21.75 7.35933 21.75 7.875V18.875C21.75 19.3907 21.5664 19.8321 21.1992 20.1992C20.8321 20.5664 20.3907 20.75 19.875 20.75H4.125ZM10.025 6H13.975V4.125H10.025V6Z"/>
                  </svg>
                  </span>
                  <span className="dash-titles">Recommended Jobs</span>
                </Link>
              </li>
              <li>
                <Link onClick={hideMenu} to="/applicant-applied-jobs" className={location.pathname === "/applicant-applied-jobs" || location.pathname.includes("/applicant-interview-status") ? "tf-effect active" : ""}>
                  <span className="dash-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18.0002 13.2C15.3002 13.2 13.2002 15.4 13.2002 18C13.2002 20.6 15.4002 22.8 18.0002 22.8C20.6002 22.8 22.8002 20.6 22.8002 18C22.8002 15.4 20.6002 13.2 18.0002 13.2ZM21.0002 16.9L17.6002 20.3C17.5002 20.4 17.3002 20.5 17.1002 20.5C16.9002 20.5 16.7002 20.5 16.6002 20.3L15.0002 18.6C14.9002 18.5 14.8002 18.3 14.8002 18.2C14.8002 18 14.8002 17.9 15.0002 17.7C15.1002 17.6 15.3002 17.5 15.4002 17.5C15.5002 17.5 15.7002 17.5 15.8002 17.7L17.1002 19L20.1002 16C20.2002 15.9 20.4002 15.8 20.5002 15.8C20.7002 15.8 20.8002 15.8 20.9002 16C21.0002 16.2 21.1002 16.3 21.1002 16.4C21.1002 16.5 21.1002 16.7 20.9002 16.8L21.0002 16.9Z" fill="#929698"/>
                    <path d="M10.0002 5.99995H14.0002V4.09995H10.0002V5.99995ZM4.1002 20.7C3.6002 20.7 3.1002 20.5 2.8002 20.1C2.5002 19.7 2.2002 19.2999 2.2002 18.7999V7.89995C2.2002 7.39995 2.4002 6.89995 2.8002 6.59995C3.2002 6.19995 3.6002 5.99995 4.1002 5.99995H8.1002V4.09995C8.1002 3.59995 8.3002 3.09995 8.7002 2.79995C9.1002 2.39995 9.5002 2.19995 10.0002 2.19995H14.0002C14.5002 2.19995 15.0002 2.39995 15.3002 2.79995C15.7002 3.19995 15.9002 3.59995 15.9002 4.09995V5.99995H19.9002C20.4002 5.99995 20.9002 6.19995 21.2002 6.59995C21.6002 6.99995 21.8002 7.39995 21.8002 7.89995V11.2C21.8002 11.5 21.7002 11.7 21.4002 11.8C21.1002 11.9 20.9002 12 20.6002 11.8C20.2002 11.6 19.8002 11.5 19.3002 11.4C18.9002 11.4 18.4002 11.3 18.0002 11.3C16.1002 11.3 14.6002 12 13.3002 13.3C12.0002 14.6 11.3002 16.2 11.3002 18C11.3002 19.8 11.3002 18.5 11.3002 18.7999C11.3002 19.0999 11.3002 19.4 11.5002 19.6C11.5002 19.9 11.5002 20.1 11.4002 20.4C11.2002 20.6 11.0002 20.7 10.8002 20.7H4.2002H4.1002Z"/>
                    </svg>
                  </span>                  
                  <span className="dash-titles">Applied Jobs</span>
                </Link>
              </li>
              <li>
                <Link onClick={hideMenu} to="/applicant-saved-jobs" className={location.pathname === "/applicant-saved-jobs" ? "tf-effect active" : ""}>
                  <span className="dash-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M10.3512 19.2188L6.40219 20.91C5.83169 21.1544 5.29078 21.1086 4.77945 20.7728C4.26828 20.4371 4.0127 19.9634 4.0127 19.3515V7.29254C4.0127 6.82004 4.1787 6.41787 4.5107 6.08604C4.84253 5.75404 5.24478 5.58804 5.71745 5.58804H14.9849C15.4574 5.58804 15.8597 5.75404 16.1917 6.08604C16.5237 6.41787 16.6897 6.82004 16.6897 7.29254V19.3515C16.6897 19.9634 16.434 20.4371 15.9227 20.7728C15.4115 21.1086 14.8707 21.1544 14.3002 20.91L10.3512 19.2188ZM19.2882 19.0755C19.0969 19.0755 18.9324 19.0079 18.7949 18.8725C18.6574 18.7374 18.5887 18.5726 18.5887 18.3783V3.99679C18.5887 3.91979 18.5566 3.84921 18.4924 3.78504C18.4283 3.72104 18.3578 3.68904 18.2809 3.68904H7.6137C7.41953 3.68904 7.25395 3.62137 7.11695 3.48604C6.98011 3.35087 6.9117 3.18612 6.9117 2.99179C6.9117 2.79762 6.98011 2.63212 7.11695 2.49529C7.25395 2.35846 7.41953 2.29004 7.6137 2.29004H18.2814C18.7551 2.29004 19.1579 2.45596 19.4897 2.78779C19.8217 3.11979 19.9877 3.52246 19.9877 3.99579V18.3783C19.9877 18.5726 19.9189 18.7374 19.7812 18.8725C19.6437 19.0079 19.4794 19.0755 19.2882 19.0755Z"/>
                    </svg>
                  </span>
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
              <li>
            <Link onClick={hideMenu} to="/applicant-resume" className={location.pathname === "/applicant-resume" ? "tf-effect active" : ""}>
              {/* <span className="icon-chat dash-icon"></span> */}
              <span className="dash-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M16.8509 15.5145C16.1272 15.5145 15.512 15.2611 15.0051 14.7543C14.4985 14.2476 14.2451 13.6324 14.2451 12.9088C14.2451 12.1883 14.4985 11.5746 15.0051 11.0678C15.512 10.5611 16.1272 10.3078 16.8509 10.3078C17.5714 10.3078 18.185 10.5611 18.6916 11.0678C19.1985 11.5746 19.4519 12.1883 19.4519 12.9088C19.4519 13.6324 19.1985 14.2476 18.6916 14.7543C18.185 15.2611 17.5714 15.5145 16.8509 15.5145ZM8.96139 19.4605V20.298H5.39289C4.91806 20.298 4.51414 20.1311 4.18114 19.7973C3.84814 19.4634 3.68164 19.0614 3.68164 18.5913V5.38851C3.68164 4.91834 3.84856 4.51635 4.18239 4.18251C4.51622 3.84868 4.91822 3.68176 5.38839 3.68176H18.6114C19.0816 3.68176 19.4836 3.84868 19.8174 4.18251C20.1512 4.51635 20.3181 4.91834 20.3181 5.38851V9.62126C19.8866 9.11993 19.3794 8.73176 18.7964 8.45676C18.2134 8.18176 17.5809 8.03751 16.8989 8.02401C16.8541 8.02401 16.8124 8.0256 16.7739 8.02876C16.7354 8.0321 16.6937 8.03693 16.6489 8.04326V8.01451C16.6086 7.84751 16.5286 7.71443 16.4091 7.61526C16.2898 7.51593 16.1332 7.46626 15.9394 7.46626H8.05289C7.85889 7.46626 7.69339 7.53485 7.55639 7.67201C7.41939 7.80901 7.35089 7.97293 7.35089 8.16376C7.35089 8.35776 7.41939 8.52318 7.55639 8.66001C7.69339 8.79685 7.85889 8.86526 8.05289 8.86526H14.2519C13.7909 9.14026 13.3886 9.4831 13.0451 9.89376C12.7015 10.3043 12.4354 10.7698 12.2469 11.2905H8.05289C7.85889 11.2905 7.69339 11.359 7.55639 11.496C7.41939 11.6332 7.35089 11.7971 7.35089 11.9878C7.35089 12.1818 7.41939 12.3472 7.55639 12.484C7.69339 12.621 7.85889 12.6895 8.05289 12.6895H12.0219C12.0002 13.0882 12.0278 13.4797 12.1046 13.864C12.1816 14.2483 12.3002 14.6171 12.4604 14.9703C12.4027 14.9959 12.3466 15.0199 12.2921 15.0423C12.2376 15.0648 12.1847 15.0888 12.1334 15.1145H8.05289C7.85889 15.1145 7.69339 15.183 7.55639 15.32C7.41939 15.4572 7.35089 15.6211 7.35089 15.8118C7.35089 16.0058 7.41939 16.1713 7.55639 16.3083C7.69339 16.4451 7.85889 16.5135 8.05289 16.5135H10.2969C9.87189 16.8782 9.54306 17.3204 9.31039 17.8403C9.07772 18.3603 8.96139 18.9003 8.96139 19.4605ZM12.1009 21.9663C11.8634 21.9663 11.6614 21.883 11.4949 21.7165C11.3284 21.55 11.2451 21.348 11.2451 21.1105V19.4605C11.2451 19.1793 11.3128 18.9146 11.4481 18.6663C11.5836 18.4179 11.7714 18.2205 12.0114 18.074C12.5012 17.785 12.924 17.5799 13.2796 17.4588C13.6355 17.3376 14.0948 17.2278 14.6576 17.1293C14.8351 17.1008 15.0076 17.1041 15.1749 17.1393C15.3422 17.1746 15.4836 17.2589 15.5989 17.3923L16.8509 18.951L18.0779 17.4048C18.1901 17.2644 18.3318 17.1763 18.5031 17.1405C18.6746 17.1045 18.85 17.1008 19.0291 17.1293C19.5936 17.2278 20.0524 17.3373 20.4054 17.4578C20.7584 17.5783 21.1841 17.7837 21.6826 18.074C21.923 18.2202 22.1096 18.4134 22.2426 18.6538C22.3756 18.8943 22.4454 19.1533 22.4519 19.4308V21.1105C22.4519 21.348 22.3686 21.55 22.2021 21.7165C22.0356 21.883 21.8352 21.9663 21.6009 21.9663H12.1009Z"/>
                    </svg>
                  </span>
              <span className="dash-titles">My Resume</span>
            </Link>
          </li>
              {/* <li>
<Button variant="contained" color="primary" onClick={openModal}>
        Build Your Resume
      </Button>
      <ModalWrapper isOpen={isModalOpen} onClose={closeModal} title="Build Your Resume">
        <ResumeBuilder />
      </ModalWrapper>
              </li> */}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
export default ApplicantNavBar;