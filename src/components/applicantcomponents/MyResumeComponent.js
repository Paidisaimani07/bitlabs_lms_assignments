import React, { useState } from 'react';
import BannerImage from '../../images/blog/dashboard/Banner_Image.png';
import DownloadIcon from '../../images/blog/dashboard/downloadbutton.png'; // Import the download icon image
import './MyResume.css';
import ModalComponent from './ModalComponent';
 
const MyResumeComponent = ({ pdfUrl, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginUrl, setLoginUrl] = useState('');
 
  const handleCreateNowClick = () => {
    const loginUrl = `https://resume.bitlabs.in:5173/auth/login?redirect=/dashboard/resumes`;
    setLoginUrl(loginUrl);
    setIsModalOpen(true);
  };
  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };
  return (
    <>
   
      <section className="banner">
        <div className="banner-content">
          <h1>Build your professional resume for free</h1>
          <p>
            Land your dream job faster. Build a standout resume that captivates employers and
            <br />
            propels you towards unparalleled opportunities.
          </p>
          <button className="create-new-button" onClick={handleCreateNowClick}>
            Create Now
          </button>
        </div>
        <div className="banner-image">
          <img src={BannerImage} alt="Banner" />
        </div>
      </section>
      
      <div className="action-buttons" style={{ textAlign: 'right', paddingRight: '10px' }}>
      
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 25" fill="none">
        <path d="M21 15.25V19.25C21 19.7804 20.7893 20.2891 20.4142 20.6642C20.0391 21.0393 19.5304 21.25 19 21.25H5C4.46957 21.25 3.96086 21.0393 3.58579 20.6642C3.21071 20.2891 3 19.7804 3 19.25V15.25" stroke="#787474" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 10.25L12 15.25L17 10.25" stroke="#787474" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 15.25V3.25" stroke="#787474" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>&nbsp; 
                  <span className="edit" onClick={handleDownload} style={{ cursor: 'pointer',fontSize: '15px' }}>
                  Download</span>
                </div>
      <section className="flat-dashboard-setting bg-white with-banner">
        <div className="themes-container pdf-container">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <iframe
              id="pdfViewer"
              title="Resume"
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              width="100%"
              height="600"
              frameBorder="0"
            />
          )}
        </div>
      </section>
 
      <ModalComponent
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        loginUrl={loginUrl}
      />
    </>
  );
};
 
export default MyResumeComponent;