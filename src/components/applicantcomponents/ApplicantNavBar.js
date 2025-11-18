// src/components/applicant/ApplicantNavBar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import $ from "jquery";
import "jquery.cookie";
import "metismenu";
import { useState, useEffect,useRef } from "react";
import { useUserContext } from "../common/UserProvider";
import { apiUrl } from "../../services/ApplicantAPIService";
import ModalLogout from "../common/ModalLogout";
import axios from "axios";
import logos from "../../images/profileIcon.png";
import NotificationToggleWeb from "../../notifications/NotificationToggleWeb";
import shape8 from "../../images/dashboard/mobilebanners/power.jpg";
import shape7 from "../../images/dashboard/mobilebanners/write.jpg";
import shape6 from "../../images/dashboard/mobilebanners/solar-energy.jpg";
import shape5 from "../../images/dashboard/mobilebanners/coding.jpg";
import shape3 from "../../images/dashboard/mobilebanners/score.jpg";
import shape4 from "../../images/dashboard/mobilebanners/mentoring.jpg";
import shape from "../../images/dashboard/mobilebanners/shape.jpg";
import shape2 from "../../images/dashboard/mobilebanners/curriculum-vitae.jpg";
import botImage from "../../images/dashboard/mobilebanners/Bot.png";
import botImage1 from "../../images/dashboard/mobilebanners/Bot1.png";
import "./ApplicantNavBar.css";
import notificationIcon from "../../images/notificationIcon.svg";


