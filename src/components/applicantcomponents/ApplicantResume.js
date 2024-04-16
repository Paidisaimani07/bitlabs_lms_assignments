import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs} from 'react-pdf';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { apiUrl } from '../../services/ApplicantAPIService';
import { Link } from 'react-router-dom';
import BackButton from '../common/BackButton';
import { useUserContext } from '../common/UserProvider';
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`; 
const ApplicantResume = () => {
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasBeenCalled, setHasBeenCalled] = useState(false);
  const [pagesRendered, setPagesRendered] = useState(0); 
  const user = useUserContext().user;
  console.log("firstCall");
  let pdfLink="";
  const fetchResumeContent = async () => {
    console.log("1")
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await fetch(`${apiUrl}/resume/pdf/${user.id}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      console.log("before");
      console.log(response);
      console.log("after");
      if (response.ok) {
        const blob = await response.blob();
        console.log(blob, "blod")
         pdfLink = URL.createObjectURL(blob);
        console.log("url", pdfLink )
        setPdfData(pdfLink);
      } else {
        console.error('Error fetching resume content:', response);
      }
    } catch (error) {
      console.error('Error fetching resume content:', error);
    } finally {
      setLoading(false);
    }
  };
const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };
  const onPageLoadSuccess = () => {
    setPagesRendered((prevPages) => prevPages + 1);
  };
  useEffect(() => {
    fetchResumeContent();
  }, []);
  const containerStyle = {
    width: '100%',
    maxWidth: '800px',
    margin: '20px auto 0',
    overflowX: 'auto',
  };
  const pdfWrapperStyle = {
    width: '100%',
    maxWidth: '100%',
  }; 
return (
  <div  className="dashboard__content">
  <section className="page-title-dashboard">
      <div className="themes-container">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <div className="title-dashboard">
            <BackButton />
              <div className="title-dash flex2">Your Resume</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="flat-dashboard-setting bg-white">
      <div className="themes-container">
      {pdfData ? (
            <iframe title="PDF Viewer" width="100%" height="800px" src={pdfData} />
          ) : (
            <p>No resumes are uploaded.</p>
          )}
       </div>
       </section>
  </div>
);
};
export default ApplicantResume;