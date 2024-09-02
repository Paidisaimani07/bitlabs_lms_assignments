import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import './VerifiedBadges.css';
import Taketest from '../../images/user/avatar/Taketest.png';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import axios from 'axios';
import javaPNG from '../../images/Icons1/Icons/Java.svg';
import htmlPNG from '../../images/Icons1/Icons/HTML.svg';
import cssPNG from '../../images/Icons1/Icons/CSS.svg';
import mysqlPNG from '../../images/Icons1/Icons/MySQL.svg';
import angularPNG from '../../images/Icons1/Icons/Angular.svg';
import reactPNG from '../../images/Icons1/Icons/React.svg';
import manualTestingPNG from '../../images/Icons1/Icons/Manual Testing.svg';
import sqlPNG from '../../images/Icons1/Icons/SQL.svg';
import jspPNG from '../../images/Icons1/Icons/JSP.svg';
import cPlusPlusPNG from '../../images/Icons1/Icons/C++.svg';
import paythonPNG from '../../images/Icons1/Icons/Python.svg';
import regressionPNG from '../../images/Icons1/Icons/Regression Testing.svg';
import hibernatePNG from '../../images/Icons1/Icons/Hibernate.svg';
import netPNG from '../../images/Icons1/Icons/Dot Net.svg';
import servletsPNG from '../../images/Icons1/Icons/Servlets.svg';
import typeScriptPNG from '../../images/Icons1/Icons/TypeScript.svg';
import cSharpPNG from '../../images/Icons1/Icons/C Sharp.svg';
import cPNG from '../../images/Icons1/Icons/C.svg';
import seleniumPNG from '../../images/Icons1/Icons/Selenium.svg';
import javaScriptPNG from '../../images/Icons1/Icons/JavaScript.svg';
import springPNG from '../../images/Icons1/Icons/Spring.svg';
import springBootPNG from '../../images/Icons1/Icons/Spring Boot.svg';
import vuePNG from '../../images/Icons1/Icons/Vue.svg';
import mongodbPNG from '../../images/Icons1/Icons/Mongo DB.svg';
import sqlServerPNG from '../../images/Icons1/Icons/SQL-Server.svg';
import djangoPNG from '../../images/Icons1/Icons/Django.svg';
import flaskPNG from '../../images/Icons1/Icons/Flask.png';
import { useNavigate, useLocation } from 'react-router-dom';

const SkillBadgeCard = ({ skillName, status, badgeIcon, retakeTest, testFailedAt }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [isRetakeAvailable, setIsRetakeAvailable] = useState(false);
  const navigate = useNavigate();

    // Map skill names to images
    const skillImages = {
      'JAVA': javaPNG,
      'HTML': htmlPNG,
      'CSS': cssPNG,
      'Python': paythonPNG,
      'MySQL' : mysqlPNG,
      'Angular' : angularPNG,
      'React' : reactPNG,
      'Manual Testing' : manualTestingPNG,
      "SQL" : sqlPNG,
      "JSP" : jspPNG,
      "C++" : cPlusPlusPNG,
      "Regression Testing" : regressionPNG,
      "Hibernate" : hibernatePNG,
      ".Net" : netPNG,
      "Servlets" : servletsPNG,
      "TypeScript" : typeScriptPNG,
      "C Sharp" : cSharpPNG,
      "C" : cPNG,
      "Selenium" : seleniumPNG,
      "JavaScript" : javaScriptPNG,
      "Spring" : springPNG,
      "Spring Boot" : springBootPNG,
      "Vue" : vuePNG,
      "Mongo DB" : mongodbPNG,
      "SQL-Server" : sqlServerPNG,
      "Django" : djangoPNG,
      "Flask" : flaskPNG,
      // Add other skills here...
    };
  
    // Get the image based on skill name, default to javaPNG if not found
    const skillImage = skillImages[skillName] || javaPNG;

  useEffect(() => {
    if (status === 'FAILED') {
       // Convert `testFailedAt` to Date object, which is when the test failed
       
      const testFailedAt = [2024, 8, 20, 17, 32, 22];  // Exclude milliseconds
      // Create a Date object by using the array elements
  const failedDate = new Date(
    testFailedAt[0], // year
    testFailedAt[1] - 1, // month (JavaScript Date is 0-based for months)
    testFailedAt[2], // day
    testFailedAt[3], // hour
    testFailedAt[4], // minute
    testFailedAt[5] // second
    
  );
      
      // Calculate the total 7 days (or 168 hours) from the failure time
      const futureTime = new Date(failedDate.getTime() + 7 * 24 * 60 * 60 * 1000);



      const calculateTimeLeft = () => {
        const currentTime = new Date();
        const difference = futureTime - currentTime;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / 1000 / 60) % 60);

          return { days, hours, minutes };
        } else {
          setIsRetakeAvailable(true);
          return null;
        }
      };

      const timer = setInterval(() => {
        const newTimeLeft = calculateTimeLeft();
        if (newTimeLeft) {
          setTimeLeft(newTimeLeft);
        }
      }, 1000); // Update every second

      return () => clearInterval(timer); // Cleanup on unmount
    }
  }, [status]);

  const handleTakeTest = (testName) => {

    navigate('/applicant-take-test', { state: { testName } });
  };

  return (
    <div className={`skill-badge-card ${status === 'PASSED' ? 'passed' : status === 'FAILED' ? 'failed' : ''}`}>
      {/* Top Section: Status */}
      <div className="status">
        <span className={status ? (status === 'PASSED' ? 'status-text status-passed' : 'status-text status-failed') : 'status-empty'}>
          &nbsp;&nbsp;{status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'empty'}&nbsp;&nbsp;
        </span>
      </div>

      {/* Second Section: Badge */}
      <div className="badge">
        <img src={skillImage} alt={skillName} className="skill-image" />
        <span className="skill-name">{skillName}</span>
      </div>

      {/* Third Section: Actions */}
      <div className="test">
        {status === 'FAILED' && (
          <div className="test-action retake" onClick={isRetakeAvailable ? () => handleTakeTest(skillName) : null}>
            {isRetakeAvailable ? (
              'Retake Test'
            ) : (
              <>
              <span>Retake Test in</span>
              <br />
              <div>
                {timeLeft.days > 0 && `${timeLeft.days}D `}
                {timeLeft.hours > 0 && `${timeLeft.hours}H `}
                {timeLeft.minutes !== undefined && `${timeLeft.minutes}M`}
              </div>
            </>
            

            )}
          </div>
        )}
        {status === 'PASSED' && (
          <div className="test-action verified" onClick={retakeTest}>
            <span className="tick-mark">✔&nbsp;Verified</span>
          </div>
        )}
        {!status && (
          <div className="test-action take" onClick={() => handleTakeTest(skillName)}>
            Take Test <i className="fa fa-external-link" aria-hidden="true"></i>
          </div>
        )}
      </div>
    </div>
  );
};