function ApplicantNavBar() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const specificDivRef = useRef(null);

  const hideSidebarRoutes = ["/applicant-interview-prep"];
  const hiddenRoutes = ["/applicant-interview-prep", "/applicanthome"];

  const [isOpen, setIsOpen] = useState(
    window.innerWidth >= 1302 &&
      !hideSidebarRoutes.some((route) => location.pathname.startsWith(route))
  );

  const { user } = useUserContext(); // may be null initially
  const [imageSrc, setImageSrc] = useState("");
  const [alertCount, setAlertCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [requestData, setRequestData] = useState(null);

  const [isSubAccountVisible, setIsSubAccountVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hamburgerClass, setHamburgerClass] = useState("fa fa-bars");
  const frompath = location.state?.from;

  const shouldHideHeader = hiddenRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Toggle left menu (hamburger)
  const handleToggleMenu = (e) => {
    e?.stopPropagation();
    setIsOpen((s) => !s);
    if (hamburgerClass === "fa fa-bars") {
      setHamburgerClass("fa fa-arrow-left");
      document.body.classList.remove("close-sidebar");
      document.body.classList.add("grid-handler");
    } else {
      setHamburgerClass("fa fa-bars");
      document.body.classList.add("close-sidebar");
      document.body.classList.remove("grid-handler");
    }
  };

  const hideMenu = (e) => {
    e?.stopPropagation();
    setIsOpen(window.innerWidth >= 1302);
    setHamburgerClass("fa fa-bars");
  };

   useEffect(() => {
    const onDocClick = (e) => {
      // if dropdown is open and click is outside the profile wrapper, close it
      if (isSubAccountVisible) {
        const el = specificDivRef.current;
        if (el && !el.contains(e.target)) {
          setIsSubAccountVisible(false);
        }
      }
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [isSubAccountVisible]);

  // -------------------------
  // Window resize + jQuery left menu button initialization
  // This effect doesn't use user.id, so it can run immediately.
  // -------------------------
  useEffect(() => {
    const updateSidebarClasses = () => {
      const shouldHide = hideSidebarRoutes.some(
        (route) =>
          pathname === route || pathname.startsWith(route + "/")
      );

      if (window.innerWidth >= 1301 && !shouldHide) {
        document.body.classList.add("grid-handler");
        document.body.classList.add("hide-hamburger");
      } else {
        document.body.classList.add("close-sidebar");
        document.body.classList.remove("hide-hamburger");
      }
    };

    const handleResize = () => {
      const shouldHide = hideSidebarRoutes.some((route) =>
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

    // init
    updateSidebarClasses();
    handleResize();
    window.addEventListener("resize", handleResize);

    // jQuery left-menu-btn behaviour
    const leftBtnHandler = function (e) {
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
    };

    $("#left-menu-btn").on("click", leftBtnHandler);
    if ($.cookie("isButtonActive") === "1") {
      $("body").addClass("sidebar-enable show-job");
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      $("#left-menu-btn").off("click", leftBtnHandler);
    };
    // we intentionally depend on pathname so the layout updates when route changes
  }, [pathname]);

  // -------------------------
  // Fetch user-related data (only once user is available)
  // All calls guarded by `if (!user || !user.id) return`
  // -------------------------
  useEffect(() => {
    if (!user || !user.id) return;

    // fetch profile image
    let isMounted = true;
    fetch(`${apiUrl}/applicant-image/getphoto/${user.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Image fetch failed");
        return response.blob();
      })
      .then((blob) => {
        if (!isMounted) return;
        const imageUrl = URL.createObjectURL(blob);
        setImageSrc(imageUrl);
      })
      .catch(() => {
        if (!isMounted) return;
        setImageSrc("../images/user/avatar/image-01.jpg");
      });

    // fetch requestData (applicant details)
    (async () => {
      try {
        const resp = await axios.get(
          `${apiUrl}/applicant/getApplicantById/${user.id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` },
          }
        );
        // keep whole response data (don't overwrite user context)
        if (isMounted) setRequestData(resp.data || null);
      } catch (err) {
        console.error("Error fetching applicant details:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // fetch unread alert count when user and location.key change
  useEffect(() => {
    if (!user || !user.id) return;

    const fetchAlertCount = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/applyjob/applicants/${user.id}/unread-alert-count`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        );
        setAlertCount(response.data);
      } catch (error) {
        console.error("Error fetching alert count:", error);
      }
    };

    fetchAlertCount();
  }, [location.key, user]);

  // pick up userData from localStorage (poll only until available)
  useEffect(() => {
    let intervalId = null;
    // only poll if userData not yet set (rare)
    if (!userData) {
      intervalId = setInterval(() => {
        const storedData = localStorage.getItem("userData");
        if (storedData) {
          try {
            setUserData(JSON.parse(storedData));
            clearInterval(intervalId);
          } catch (e) {
            // invalid JSON — ignore
            clearInterval(intervalId);
          }
        }
      }, 200);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [userData]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userType");
      window.location.href = "https://www.bitlabs.in/jobs";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // -------------------------
  // Derived display values (safe)
  // -------------------------
  const displayName = (() => {
    const d = requestData || userData || {};
    if (d.firstName || d.lastName) return `${d.firstName || ""} ${d.lastName || ""}`.trim();
    if (user?.username) return user.username;
    // try other fields if available
    if (d.identifier) return d.identifier;
    return "Applicant";
  })();

  const displayLocation = (() => {
    const d = requestData || userData || {};
    if (d.location) return d.location;
    if (d.city || d.state) return [d.city, d.state].filter(Boolean).join(", ");
    return "Location not set";
  })();

  // stop propagation for the left-sub-account click (so clicking items inside won't close)
  const onLeftAccountClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div>
      {/* Top header: kept minimal, removed notify bell & specificDiv area per your request */}
      <header id="header" className="header header-default">
        <div className="tf-container ct2">
          <div className="row">
            <div className="col-md-12">
              <div className="sticky-area-wrap">
                <div className="header-ct-left">
                  {window.innerWidth < 2000 && (
                    <span id="hamburger" className={hamburgerClass} onClick={handleToggleMenu} />
                  )}
                  <span style={{ width: "20px", height: "2px" }} />
                  <div id="logo" className="logo">
                    <a href="/applicanthome">
                      <img className="site-logo" src={logos} alt="Image" />
                    </a>
                  </div>
                </div>

                {/* center robo (unchanged) */}
{/*                 
                <div className="header-ct-center">
                  {!shouldHideHeader && (
                    <div className="display-flex robo-container">
                      <div className="robo-card">
                        <div className="container1">
                          <div className="robo-img-nav">
                            <span>
                              <img src={botImage} alt="Bot icon" width="150px" height="250px" />
                            </span>
                          </div>

                          <div className="robo-card-text">
                            <p className="robo-card-para">
                              Got a doubt? -{" "}
                              <span
                                onClick={() => navigate("/applicant-interview-prep")}
                                style={{ fontSize: "18px", fontWeight: 1200, color: "#7E3601" }}
                              >
                                Ask Newton!
                              </span>
                            </p>

                            <button onClick={() => navigate("/applicant-interview-prep")} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div> */}

                {/* header right intentionally left minimal (per your request) */}
                <div className="header-ct-right" aria-hidden="true" />
              </div>

              {/* mobile sticky-down */}
              <div className="sticky-down" onClick={() => navigate("/applicant-interview-prep")}>
                {!shouldHideHeader && (
                  <div className="display-flex robo-container">
                    <div className="robo-card">
                      <div className="container1">
                        <div className="robo-img-nav">
                          <span>
                            <img src={botImage} alt="Bot icon" width="100px" height="250px" />
                          </span>
                        </div>

                        <marquee className="robo-card-text">
                          <p className="robo-card-para">
                            Got a doubt? -{" "}
                            <span style={{ fontSize: "14px", fontWeight: 1200, color: "#7E3601" }}>
                              Ask Newton!
                            </span>
                          </p>

                          <button onClick={() => navigate("/applicant-interview-prep")}>Get Started</button>
                        </marquee>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* LEFT MENU */}
      <div className={`left-menu ${isOpen ? "open" : ""}`}>
        <div id="sidebar-menu">
          {/* Profile area inside left nav (photo, name, location, caret to show sub-menu) */}
           <div
            id="specificDivm"
            ref={specificDivRef}                    // <<< attach ref here
            style={{ padding: 0 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
              <img
                src={imageSrc || "../images/user/avatar/image-01.jpg"}
                alt="Avatar"
                width={52}
                height={52}
                style={{
                  borderRadius: "50%",
                  border: "2px solid #FFE2C4",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/applicant-view-profile")}
                onError={() => setImageSrc("../images/user/avatar/image-01.jpg")}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="left-name" style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ lineHeight: 1 }}>
                    <div style={{ fontSize: 12, color: "#777" }}>Hi,</div>
                    <div style={{ fontWeight: 800 }}>{displayName}  <button
                    className="profile-caret-btn"
                    aria-expanded={isSubAccountVisible}
                    onClick={(e) => {
                      e.stopPropagation();               // avoid immediate outside-click effect
                      setIsSubAccountVisible((s) => !s);
                    }}
                    title="Account options"
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 6,
                      cursor: "pointer",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24">
                      <path d="M7 10l5 5 5-5z" fill="#6b6b6b" />
                    </svg>
                  </button></div>
                  </div>

                  {/* caret button aligned to right of the name block */}
                
                </div>
                {/* optionally show location below name (commented currently) */}
                {/* <div className="left-location" style={{ color: "#777", fontSize: 13 }}>{displayLocation}</div> */}
              </div>
            </div>

            {/* sub menu that drops down from profile */}
            <div
              className={`left-sub-account ${isSubAccountVisible ? "show" : ""}`}
              onClick={(e) => e.stopPropagation()}   // keep clicks inside from bubbling to document
              style={{
                display: isSubAccountVisible ? "block" : "none",
                padding: "8px 12px",
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                margin: "0 12px 12px",
                zIndex: 1200,
                minWidth: 200
              }}
            >
              {/* Change password item - use an inline svg icon + label so everything aligns */}
              <div
                className="item"
                onClick={() => {
                  setIsSubAccountVisible(false);
                  window.location.href = "/applicant-change-password";
                }}
                style={{ padding: "8px 6px", cursor: "pointer" }}
              >
                <span className="item-icon" aria-hidden="true" style={{ display: "inline-flex", alignItems: "center" }}>
                  {/* small lock svg */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 10v-2a6 6 0 1 1 12 0v2" stroke="#6b6b6b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="4" y="10" width="16" height="10" rx="2" stroke="#6b6b6b" strokeWidth="2.2"/>
                  </svg>
                </span>
                <span className="item-label">Change Password</span>
              </div>

              {/* Notifications mute/unmute item - NotificationToggleWeb now returns an inline friendly layout */}
              <div className="item" style={{ padding: "8px 6px", cursor: "pointer" }}>
                <NotificationToggleWeb compactLabel={true} />
              </div>
            </div>
          </div>
          {/* Navigation items */}
          <ul className="downmenu list-unstyled" id="side-menu" style={{ paddingTop: 8 }}>
            <li id="tour-dashboard">
              <Link
                onClick={hideMenu}
                to="/applicanthome"
                className={pathname === "/applicanthome" ? "tf-effect active" : ""}
              >
                <span className="dash-icon" style={{ marginRight: 15, display: "flex", alignItems: "center" }}>
                  <img src={shape} alt="Dashboard Icon" width="24" height="24" />
                </span>
                <span className="dash-titles">Dashboard</span>
              </Link>
            </li>

            <li id="tour-portfolio">
              <Link
                onClick={hideMenu}
                to="/applicant-view-profile"
                className={pathname === "/applicant-view-profile" ? "tf-effect active" : ""}
              >
                <span className="dash-icon">
                  <img src={shape2} alt="Dashboard Icon" width="24" height="24" />
                </span>
                <span className="dash-titles" style={{ textTransform: "none" }}>
                  Build portfolio
                </span>
              </Link>
            </li>
           <li id="tour-ask-newton">
            <div
               
              >
              <Link
                onClick={hideMenu}
                to="/applicant-interview-prep"
                className={pathname === "/applicant-interview-prep" ? "tf-effect active" : ""}
              >
                <span className="dash-icon">
                 <img src={botImage1} alt="Ask Newton" width="24" height="24" />
                </span>
                <span className="dash-titles" style={{ textTransform: "none" }}>
                  Ask Newton
                </span>
              </Link>

              </div>
             
            </li>
            <li>
              <Link
                id="tour-skill-validation"
                onClick={hideMenu}
                to="/applicant-verified-badges"
                className={pathname === "/applicant-verified-badges" ? "tf-effect active" : ""}
                style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
              >
                <span className="dash-icon" style={{ marginRight: 12 }}>
                  <img src={shape3} alt="Skill" width="24" height="24" />
                </span>
                <span className="dash-titles" style={{ color: "#333", fontSize: 16, textTransform: "none" }}>
                  Skill validation
                </span>
              </Link>

              <Link
                id="tour-mentor-sphere"
                onClick={hideMenu}
                to="/applicant-mentorconnect"
                className={pathname === "/applicant-mentorconnect" ? "tf-effect active" : ""}
                style={{ display: "inline-flex", alignItems: "center", marginTop: 13 }}
              >
                <span className="dash-icon" style={{ marginRight: 12 }}>
                  <img src={shape4} alt="Mentor" width="24" height="24" />
                </span>
                <span className="dash-titles" style={{ color: "#333", fontSize: 16 }}>
                  Mentor sphere
                </span>
              </Link>

              <Link
                id="tour-techbuzz"
                onClick={hideMenu}
                to="/applicant-verified-videos"
                className={pathname === "/applicant-verified-videos" ? "tf-effect active" : ""}
                style={{ display: "inline-flex", alignItems: "center", marginTop: 13 }}
              >
                <span className="dash-icon" style={{ marginRight: 12 }}>
                  <img src={shape5} alt="Videos" width="24" height="24" />
                </span>
                <span className="dash-titles" style={{ color: "#333", fontSize: 16 }}>
                  Tech buzz shorts
                </span>
              </Link>
            </li>

            <li id="tour-innovation-arena">
              <Link
                onClick={hideMenu}
                to="/applicant-hackathon"
                className={
                  pathname === "/applicant-hackathon" ||
                  frompath === "/applicant-hackathon" ||
                  pathname.includes("/applicant-hackathon")
                    ? "tf-effect active"
                    : ""
                }
              >
                <span className="dash-icon">
                  <img src={shape6} alt="Hackathon" width="24" height="24" />
                </span>
                <span className="dash-titles" style={{ textTransform: "none" }}>
                  Innovation arena
                </span>
              </Link>
            </li>

            <li id="tour-techvibes">
              <Link onClick={hideMenu} to="/applicant-blog-list" className={pathname === "/applicant-blog-list" ? "tf-effect active" : ""}>
                <span className="dash-icon blog-icon">
                  <img src={shape7} alt="Blog" width="24" height="24" />
                </span>
                <span className="dash-titles" style={{ textTransform: "none" }}>
                  Tech vibes
                </span>
              </Link>
            </li>
            <li id="tour-techvibes">
              <Link onClick={hideMenu} to="/applicant-job-alerts" className={pathname === "/applicant-job-alerts" ? "tf-effect active" : ""}>
                <span className="dash-icon blog-icon">
                   <img src={notificationIcon} alt="Notifications" width="24" height="24" />
                </span>
                <span className="dash-titles" style={{ textTransform: "none" }}>
                 Notifications &nbsp;
                </span>
                 {alertCount > 0 && (
                <div
                  style={{
                    background: "#E66A0E",
                    color: "#fff",
                    borderRadius: 20,
                    padding: "2px 8px",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {alertCount}
                </div>
              )}
              </Link>
            </li>
            <li>
              <div style={{ marginTop: "auto", padding: "12px" }}>
            <div
              onClick={() => setShowModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                borderRadius: "8px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
                <span className="dash-icon blog-icon">
                   <img src={shape8} alt="Logout icon" width="24" height="24" />
                </span>
                <span className="dash-titles" style={{ textTransform: "none" }}>
                 Logout
                </span>
              </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <ModalLogout isOpen={showModal} onClose={() => setShowModal(false)} onConfirm={handleLogout} />
    </div>
  );
}

export default ApplicantNavBar;
