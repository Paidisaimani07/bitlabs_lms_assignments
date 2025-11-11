import React from "react";
import { useState, useEffect } from 'react';
import axios from "axios";
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import character3 from '../../images/dashboard/mobilebanners/Vamshi.png';
import Nagulmeera from '../../images/dashboard/mobilebanners/mentor1.png';
import Karunakar from '../../images/dashboard/mobilebanners/karun.png';
import suhel from '../../images/dashboard/mobilebanners/suhel.png';
import character4 from '../../images/dashboard/mobilebanners/ArtCard_SKY.png';
import character5 from '../../images/dashboard/mobilebanners/STK438_carbon_capture.png';
import character6 from '../../images/dashboard/mobilebanners/Windows 10 Is Dead. Upgrade to One of These Great Windows 11 Laptops.png';
import character2 from '../../images/dashboard/mobilebanners/Nagul.png';
import character1 from '../../images/dashboard/mobilebanners/lalitha.png';
import SmartPhone from "../../images/dashboard/mobilebanners/smartphone.png"
import appStoreIcon from "../../images/dashboard/mobilebanners/appstoreicon.png";
import playStore from "../../images/dashboard/mobilebanners/playstore.png";
import botImage from '../../images/dashboard/mobilebanners/Bot.png';
import characterImg from '../../images/dashboard/mobilebanners/Group.png';
import './ApplicantDashboard.css';