const VerifiedBadges = () => {
  const [isHovered, setIsHovered] = useState(false); 
  const [currentStep, setCurrentStep] = useState(1); 
  const [hideSteps, setHideSteps] = useState(false); // New state variable
  const [isMobile, setIsMobile] = useState(window.innerWidth < 767);
  const [skillBadges, setSkillBadges] = useState({ skillsRequired: [], applicantSkillBadges: [] }); // Initialize with default values
  const { user } = useUserContext();
  const userId = user.id;
  
  
 
  const navigate = useNavigate();

  // Update state based on window width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 767);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchSkillBadges = async () => {
      try {
        // Assuming JWT token is stored in localStorage
        const jwtToken = localStorage.getItem('jwtToken'); // Retrieve from localStorage
        console.log(jwtToken);

        const skillBadgesResponse = await axios.get(`${apiUrl}/skill-badges/${userId}/skill-badges`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`, // Pass the JWT token in headers
          },
        });

        const skillBadgeData = skillBadgesResponse.data;
        setSkillBadges(skillBadgeData); // Update state with the fetched data
        // setSkillsRequired(skillBadgeData.skillsRequired);
        // setApplicantSkillBadges(skillBadgeData.applicantSkillBadges);
      } catch (error) {
        console.error('Error fetching skill badges:', error);
      } 
    };

    fetchSkillBadges();
  }, [userId]);

  const linkStyle = {
    textDecoration: 'none',
    color: isHovered ? 'red' : 'blue', 
  };

  const spanStyle = {
    fontSize: '14px',
    color: 'orange',
  };

  const steps = [
    { id: 1, label: "General Aptitude Test" },
    { id: 2, label: "Technical Test" },
    { id: 3, label: "Verification done" },
  ];

  const handleClick = (stepId) => {
    setCurrentStep(stepId);
    if (stepId === 3) {
      setHideSteps(true); // Hide steps when stepId is 3
      }
  };

  const stepContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start", 
    width: "100%", 
    margin: "20px auto",
  };

  const stepStyle = (stepId) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    color: stepId <= currentStep ? "green" : "#ccc",
    fontWeight: stepId <= currentStep ? "bold" : "normal",
    textAlign: "center",
  });

  const circleStyle = (stepId) => ({
    width: "30px", 
    height: "30px",
    borderRadius: "50%",
    backgroundColor: stepId <= currentStep ? "green" : "#ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    position: "relative", 
    zIndex: 2, 
    
  });

  const svgStyle1 = {
    width: "20px",
    marginRight: "-2px",
  };

  const lineStyle = (stepId) => ({
    height: "3px",
    width: "180px", // Adjust width to connect steps closely
    backgroundColor: stepId < currentStep ? "green" : "#ccc",
    margin: "0 -5px", // Overlap the line with the circle
    position: "relative", // Ensure the line is positioned
    zIndex: 1, // Lower z-index to be behind the circle
  });

  const handleTakeTest = (testName) => {

    navigate('/applicant-take-test', { state: { testName } });
  };

  const handleRetakeTest = () => {

  }
  return (
    <div className="dashboard__content">
      <div className="row mr-0 ml-10">
        <div className="col-lg-12 col-md-12">
          <section className="page-title-dashboard">
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12 ">
                  <div className="title-dashboard">
                    <div className="title-dash flex2">Verified Badges</div>
                    <h3 style={{ marginTop: '50px', marginBottom: '10px' }}>Pre-Screened badge</h3>
                    <p>
                      Achieve your dream job faster by demonstrating your aptitude and technical skills
                    </p>
                    
                    {!hideSteps &&(
                    <div style={stepContainerStyle}>
                      {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                          <div
                            style={stepStyle(step.id)}
                            onClick={() => handleClick(step.id)}
                          >
                            <div style={circleStyle(step.id)}>
                              {step.id < currentStep ? "✓" : step.id === 3 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" style={svgStyle1} viewBox="0 0 13 13" fill="none">
                                  <g clipPath="url(#clip0_2734_956)">
                                    <path d="M2.06641 7.7002C2.06641 7.7002 2.56641 7.2002 4.06641 7.2002C5.56641 7.2002 6.56641 8.2002 8.06641 8.2002C9.56641 8.2002 10.0664 7.7002 10.0664 7.7002V1.7002C10.0664 1.7002 9.56641 2.2002 8.06641 2.2002C6.56641 2.2002 5.56641 1.2002 4.06641 1.2002C2.56641 1.2002 2.06641 1.7002 2.06641 1.7002V7.7002Z" stroke="#6D6969" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2.06641 11.2002V7.7002" stroke="#6D6969" strokeLinecap="round" strokeLinejoin="round"/>
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_2734_956">
                                      <rect width="12" height="12" fill="white" transform="translate(0.0664062 0.200195)"/>
                                    </clipPath>
                                  </defs>
                                </svg>
                              ) : step.id}
                            </div>
                          </div>
                          {index < steps.length - 1 && (
                            <div style={lineStyle(step.id)} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    )}
                     {!hideSteps &&(
                    <div style={stepContainerStyle}>
                      {steps.map((step) => (
                        <div key={step.id} style={{margin:"0 1px", fontSize: "14px" }}>
                          {step.label}
                        </div>
                      ))}
                    </div>
                     )}
                  </div>
                   
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="verified-badges-container1" >
          <div className="pre-screened-badge">
            {/* Conditional Rendering of Banners */}
            {currentStep === 1 && (
              <div className="col-12 col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 display-flex certificatebox">
                <div className="card" style={{ cursor: 'pointer', backgroundColor: '#FFFF' }}>
                  <div className={isMobile ? 'resumecard' : ''}>
                    <div className="resumecard-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="resumecard-text">
                        <div className="resumecard-heading">
                          <h2 className="heading1">General Aptitude Test</h2>
                          <div className="title-count">
                            A Comprehensive Assessment to Measure Your Analytical and
                            Reasoning Skills
                          </div>
                        </div>
                        <div className="resumecard-button">
                          <button
                            className="button-link1"
                            style={linkStyle}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={() => handleTakeTest('General Aptitude Test')}
                          >
                            {/* <span className="button button-custom" style={spanStyle}>Take Test</span> */}
                            <span className="button button-custom" style={spanStyle} >Take Test</span>
                          </button>
                        </div>
                      </div>
                      <div className="resumecard-icon" style={{ marginLeft: 'auto' }}>
                        <img
                          src={Taketest}
                          alt="Taketest"
                          style={{ width: '', height: 'auto', objectFit: 'contain', marginTop: '10px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="col-12 col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 display-flex certificatebox">
                <div className="card" style={{ cursor: 'pointer', backgroundColor: '#FFFF' }}>
                  <div className={isMobile ? 'resumecard' : ''} >
                    <div className="resumecard-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="resumecard-text">
                        <div className="resumecard-heading">
                          <h2 className="heading1">Technical Test</h2>
                          <div className="">
                            A Comprehensive Assessment to Measure Your Technical Skills
                          </div>
                        </div>
                        <div className="resumecard-button">
                        <button
                            className="button-link1"
                            style={linkStyle}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={() => handleTakeTest('Technical Test')}
                          >
                            {/* <span className="button button-custom" style={spanStyle}>Take Test</span> */}
                            <span className="button button-custom" style={spanStyle} >Take Test</span>
                          </button>
                        </div>
                      </div>
                      <div className="resumecard-icon" style={{ marginLeft: 'auto' }}>
                        <img
                          src={Taketest}
                          alt="Taketest"
                          style={{ width: '', height: 'auto', objectFit: 'contain', marginTop: '10px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

{currentStep === 3 && (
              <div className="col-12 col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 display-flex certificatebox">
                <div className="card" style={{ cursor: 'pointer', backgroundColor: '#FFFAED' }}>
                  <div className={isMobile ? 'resumecard' : ''}>
                    <div className="resumecard-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="resumecard-text">
                        <div className="resumecard-heading">
                        <h2 style={{
  color: '#F67505',
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  fontSize: '18px',
  fontStyle: 'normal',
  fontWeight: 600,
  lineHeight: '26px'
}}>
  Congratulations, You are now Verified
</h2>

<div style={{
  display: 'flex',
  alignItems: 'center',
  color: '#000',
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  fontSize: '24px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '26px',
  marginTop: '10px'
}}>
  <span>Siva Sai Neeli</span>
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 38 38" fill="none" style={{marginLeft:"10px"}}>
    <path d="M36.9317 16.6247L34.3469 13.6707C33.7931 13.1169 33.4238 12.0091 33.4238 11.2706V8.31668C33.4238 6.28583 31.7622 4.80885 29.916 4.80885H26.7774C26.0389 4.80885 24.9312 4.4396 24.3773 3.88574L21.4233 1.30102C20.131 0.193281 18.1001 0.193281 16.8078 1.30102L14.0384 3.88574C13.4846 4.4396 12.3768 4.80885 11.6383 4.80885H8.49974C6.46889 4.80885 4.9919 6.47046 4.9919 8.31668V11.4553C4.9919 12.1938 4.62266 13.3015 4.06879 13.8554L1.66869 16.8093C0.560956 18.1017 0.560956 20.1325 1.66869 21.4249L4.06879 24.3789C4.62266 24.9327 4.9919 26.0405 4.9919 26.779V29.9176C4.9919 31.9484 6.65351 33.4254 8.49974 33.4254H11.6383C12.3768 33.4254 13.4846 33.7946 14.0384 34.3485L16.9924 36.9332C18.2847 38.041 20.3156 38.041 21.608 36.9332L24.5619 34.3485C25.1158 33.7946 26.2235 33.4254 26.962 33.4254H30.1006C32.1315 33.4254 33.6084 31.7638 33.6084 29.9176V26.779C33.6084 26.0405 33.9777 24.9327 34.5316 24.3789L37.1163 21.4249C38.0394 20.1325 38.0394 17.9171 36.9317 16.6247ZM26.962 15.517L18.1001 24.3789C17.9155 24.5635 17.5463 24.7481 17.177 24.7481C16.8078 24.7481 16.4385 24.5635 16.2539 24.3789L11.8229 19.9479C11.2691 19.3941 11.2691 18.4709 11.8229 17.9171C12.3768 17.3632 13.2999 17.3632 13.8538 17.9171L17.3616 21.4249L24.9312 13.4861C25.485 12.9323 26.4082 12.9323 26.962 13.4861C27.5159 14.04 27.5159 14.9631 26.962 15.517Z" fill="#F46F16"/>
  </svg>
</div>

                        </div>
                      </div>
                      <div className="resumecard-icon" style={{ marginLeft: 'auto' }}>
                        <img
                          src={Taketest}
                          alt="Taketest"
                          style={{ width: '', height: 'auto', objectFit: 'contain', marginTop: '10px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
  
  
          </div>
        </div>
      </div>
      <div className="row mr-0 ml-10">
  <h3>Skills Badges</h3>
  <div className="col-lg-10 col-md-12">
    <div className="skill-badge-container">
      {skillBadges.skillsRequired.map((skill) => (
       
          <div className="skill-badge-card" key={skill.id}>
            <SkillBadgeCard
              key={skill.skillName}
              skillName={skill.skillName}
              status={skill.status}
              retakeTest={() => handleRetakeTest()}
              testFailedAt={skill.testTaken}
            />
          </div>
        
      ))}

      {skillBadges.applicantSkillBadges.map((badge) => (
        
          <div className="skill-badge-card" key={badge.id}>
            <SkillBadgeCard 
              skillName={badge.skillBadge.name} 
              status={badge.status} 
              testFailedAt={badge.testTaken}
            />
          </div>
        
      ))}
    </div>
  </div>
</div>



      

    </div>
  );
};

export default VerifiedBadges;
