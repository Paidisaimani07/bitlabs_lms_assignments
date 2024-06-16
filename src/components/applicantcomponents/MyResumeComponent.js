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
 
  return (
    <>
      <section className="page-title-dashboard">
        <div className="themes-container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <div className="title-dashboard">            
                <div className="title-dash flex2">My Resume</div>
              </div>
            </div>
          </div>
        </div>
      </section>
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
      <section className="download-section">
        <a href={pdfUrl} download="resume.pdf" className="download-link">
          <img src={DownloadIcon} alt="Download" />
          <span>Download</span>
        </a>
      </section>
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
 