const ApplicantDashboard = () => {
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [contRecJobs, setCountRecJobs] = useState(0);
  const [contAppliedJob, setAppliedJobs] = useState(0);
  const [contSavedJobs, setSavedJobs] = useState(0);
  const navigate = useNavigate();
  const userId = user.id
  const [hiredCount, setHiredCount] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [mentorConnectData, setMentorConnectData] = useState();
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState(null);
  const [imageSrc, setImageSrc] = useState('../images/user/avatar/image-01.jpg');
  const [techBuzzVideos, setTechBuzzVideos] = useState([]);
  const [techBuzzLoading, setTechBuzzLoading] = useState(true);

  useEffect(() => {
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
      .catch(() => {
        setImageSrc('../images/user/avatar/image-01.jpg');
      });
  }, [user.id]);

  useEffect(() => {
    const fetchHiredCount = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await axios.get(
          `${apiUrl}/api/hiredCount/1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Hired Count Response:', response.data);

        setHiredCount(response.data);
        console.log("hired count", hiredCount)
      } catch (error) {
        console.error('Error fetching hired count:', error);
      }
    };

    fetchHiredCount();
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
  `;
    document.head.appendChild(style);
  }, []);


  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const profileIdResponse = await axios.get(`${apiUrl}/applicantprofile/${userId}/profileid`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const profileId = profileIdResponse.data;


        if (profileId === 0) {
          navigate('/applicant-basic-details-form');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching profile ID:', error);
      }
    };

    checkUserProfile();
  }, [userId, navigate]);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.get(`${apiUrl}/applicantprofile/${user.id}/profile-view`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        setProfileData(response.data);
        const newData = {
          identifier: response.data.applicant.email,
          password: response.data.applicant.password,
          localResume: response.data.applicant.localResume,
          firstName: response.data.basicDetails != null && response.data.basicDetails.firstName != null ? response.data.basicDetails.firstName : "",
          lastName: response.data.basicDetails != null && response.data.basicDetails.lastName != null ? response.data.basicDetails.lastName : ""
        };

        localStorage.setItem('userData', JSON.stringify(newData));
      } catch (error) {
        console.error('Error updating profile status:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    }
    axios
      .get(`${apiUrl}/recommendedjob/countRecommendedJobsForApplicant/${user.id}`)
      .then((response) => {
        setCountRecJobs(response.data);
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
      .get(`${apiUrl}/applyjob/countAppliedJobs/${user.id}`)
      .then((response) => {
        setAppliedJobs(response.data);
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
      .get(`${apiUrl}/savedjob/countSavedJobs/${user.id}`)
      .then((response) => {
        setSavedJobs(response.data);
      })
      .catch((error) => {
        console.error('Error fetching team members:', error);
      });
  }, [user.id]);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.get(`${apiUrl}/applicant1/tests/${user.id}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const response1 = await axios.get(`${apiUrl}/api/mentor-connect/getAllMeetings`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          }
        });
        setMentorConnectData(response1.data)

      } catch (error) {
        console.error('Error fetching test data:', error);
      }
    };

    fetchTestData();
  }, [user.id]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setBlogsLoading(true);
        const jwt = localStorage.getItem('jwtToken');
        const { data } = await axios.get(`${apiUrl}/blogs/active?size=3`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        setBlogs(data);
      } catch (err) {
        console.error(err);
        setBlogsError('Unable to load blogs');
      } finally {
        setBlogsLoading(false);
      }
    };
    fetchBlogs();
  }, []);
 useEffect(() => {
    const fetchTechBuzz = async () => {
      try {
        setTechBuzzLoading(true);
        const jwtToken = localStorage.getItem('jwtToken');
        const res = await axios.get(`${apiUrl}/videos/recommended/${user.id}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });


        const videos = (res.data || []).slice(0, 4).map(v => ({
          videoId: v.videoId,
          title: v.title,
          s3url: v.s3url,
          thumbnail_url: v.thumbnail_url,
        }));


        setTechBuzzVideos(videos);
      } catch (err) {
        console.error("Failed to load Tech Buzz videos", err);
      } finally {
        setTechBuzzLoading(false);
      }
    };


    fetchTechBuzz();
  }, [user.id]);


  const handleRedirectTechBuzz = () => {
    navigate("/applicant-verified-videos");
  };
  const handleRedirectTechVibes = () => {
    navigate("/applicant-blog-list");
  };

  const handleRedirectMentor = () => {
    navigate("/applicant-mentorconnect");
  };

  const handleRedirectResume = () => {
    navigate("/applicant-resume");
  };

  const handleRedirectHackathon = () => {
    navigate("/applicant-hackathon");
  };

  const handleRedirect3 = () => {
    navigate("/applicant-interview-prep");
  };


  return (
    <div className="border-style">

      <div className="blur-border-style"></div>
      {loading ? null : (
        <div className="dashboard__content">
          <div className="row mr-0 ml-10">
            <div className="col-lg-12 col-md-12">
              <div className="page-title-dashboard">
                <div className="title-dashboard">
                  <div
                    className="d-block d-sm-none text-white text-center p-3 overflow-hidden"
                    style={{
                      background: 'linear-gradient(90deg, #F97316 0%, #FBBC5F 100%)',
                      whiteSpace: 'nowrap',
                      position: 'relative',
                      height: '50px',
                      width: '100%',
                      overflow: 'hidden',

                    }}
                  >
                    <div
                      style={{
                        display: 'inline-block',
                        position: 'absolute',
                        whiteSpace: 'nowrap',
                        left: '100%',
                        animation: 'scrollLeft 10s linear infinite',
                      }}
                    >
                      You are only seeing 50% of the job posts. Download our mobile app to access all the job posts!
                    </div>
                    <style>{`
    @keyframes scrollLeft {
      0% { left: 100%; }
      100% { left: -100%; }
    }
  `}</style>
                  </div>

                  <div className="display-flex robo-container" >
                    <div className="card robo-card">
                      <div className="container">

                        <div className="robo-img ">
                          <span>
                            <img
                              src={botImage}
                              alt="Bot icon"
                              width="150px"
                              height="250px"
                            />
                          </span>
                        </div>

                        <div className="robo-card-text">
                          <p className="robo-card-para">
                            Any questions regrading interview assistant? <span  onClick={handleRedirect3} style={{ fontSize: "24px", fontWeight: "1200", color: "#7E3601" }}>Ask Newton!</span>
                          </p>

                          <button
                            onClick={handleRedirect3}
                          >
                            Get Started
                          </button>

                        </div>

                      </div>
                    </div>
                  </div>


                </div>
              </div>
            </div>
            <div className="col-lg-12 col-md-12">
              <div className="row dash-count profile-cards">
                <div className="profile-card-row1">
                  {/* Arena Online */}
                  <div className="arena">
                    <div className="arena-topSection">
                      <h4 >
                        Compete. Learn. Win.
                      </h4>
                      <p>Take part in Arena’s hackathons to test your coding skills and gain hands-on experience solving real problems.</p>
                      <button onClick={handleRedirectHackathon}>
                        Start Test
                      </button>
                    </div>

                    <div className="arena-image">
                      <img
                        src={characterImg}
                        alt="Character Illustration"
                      />
                    </div>

                  </div>

                  {/* MentorSphere */}
                  <div className="mentor-sphere">
                    <div className="mentor-topSection">
                      <h4 >
                        MentorSphere
                      </h4>

                      <span
                        onClick={handleRedirectMentor}
                      >
                        View more
                      </span>
                    </div>

                    <div className="mentor-heading">
                      <h4 >Mentor</h4>
                      <h4 >Technology</h4>
                      <h4 >Held on</h4>
                    </div>

                    {mentorConnectData?.items
                      ?.filter((item) => item.status === "Upcoming")
                      ?.sort((a, b) => {
                        const dateA = new Date(a.date[0], a.date[1] - 1, a.date[2], a.startTime[0], a.startTime[1]);
                        const dateB = new Date(b.date[0], b.date[1] - 1, b.date[2], b.startTime[0], b.startTime[1]);
                        return dateA - dateB;
                      })
                      ?.slice(0, 4)
                      ?.map((item, idx) => {
                        const dateObj = new Date(item.date[0], item.date[1] - 1, item.date[2]);
                        const formattedDate = dateObj.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        });
                        const hours = item.startTime[0];
                        const minutes = item.startTime[1].toString().padStart(2, "0");
                        const period = hours >= 12 ? "pm" : "am";
                        const formattedTime = `${(hours % 12) || 12}:${minutes}${period}`;

                        // Optional: default static images in order
                        const defaultImages = [Nagulmeera, Karunakar, Karunakar, suhel];
                        const defaultImg = defaultImages[idx % defaultImages.length];

                        return (
                          <div
                            key={item.meetingId}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "14px 0",
                              borderBottom: idx !== 3 ? "1px solid #f0f0f0" : "none",
                            }}
                          >
                            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                              <img
                                src={defaultImg}
                                alt={item.mentorName}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  marginRight: "12px",
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  color: "#1A1A1A",
                                }}
                              >
                                {item.mentorName}
                              </span>
                            </div>

                            <span
                              style={{
                                fontSize: "12px",
                                flex: 1,
                                textAlign: "center",
                                color: "#444",
                              }}
                            >
                              {item.title}
                            </span>

                            <span
                              style={{
                                fontSize: "12px",
                                flex: 1,
                                textAlign: "right",
                                color: "#444",
                              }}
                            >
                              {formattedDate}, {formattedTime}
                            </span>
                          </div>
                        );
                      })}

                  </div>

                  {/*  My Portfolio */}
                  <div className="portfolio">
                    <div className="portfolio-heading">
                      <h4 style={{ margin: 0, fontWeight: "700", color: "#1A1A1A" }}>
                        My portfolio
                      </h4>

                      <span

                        onClick={handleRedirectResume}
                      >
                        Explore
                      </span>
                    </div>
                    <div className="profile-side-section">
                      <div>
                         <img className="profile-image" src={imageSrc} alt="profile"   style={{
                            borderRadius: "85%",
                            width: "65px",
                            height: "65px",
                            border: "2px solid #EA7B20"
                          }} />
                        <span className="badges">
                          <img src="./images/dashboard/badge-bronze.png" alt="badge-bronze" width="15px" height="23px" />
                          <img src="./images/dashboard/badge-silver.png" alt="badge-silver" width="15px" height="23px" />
                          <img src="./images/dashboard/badge-gold.png" alt="badge-gold" width="15px" height="23px" />
                        </span>
                      </div>
                      <div className="profile-extra-details">
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="#EA7B20" stroke-linecap="round"
                            stroke-linejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2
           19.86 19.86 0 0 1-8.63-3.07
           19.5 19.5 0 0 1-6-6
           19.86 19.86 0 0 1-3.07-8.63
           A2 2 0 0 1 4.11 2h3
           a2 2 0 0 1 2 1.72c.12 1.06.37 2.09.74 3.06
           a2 2 0 0 1-.45 2.11L8.09 10.91
           a16 16 0 0 0 6 6l1.98-1.98
           a2 2 0 0 1 2.11-.45c.97.37 2 .62 3.06.74
           A2 2 0 0 1 22 16.92z" />
                          </svg>
                          <p>{profileData?.applicant?.mobilenumber}</p>
                        </span>
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="#EA7B20" stroke="white" stroke-linecap="round"
                            stroke-linejoin="round">
                            <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
                            <polyline points="22 6 12 13 2 6"></polyline>
                          </svg>
                          <p>{profileData?.applicant?.email}</p>
                        </span>
                      </div>
                      <div className="portfolio-score-details">
                        <h3>score</h3>
                        <p>325</p>
                      </div>
                    </div>
                    <h3 style={{ color: 'black', fontWeight: 'bold', margin: 0 }}>
                      {(profileData?.basicDetails && profileData?.basicDetails?.firstName) || ''}{' '}
                      {(profileData?.basicDetails && profileData?.basicDetails?.lastName) || ''}
                    </h3>
                    <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {(() => {
                        const addedBadges =
                          profileData?.applicant?.applicantSkillBadges
                            ?.filter(badge => badge.flag === 'added')
                            .map(badge => ({
                              id: badge.id,
                              name: badge.skillBadge.name,
                              status: badge.status,
                              flag: badge.flag,
                            })) || [];

                        const requiredSkills =
                          profileData?.skillsRequired?.map(skillReq => ({
                            id: skillReq.id,
                            name: skillReq.skillName,
                            status: 'REQUIRED',
                            flag: 'required',
                          })) || [];

                        const allSkills = [...addedBadges, ...requiredSkills];

                        allSkills.sort((a, b) => {
                          const lenDiff = a.name.length - b.name.length;
                          if (lenDiff !== 0) return lenDiff;
                          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
                        });

                        return allSkills.map(skill => (
                          <React.Fragment key={skill.id}>
                            <span>
                              <a>
                                <ul
                                  className="skill-but"
                                  style={{
                                    color: 'black',
                                    backgroundColor: skill.flag === 'removed' ? '#D9534F' : '#E8E8E8',
                                    display: 'inline-flex',
                                    marginRight: '2px',
                                  }}
                                >
                                  <li style={{ display: 'flex', alignItems: 'center' }}>{skill.name}</li>
                                </ul>
                              </a>
                            </span>
                          </React.Fragment>
                        ));
                      })()}
                    </div>

                  </div>
                </div>
                <div className="profile-card-row2">
                  {/* Download our App */}
                  <div className="app-card">
                    <div className="app-sub-card">
                      <p className="app-card-text">
                        Why open laptop when jobs can be right in your pocket.
                      </p>

                      <p className="app-card-download-text">
                        Download the app now!
                      </p>

                      <div
                        className="app-store-icons"
                      >
                        <a
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          target="_blank"
                          rel="noopener noreferrer"
                        > <img
                            src={appStoreIcon}
                            alt="App Store"
                          /></a>


                        <a
                          href="https://play.google.com/store/apps/details?id=com.bigtimes&utm_source=dashbd-ps-button&utm_medium=bj-dab-ps-app&utm_campaign=bj-ps-int-prof-dboard"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={playStore}
                            alt="Google Play"
                          />
                        </a>
                      </div>
                    </div>


                    {/* ✅ Mobile Image Below */}
                    <div className="app-img">
                      <img
                        src={SmartPhone}
                        alt="App Preview"
                        width="65%"
                      />
                    </div>

                  </div>

                  {/* Tech buzz shots */}
                  <div className="Tech-buzz">
                    <div className="tech-buzz-header">
                      <h3>Tech buzz shots</h3>
                      <button onClick={handleRedirectTechBuzz}>view more</button>
                    </div>
                    <div className="tech-buzz-images">
                      {techBuzzLoading ? (
                        // 4 skeleton images
                        [...Array(4)].map((_, i) => (
                          <div key={i} className="skeleton-thumb"></div>
                        ))
                      ) : techBuzzVideos.length > 0 ? (
                        techBuzzVideos.map((video) => (
                          <img
                            key={video.videoId}
                            src={video.thumbnail_url || "https://via.placeholder.com/120x80?text=No+Img"}
                            alt={video.title}
                            onClick={() => navigate(`/applicant-verified-videos?video=${video.videoId}`)}
                            onError={(e) => (e.target.src = "https://via.placeholder.com/120x80?text=No+Img")}
                            style={{ cursor: "pointer" }}
                          />
                        ))
                      ) : (
                        // Fallback: 4 placeholder images
                        [...Array(4)].map((_, i) => (
                          <img
                            key={i}
                            src="https://via.placeholder.com/120x80?text=No+Video"
                            alt="No video"
                            style={{ opacity: 0.5 }}
                          />
                        ))
                      )}
                    </div>
                  </div>



                  {/* Tech Vibes */}
                  <div className="tech-vibes">
                    <div className="tech-vibes-header">
                      <h3>TechVibes</h3>
                      <button className="explore-btn" onClick={handleRedirectTechVibes}>
                        Explore
                      </button>
                    </div>


                    <div className="tech-vibes-list">
                      {blogsLoading ? (
                        // Skeleton
                        [...Array(3)].map((_, i) => (
                          <div key={i} className="tech-vibes-item">
                            <div className="skeleton-img"></div>
                            <div className="vibe-content">
                              <div className="skeleton-title"></div>
                              <div className="skeleton-date"></div>
                            </div>
                          </div>
                        ))
                      ) : blogsError ? (
                        <p className="error-msg">{blogsError}</p>
                      ) : blogs.length === 0 ? (
                        <p className="no-blogs">No blogs available</p>
                      ) : (
                        blogs.map((blog) => {
                          // Convert createdAt array to formatted date
                          const formatCreatedAt = (arr) => {
                            if (!arr || !Array.isArray(arr) || arr.length < 3) return 'N/A';
                            const [year, month, day] = arr;
                            const date = new Date(year, month - 1, day); // month is 0-indexed
                            return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
                          };
                          const handleBlogClick = () => {
                            navigate(`/applicant-blog-list?blog=${blog.id}`);
                          };


                          return (
                            <div
                              key={blog.id}
                              className="tech-vibes-item"
                              onClick={handleBlogClick}
                              style={{ cursor: 'pointer' }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleBlogClick();
                                }
                              }}
                            >
                              <img
                                src={blog.imageUrl || 'https://via.placeholder.com/82x60?text=No+Img'}
                                alt={blog.title}
                                className="blog-thumbnail"
                                onError={(e) => (e.target.src = 'https://via.placeholder.com/82x60?text=No+Img')}
                              />


                              {/* Title + createdAt */}
                              <div className="vibe-content">
                                <h4 className="news-title">
                                  {blog.title && blog.title.length > 18
                                    ? `${blog.title.substring(0, 18)}…`
                                    : blog.title || 'Untitled'}
                                </h4>
                                <p className="news-date">{formatCreatedAt(blog.createdAt)}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )
      }
    </div>
  );
};

export default ApplicantDashboard;