
import React, { useState } from 'react';
import './EditAndDownloadComponent.css';
import ModalComponent from './ModalComponent';
import { ClipLoader } from 'react-spinners';
import ResumeBuilder from './ResumeBuilder';
import ModalWrapper from './ModalWrapper';

 
const EditAndDownloadComponent = ({ pdfUrl, loading }) => {
  const [requestData, setRequestData] = useState({ identifier: 'your-identifier', password: 'your-password' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);
  const [loginUrl, setLoginUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
 
  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };
 
  return (
    <div className="themes-container pdf-container">
      {loading || isLoggingIn ? (
        <div className="spinner-container">
          <ClipLoader color="#0d6efd" loading={loading || isLoggingIn} size={50} />
        </div>
      ) : (
        <div className="pdf-viewer">
             <div className="button-overlay">
            
      <ModalWrapper isOpen={isModalOpen} onClose={closeModal} title="Build Your Resume">
        <ResumeBuilder />
      </ModalWrapper>
          
            <section className="flat-dashboard-password">
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12 ">
                  <div className="change-password bg-white" style={{borderRadius:'23px 23px 1px 2px'}}>
                  <div className="action-buttons" style={{ textAlign: 'right', paddingRight: '10px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 25" fill="none">
  <path d="M11 4.25H4C3.46957 4.25 2.96086 4.46071 2.58579 4.83579C2.21071 5.21086 2 5.71957 2 6.25V20.25C2 20.7804 2.21071 21.2891 2.58579 21.6642C2.96086 22.0393 3.46957 22.25 4 22.25H18C18.5304 22.25 19.0391 22.0393 19.4142 21.6642C19.7893 21.2891 20 20.7804 20 20.25V13.25" stroke="#787474" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18.5 2.74998C18.8978 2.35216 19.4374 2.12866 20 2.12866C20.5626 2.12866 21.1022 2.35216 21.5 2.74998C21.8978 3.14781 22.1213 3.68737 22.1213 4.24998C22.1213 4.81259 21.8978 5.35216 21.5 5.74998L12 15.25L8 16.25L9 12.25L18.5 2.74998Z" stroke="#787474" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>&nbsp;
                  <span className="edit" onClick={openModal} style={{ cursor: 'pointer',fontSize: '15px' }}>
                  
                    Edit</span>&nbsp;&nbsp;&nbsp;&nbsp;
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 25" fill="none">
  <path d="M21 15.25V19.25C21 19.7804 20.7893 20.2891 20.4142 20.6642C20.0391 21.0393 19.5304 21.25 19 21.25H5C4.46957 21.25 3.96086 21.0393 3.58579 20.6642C3.21071 20.2891 3 19.7804 3 19.25V15.25" stroke="#787474" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7 10.25L12 15.25L17 10.25" stroke="#787474" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 15.25V3.25" stroke="#787474" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>&nbsp; 
                  <span className="edit" onClick={handleDownload} style={{ cursor: 'pointer',fontSize: '15px' }}>
                  Download</span>
                </div>
                  </div>
                  </div>
                  </div>
                  </div>
                  </section>
           
          </div>
          <iframe
            id="pdfViewer"
            title="Resume"
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            width="90%"
            height="900"
            frameBorder="0"
          />
         
        </div>
      )}
 
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
 
      <ModalComponent
        isOpen={isModalOpen}
        
        onRequestClose={() => setIsModalOpen(false)}
        loginUrl={loginUrl}
      />
      
    
    </div>
  );
};
 
export default EditAndDownloadComponent;