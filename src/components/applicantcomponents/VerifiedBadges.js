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
import cPlusPlusPNG from '../../images/Icons1/Icons/CPlusPlus.svg';
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
import Verified from '../../images/user/avatar/Verified.png';

import aptitudeIcon from '../../images/user/avatar/problem-solve.png';
import technicalIcon from '../../images/user/avatar/coding.png';
import verificationIcon from '../../images/user/avatar/verified2.png';

import { ClipLoader } from 'react-spinners';




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
       
      // const testFailedAt = [2024, 8, 20, 17, 32, 22];  // Exclude milliseconds
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
      const futureTime = new Date(failedDate.getTime() + 7 * 24 * 60 * 60 * 1000 + (5 * 60 * 60 * 1000) + (30 * 60 * 1000));



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
          <div className="test-action retake" onClick={isRetakeAvailable ? () => handleTakeTest(skillName) : null}
          style={{
            backgroundColor: isRetakeAvailable ? '#374A70' : '#e0e0e0', // Red background if retake is available, grey otherwise
            color: isRetakeAvailable ? '#ffffff' : '#000000', // White text if retake is available, black otherwise
            cursor: isRetakeAvailable ? 'pointer' : 'default', // Pointer cursor if retake is available
            padding: '20px', // Adjust padding as needed
            borderRadius: '5px', // Rounded corners
            textAlign: 'center' // Center text
          }}
          >
            {isRetakeAvailable ? (
                <>
                Retake Test
                <i className="fa fa-external-link" aria-hidden="true" style={{ marginLeft: '10px' }}></i>
              </>
            ) : (
              <>
              
              <div>
              <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Retake Test in</span>
              <br />&nbsp;&nbsp;&nbsp;&nbsp;
                {timeLeft.days > 0 && `${timeLeft.days}d `}
                {timeLeft.hours > 0 && `${timeLeft.hours}h `}
                {timeLeft.minutes !== undefined && `${timeLeft.minutes}m`}
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
          <div className="test-action take" style={{textAlign:'center'}}onClick={() => handleTakeTest(skillName)}>
            Take Test
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

  
  
 
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 767);
  const isSmallScreen1 = window.innerWidth < 767;
  const [testData, setTestData] = useState(null); 
  const { user } = useUserContext();
  const userId = user.id;
  const [timer, setTimer] = useState(null);
  const [isDisabled, setIsDisabled] = useState(!timer);
  const [isTimerComplete, setIsTimerComplete] = useState(false); // Track if the timer has completed
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.get(`${apiUrl}/applicantprofile/${user.id}/profile-view`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
    
        const newData = {
          identifier: response.data.applicant.email,
          password: response.data.applicant.password,
          localResume: response.data.applicant.localResume,
          firstName: response.data.basicDetails != null && response.data.basicDetails.firstName != null ? response.data.basicDetails.firstName : ""
        };
  
        // Store newData in local storage
        localStorage.setItem('userData', JSON.stringify(newData));
  
        setUserData(newData);
      } catch (error) {
        console.error('Error updating profile status:', error);
      }
    };
  
    fetchUserData();
  }, []);


  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.get(`${apiUrl}/applicant1/tests/${user.id}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        setTestData(response.data);  // Use setTestData here
      } catch (error) {
        console.error('Error fetching test data:', error);
      }
    };

    setTimeout(() => {
    fetchTestData();
    }, 500);
  }, [user.id]);

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
        if(skillBadgeData){
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching skill badges:', error);
      } 
    };

   setTimeout(() => {
    fetchSkillBadges();
    }, 500);
  }, [userId]);
  
  useEffect(() => {
    if (testData) {
      const aptitudeTest = testData.find(test => test.testName.toLowerCase().includes('aptitude'));
      const technicalTest = testData.find(test => test.testName.toLowerCase().includes('technical'));
  
      if (aptitudeTest) {
        // Prioritize checking if both tests are passed
        if (aptitudeTest.testStatus.toLowerCase() === 'p' && technicalTest && technicalTest.testStatus.toLowerCase() === 'p') {
          setCurrentStep(3); // Candidate passed both tests
          setHideSteps(true); // Hide steps if candidate passed both
          setTimer(null); // Clear any existing timer
          setIsDisabled(false); // Ensure button is enabled if both tests are passed
  
        } else if (aptitudeTest.testStatus.toLowerCase() === 'f') {
          setCurrentStep(1); // Candidate failed the aptitude test
          setHideSteps(false); // Ensure steps are not hidden
    
          // Timer logic for failed aptitude test
          const testDateTime = new Date(
            aptitudeTest.testDateTime[0], // Year
            aptitudeTest.testDateTime[1] - 1, // Month (0-based index)
            aptitudeTest.testDateTime[2], // Day
            aptitudeTest.testDateTime[3], // Hours
            aptitudeTest.testDateTime[4], // Minutes
            aptitudeTest.testDateTime[5] // Seconds
          );
          const retakeDate = new Date(testDateTime);
          retakeDate.setDate(retakeDate.getDate() + 7); // Set retake date to 7 days later
          retakeDate.setHours(retakeDate.getHours() + 5); // Add 5 hours
          retakeDate.setMinutes(retakeDate.getMinutes() + 30); // Add 30 minutes
    
          const calculateTimeLeft = () => {
            const now = new Date();
            const difference = retakeDate - now;
    
            if (difference > 0) {
              const timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
              };
              setTimer(timeLeft);
              setIsTimerComplete(false); // Timer is still counting down
            } else {
              setTimer(null); // Timer has ended
              setIsTimerComplete(true); // Timer completed
              setIsDisabled(false); // Enable the button when timer ends
            }
          };
    
          // Initial call and set interval for countdown
          calculateTimeLeft();
          const timerInterval = setInterval(calculateTimeLeft, 1000);
    
          // Cleanup interval on component unmount
          return () => clearInterval(timerInterval);
    
        } else if (aptitudeTest.testStatus.toLowerCase() === 'p') {
          // New condition: Passed aptitude test but no technical test taken yet
          if (!technicalTest || !technicalTest.testStatus) {
            setCurrentStep(2); // Move to technical test step if it's not taken yet
            setHideSteps(false); // Ensure steps are not hidden
            setTimer(null); // No timer is needed as the technical test hasn't been taken
            setIsDisabled(false); // Enable the button for the technical test
          } else if (technicalTest.testStatus.toLowerCase() === 'f') {
            // Candidate failed the technical test
            setCurrentStep(2); // Candidate passed aptitude but failed technical test
            setHideSteps(false); // Ensure steps are not hidden
    
            // Timer logic for failed technical test
            const testDateTime = new Date(
              technicalTest.testDateTime[0], // Year
              technicalTest.testDateTime[1] - 1, // Month (0-based index)
              technicalTest.testDateTime[2], // Day
              technicalTest.testDateTime[3], // Hours
              technicalTest.testDateTime[4], // Minutes
              technicalTest.testDateTime[5] // Seconds
            );
            const retakeDate = new Date(testDateTime);
            retakeDate.setDate(retakeDate.getDate() + 7); // Set the retake date to 7 days later
            retakeDate.setHours(retakeDate.getHours() + 5); // Add 5 hours
            retakeDate.setMinutes(retakeDate.getMinutes() + 30); // Add 30 minutes
    
            const calculateTimeLeft = () => {
              const now = new Date();
              const difference = retakeDate - now;
    
              if (difference > 0) {
                const timeLeft = {
                  days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                  hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                  minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                  seconds: Math.floor((difference % (1000 * 60)) / 1000),
                };
                setTimer(timeLeft);
                setIsTimerComplete(false); // Timer is still counting down
              } else {
                setTimer(null); // Timer has ended
                setIsTimerComplete(true); // Timer completed
                setIsDisabled(false); // Enable the button when timer ends
              }
            };
    
            // Initial call and set interval for countdown
            calculateTimeLeft();
            const timerInterval = setInterval(calculateTimeLeft, 1000);
    
            // Cleanup interval on component unmount
            return () => clearInterval(timerInterval);
    
          } else {
            // Default to step 1 if no other condition is met
            setCurrentStep(1);
            setHideSteps(false);
            setTimer(null);
            setIsDisabled(false);
          }
        }
      }
    }
  }, [testData]);
  
  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
      setIsSmallScreen(window.innerWidth < 767);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const getWidthStyle = () => {
    if (screenSize < 430) {
      return 'clamp(30px, 23vw, 200px)'; // Small screens
    } else if (screenSize < 767) {
      return 'clamp(30px, 25vw, 250px)'; // Medium screens
    } else {
      return 'clamp(30px, 12vw, 300px)'; // Large screens
    }
  };

 

  

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 780);
    };

    // Initialize the state on component mount
    handleResize();

    // Add event listener for resize
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  

  const buttonStyle = () => ({
    backgroundColor: isDisabled ? "#DDDDDD" : "#F46F16", // Grey when disabled, orange when active
    color: isDisabled ? "#6c757d" : "#ffffff", // Text color based on active state
    padding: '1px 10px',
    borderRadius: '5px',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '15px',
    width: 'clamp(100px, 20vw, 120px)',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    cursor: isDisabled ? 'not-allowed' : 'pointer', // Show not-allowed cursor when disabled
    position: 'relative', // Needed for the overlay to position correctly
    height: 'clamp(40px, 6vw, 40px)', 
  });
 


 // Update button state based on the presence of the timer and current step
 useEffect(() => {
  console.log(`currentStep: ${currentStep}, timer: ${timer}`); // Debugging statement
  if (timer) {
    if (currentStep === 1 || currentStep === 2) {
      console.log("Timer present, disabling button"); // Debugging statement
      setIsDisabled(true); // Set button to be disabled (grey) when timer is present
    } else {
      console.log("No timer or not in step 1 or 2, enabling button"); // Debugging statement
      setIsDisabled(false); // Otherwise, keep button active (orange)
    }
  } else {
    console.log("No timer, enabling button"); // Debugging statement
    setIsDisabled(false); // No timer, so keep button active (orange)
  }
}, [currentStep, timer]);



  const spanStyle = {
   fontSize: 'clamp(12px, 2vw, 17px)',
    color: '#FFFFFF',
    justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  
  
  };

const steps = [
  { id: 1, label: "General Aptitude Test", icon: aptitudeIcon},
  { id: 2, label: "Technical Test", icon: technicalIcon },
  { id: 3, label: "Verification done", icon: verificationIcon },
];

 

  const stepContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", 
    width: "100%", 
    // border:"2px solid red",
    marginTop: "10px",
    
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


  const [screenSize, setScreenSize] = useState(window.innerWidth);

  const lineStyle = (stepId) => ({
    height: "3px",
    width: getWidthStyle(),
    backgroundColor: stepId < currentStep ? "green" : "#ccc",
    margin: "0 -5px", // Overlap the line with the circle
    position: "relative", // Ensure the line is positioned
    zIndex: 1, // Lower z-index to be behind the circle
  });

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // const isMobile = screenWidth < 555;
  const isBelow767px = screenWidth < 767;

  const [isImageVisible, setIsImageVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsImageVisible(window.innerWidth >= 500);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const styles = {
    cardContainer: {
      backgroundColor: '#FFF9ED', // Light cream background
      padding: '25px',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: isMobile ? 'column-reverse' : 'row', // Stack image on top of text on mobile
      justifyContent: 'space-between', // Center items horizontally
      alignItems: 'center',
      width: '100%', // 80% of the parent container width
      maxWidth: '900px', // Maximum width for the card
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)', // Light shadow for depth
      marginLeft: isBelow767px ? '6px' : '0', // Add margin-left below 767px
      marginBottom:'10px'    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: isMobile ? 'center' : 'flex-start', // Center items horizontally on mobile
      textAlign: isMobile ? 'center' : 'left', // Center text alignment on mobile
    },
    message: {
      color: '#F67505', // Orange color
      fontSize: '16px',
      marginBottom: '10px',
      marginTop: '-2px',
      fontWeight:'600',
      fontfamily: 'Plus Jakarta Sans',
      fontstyle:'normal'
    },
    nameContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-start', // Center items horizontally on mobile
      marginTop: isMobile ? '5px' : '0', // Add margin-top on mobile if needed
    },
    name: {
      fontSize: 'clamp(17.2px, 4vw, 24px)',
      fontWeight: 'bold',
      color: '#333',
      marginRight: '8px',
      marginLeft: '5px', // Adjust space between the last letter and the SVG
      verticalAlign: 'middle', // Ensures the icon aligns vertically
      },
      lastLetterWrapper: {
        display: 'inline-flex', // Keeps the SVG and last letter together
        alignItems: 'center',   // Vertically aligns the last letter and the icon
      },
    icon: {
      color: '#F46F16', // Orange color for the checkmark icon
      fontSize: '24px',
    },
    image: {
      width: '71px',
      height: 'auto',
      objectFit: 'contain',
      marginTop: '10px',
      display: isImageVisible ? 'block' : 'none', // Conditionally hide image
    },
   
  };

  const handleTakeTest = (testName) => {

    navigate('/applicant-take-test', { state: { testName } });
  };

  const handleRetakeTest = () => {

  }
  return (
        loading ?         
    <div className="border-style">

      <div className="blur-border-style"></div>
      <div className="spinner-container">
          <ClipLoader color="#F97316" loading={loading} size={30}/>
        </div></div>: (
          <div className="border-style">

      <div className="blur-border-style"></div>
    <div className="dashboard__content">
      <div className="row mr-0 ml-10">
        <div className="col-lg-12 col-md-12">
          <section className="page-title-dashboard">
            <div className="themes-container">
              <div className="row ">
                <div className="col-lg-12 col-md-12 " >
                  <div className="title-dashboard" style={{backgroundColor:''}}>
                    <div className="title-dash flex2" >Skill Validation</div>
                    <h3 style={{ marginTop: '50px', marginBottom: '10px' }}></h3>
                <div style={{ marginTop: "10px", width: "100%"}}>
  {!hideSteps && (
    <div style={{ width: "100%",margin: "0 auto",backgroundColor:'#fff',borderRadius:'12px',padding:'20px',marginLeft:'-20px'}}>

      {/* Progress Steps */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          position: "relative",
        }}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "830px",
          position: "relative"
        }}>
          {/* Background Line */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "7%",
            right: "7%",
            height: "2px",
            backgroundColor: "#e0e0e0",
            zIndex: 1
          }}></div>

          {/* Progress Line */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "6%",
            width: currentStep === 2 ? "42%" : currentStep === 3 ? "80%" : "0%",
            height: "2px",
            backgroundColor: "#121212",
            zIndex: 2,
            transition: "width 0.3s ease"
          }}></div>

          {steps.map((step) => (
            <div
              key={step.id}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: step.id <= currentStep ? "#121212" : "#e0e0e0",
                color: step.id <= currentStep ? "#fff" : "#6D6969",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "16px",
                fontWeight: "600",
                position: "relative",
                zIndex: 3,
                margin: "0 10px"
              }}
            >
              {step.id < currentStep ? "✓" : step.id}
            </div>
          ))}
        </div>
      </div>

      {/* Step Cards */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginTop: "10px"
        }}
      >
        {steps.map((step) => (
          <div
            key={step.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: `${100 / steps.length}%`,
            }}
          >
            {/* Card */}
            <div
              style={{
                width: "56%",
                maxWidth: "200px",
                backgroundColor: "#fff",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 0 0 0",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                border: "1px solid #eaeaea",
                height: "133px"
              }}
            >
              <img
                src={step.icon}
                alt={step.label}
                style={{ width: step.id === 3 ? "28%" : "34%", objectFit: "contain" }}
              />

              
              {/* Button for all steps */}
              <div style={{ width: "100%" }}>
                {step.id !== 3 ? (
                  // Button for Steps 1 & 2
                  <div
                    onClick={
                      (isDisabled && currentStep === step.id) || currentStep > step.id
                        ? null
                        : () => handleTakeTest(step.label)
                    }
                    style={{
                      width: "100%",
                      backgroundColor:
                        currentStep > step.id
                          ? "#28A745" // ✅ Completed
                          : isDisabled && currentStep === step.id
                          ? "#9b9b9b" // ⏳ Cooldown
                          : currentStep === step.id
                          ? "#121212" // Active
                          : "#BFBFBF", // Locked
                      borderBottomLeftRadius: "11px",
                      borderBottomRightRadius: "11px",
                      padding: "18px 0",
                      cursor:
                        currentStep > step.id || (isDisabled && currentStep === step.id)
                          ? "not-allowed"
                          : currentStep === step.id
                          ? "pointer"
                          : "not-allowed",
                      transition: "0.3s",
                      textAlign: "center",
                      height: "50px",
                      marginTop: "8px"
                    }}
                  >
                    <p
                      style={{
                        color: "#fff",
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      {currentStep > step.id
                        ? "Completed"
                        : isDisabled && currentStep === step.id
                        ? "Retake Test"
                        : currentStep === step.id
                        ? "Start Test"
                        : "Coming Soon"}
                    </p>
                  </div>
                ) : (
                  // Special button for Step 3
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: currentStep >= 3 ? "#28A745" : "#BFBFBF",
                      borderBottomLeftRadius: "11px",
                      borderBottomRightRadius: "11px",
                      padding: "18px 0",
                      cursor: currentStep >= 3 ? "pointer" : "not-allowed",
                      transition: "0.3s",
                      textAlign: "center",
                      height: "35px",
                      marginTop: "8px"
                    }}
                    onClick={() => {
                      if (currentStep >= 3) {
                        // Handle Qualified action here
                        console.log("Qualified button clicked");
                        // You can add any specific action for the Qualified button
                      }
                    }}
                  >
                    <p
                      style={{
                        color: "#fff",
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: "600",
                        marginTop: "-15px"
                      }}
                    >
                      {currentStep >= 3 ? "Qualified" : "Locked"}
                    </p>
                  </div>
                )}

                {/* Timer BELOW button only for step in cooldown */}
                {step.id !== 3 && isDisabled && currentStep === step.id && timer && (
                  <div style={{ marginTop: "27px", textAlign: "center" }}>
                    <div style={{ fontWeight: "700", color: "#F3780D", marginTop: "3px",fontSize: "17px" }}>
                      {timer.days > 0 && `${timer.days}d `}
                      {timer.hours > 0 && `${timer.hours}h `}
                      {timer.minutes > 0 && `${timer.minutes}m `}
                      {timer.seconds > 0 && timer.hours === 0 && timer.days === 0
                        && `${timer.seconds}sec`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p
              style={{
                fontSize: "18px",
                lineHeight: "1.4",
                marginTop: "19px",
                fontWeight: "600",
                textAlign: "center",
                color:'#121212'
              }}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )}
</div>
                     {/* */}


                  </div> 
                </div>
              </div> 
            </div>
          </section>
        </div>
        {/*out side of stepper*/}

      </div>
      <div className="row mr-0 ml-10">
  <h3 className='skillBadgeHeading'>Skills Badges</h3>
  
  <div className="col-lg-10 col-md-12" style={{backgroundColor:'#ffffff',borderRadius:'12px',marginLeft:'20px',padding:'20px',width:'95%'}}>
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
    </div>)
  );
};

export default VerifiedBadges;
