import React, { useState, useEffect, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import axios from "axios";
import BackButton from '../common/BackButton';

function ResumeBuilder() {
  const location = useLocation();
  const { user } = useUserContext();
  const [loginUrl, setLoginUrl] = useState('');
  const [requestData, setRequestData] = useState(null);
  const iframeRef = useRef(null);

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

  useEffect(() => {
    const apiUrl1 = 'http://43.204.125.6:5173/api/auth/login';

    // Check if requestData is not null before making the API call
    if (requestData) {
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
      fetch(apiUrl1, requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          const loginUrl = `http://43.204.125.6:5173/auth/login?identifier=${encodeURIComponent(requestData.identifier)}&password=${encodeURIComponent(requestData.password)}`;
          setLoginUrl(loginUrl);
          window.open(loginUrl, '_blank');
        })
        .catch(error => {
          // Handle errors here
          console.error('There was a problem with the fetch operation:', error);
        });
    }
  }, [requestData]);



  return (
    <div className="dashboard__content">
      <section className="page-title-dashboard">
        <div className="themes-container">
          <div className="row">
            <div className="col-lg-12 col-md-12 ">
              <div className="title-dashboard">
              <BackButton />
                <div className="title-dash flex2">Build Your Resume</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="flat-dashboard-password">
        <div className="themes-container">
          <div className="row">
            <div className="col-lg-12 col-md-12 ">
              <iframe  id="resume-iframe" src={loginUrl} frameBorder="0" width="100%" height="800px"></iframe>
            </div>
          </div>
        </div>
      </section><br></br>
    </div>
  );
}

export default ResumeBuilder;
