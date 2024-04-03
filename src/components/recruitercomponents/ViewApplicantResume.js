import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
 
const ViewApplicantResume = () => {
  const location = useLocation();
  const [resumeUrl, setResumeUrl] = useState(null); // Remove type annotation
 
  useEffect(() => {
    // Extract ID from the URL path
    const pathnameParts = location.pathname.split('/');
    const userId = pathnameParts[pathnameParts.length - 1];
 
    // Fetch resume PDF using the extracted ID
    fetch(`http://localhost:8081/resume/pdf/${userId}`)
      .then(response => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error('Network response was not ok.');
      })
      .then(blob => {
        // Convert the blob to a URL
        const resumeBlobUrl = URL.createObjectURL(blob);
        setResumeUrl(resumeBlobUrl);
      })
      .catch(error => {
        console.error('There was a problem fetching the resume:', error);
      });
 
    // Clean up the URL object when component unmounts
    return () => {
      if (resumeUrl) {
        URL.revokeObjectURL(resumeUrl);
      }
    };
  }, [location.pathname]);
 
  return (
    <div className="dashboard__content">
    <section className="page-title-dashboard">
      <div className="themes-container">
        <div className="row">
          <div className="col-lg-12 col-md-12 ">
            <div className="title-dashboard">
              <div className="title-dash flex2">Applicant Resume</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="flat-dashboard-password">
      <div className="themes-container">
        <div className="row">
          <div className="col-lg-12 col-md-12 ">
          {resumeUrl ? (
        <iframe title="Resume" src={resumeUrl} width="100%" height="500px" />
      ) : (
        <p>Loading resume...</p>
      )}
          </div>
        </div>
      </div>
    </section><br></br>
  </div>
 
  );
};
 
// Add prop types validation
ViewApplicantResume.propTypes = {
  resumeUrl: PropTypes.string, // Assuming resumeUrl is a string
};
 
export default ViewApplicantResume;