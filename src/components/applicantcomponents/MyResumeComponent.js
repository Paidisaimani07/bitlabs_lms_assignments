import React, { useState } from 'react';
import BannerImage from '../../images/blog/dashboard/Banner_Image.png';
import './MyResume.css';
import ModalComponent from './ModalComponent';
import ResumeBuilder from './ResumeBuilder';
import ModalWrapper from './ModalWrapper';
const MyResumeComponent = ({ pdfUrl, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginUrl, setLoginUrl] = useState('');
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const handleCreateNowClick = () => {
    openModal();
   
    setLoginUrl(loginUrl);
    setIsModalOpen(true);
  };

  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };

  const styles = {
    commonContainer: {
      paddingLeft: '2rem',
      paddingRight: '1rem',
      marginLeft: 'auto',
      marginRight: 'auto',
      maxWidth: '1400px',
    },
    banner: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.25rem',
      background: 'linear-gradient(0deg, #161734 0%, #161734 100%), linear-gradient(90deg, #F97316 -2.67%, #FDEC5A 99.69%)',
      padding: '1.25rem',
      borderRadius: '8px',
      color: '#FFF',
    },
    bannerContent: {
      flex: 3,
      color: '#D7D8E0',
      fontFamily: 'Plus Jakarta Sans',
      marginBottom: '1rem', 
    },
    bannerHeading: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: '28px',
      fontStyle: 'normal',
      fontWeight: '800',
      lineHeight: '25px',
      color: 'white',
      marginBottom: '1rem',  
    },
    bannerImage: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: '2rem',  
    },
    bannerImageImg: {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '8px',
    },
    createNewButton: {
      background: 'linear-gradient(90deg, #F97316 11.81%, #FAA729 100%)',
      color: '#FFF',
      border: 'none',
      width: '8rem',
      height: '3rem',
      fontFamily: 'Plus Jakarta Sans',
      fontSize: '1rem',
      fontWeight: '600',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '1rem',  
    },
    changePassword: {
      padding: '1.875rem',
      backgroundColor: 'white',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      borderRadius: '16px',
      marginBottom: '1.25rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
      paddingLeft: '2rem',
    },
    downloadIcon: {
      marginRight: '0.3125rem',
      color: '#787474',
      fontSize: '1.2rem',
      marginBottom: '0.625rem',
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: '600',
    },
    myResumeText: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#F97316',
      textAlign: 'left',
      marginBottom: '0.625rem',
    },
    flatDashboardSetting: {
      padding: '1.25rem',
      borderRadius: '8px',
      paddingLeft: '2rem',
    },
    pdfContainer: {
      width: 'calc(100% - 2rem)',
      height: '600px',
      marginBottom: '1.25rem',
    },
    actionButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: '0.625rem',
      fontFamily: 'Plus Jakarta Sans',
      fontSize: '1rem',
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.commonContainer}>
      <section style={styles.banner}>
        <div style={styles.bannerContent}>
          <h1 style={styles.bannerHeading}>Build your professional resume for free</h1>
          <p>
            Land your dream job faster. Build a standout resume that captivates employers and
            <br />
            propels you towards unparalleled opportunities.
          </p>
          <button style={styles.createNewButton} onClick={handleCreateNowClick}>
            Create Now
          </button>
        </div>
        <div style={styles.bannerImage}>
          <img src={BannerImage} alt="Banner" style={styles.bannerImageImg} className="banner1"/>
        </div>
      </section>

      <section style={styles.changePassword}>
        <span style={styles.myResumeText}></span>
        <div style={styles.actionButtons}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 25" fill="none">
            <path d="M21 15.25V19.25C21 19.7804 20.7893 20.2891 20.4142 20.6642C20.0391 21.0393 19.5304 21.25 19 21.25H5C4.46957 21.25 3.96086 21.0393 3.58579 20.6642C3.21071 20.2891 3 19.7804 3 19.25V15.25" stroke="#787474" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 10.25L12 15.25L17 10.25" stroke="#787474" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 15.25V3.25" stroke="#787474" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={styles.downloadIcon} onClick={handleDownload}>Download</span>
        </div>
      </section>

      <section style={styles.flatDashboardSetting} className="bg-white with-banner">
        <div style={styles.pdfContainer}>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <iframe
              id="pdfViewer"
              title="Resume"
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              style={{ width: '100%', height: '100%', border: 'none', flex: 1 }}
            />
          )}
        </div>
      </section>

    
 <ModalWrapper isOpen={isModalOpen} onClose={closeModal} title="Build Your Resume">
        <ResumeBuilder />
      </ModalWrapper>
    </div>
  );
};

export default MyResumeComponent;
