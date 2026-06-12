import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCode } from 'antd';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ProgressAPIService from './ProgressAPIService';
import { useUserContext } from '../../common/UserProvider';
import apiClient from '../../../services/apiClient';
import certificateBg from '../../../images/certificate-template.png';

import './LmsCertificate.css';

const LmsCertificate = () => {
  const [completedCourses, setCompletedCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicantName, setApplicantName] = useState('');
  const [viewingCertificate, setViewingCertificate] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const { user } = useUserContext();
  const navigate = useNavigate();
  const certificateRef = useRef(null);
  const applicantId = user?.id;

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchCertificateData = async () => {
      if (!applicantId) return;

      try {
        setLoading(true);

        let fallbackName = '';

        try {
          const cardResponse = await apiClient.get(
            `/applicant-card/${applicantId}/getApplciantCard`
          );
          fallbackName = cardResponse?.data?.name || '';
        } catch (err) {
          console.error(err);
        }

        const progressData = await ProgressAPIService.getApplicantProgress(applicantId);

        const completed = progressData.filter(
          course => course.overallProgress === 100
        );

        setCompletedCourses(completed);

        if (completed.length > 0) {
          setApplicantName(
            completed[0].applicantName ||
            completed[0].applicant_name ||
            fallbackName ||
            'Student Name'
          );
        } else {
          navigate('/applicant-lmscourses-list');
        }

      } catch (err) {
        console.error(err);
        navigate('/applicant-lmscourses-list');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateData();
  }, [applicantId, navigate]);

  /* ---------------- DATE FORMAT ---------------- */
  const getIssuedDate = (course) => {
    if (!course) return '';

    const src =
      course.completedDate ||
      course.completed_date ||
      course.updatedAt ||
      course.updated_at;

    const date = src ? new Date(src) : new Date();

    const months = [
      'Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec'
    ];

    return `Issued On ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  /* ---------------- VERIFY URL ---------------- */
  const getVerificationUrl = (course) => {
    const id = course.certificateId || course.id;
    return `${window.location.origin}/certificate/verify/${id}`;
  };

  /* ---------------- VIEW CERTIFICATE ---------------- */
  const handleViewCertificate = (course) => {
    setSelectedCourse(course);
    setViewingCertificate(true);
  };

  const handleCloseModal = () => {
    setViewingCertificate(false);
    setSelectedCourse(null);
  };

  /* ---------------- DOWNLOAD PDF ---------------- */
  const handleDownloadCertificate = async (course) => {
    try {
      setDownloadingId(course.id);
      setSelectedCourse(course);

      await new Promise(r => setTimeout(r, 400));

      if (!certificateRef.current) return;

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2.5,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/jpeg');

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);

      const name = course.courseName?.replace(/[^a-z0-9]/gi, '_') || 'Certificate';

      pdf.save(`${name}.pdf`);

    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="certificate-loading-container">
        <div className="certificate-spinner"></div>
        <p>Loading certificates...</p>
      </div>
    );
  }

  return (
    <div className="lms-certificate-page">

      {/* HEADER */}
      <div className="certificate-header-row">
        <h1>LMS Certificates</h1>
        <p>{completedCourses.length} completed</p>
      </div>

      {/* GRID */}
      <div className="certificate-cards-grid">

        {completedCourses.map((course) => (
          <div key={course.id} className="certificate-course-card">

            <h3>{course.courseName}</h3>

            <p>{getIssuedDate(course)}</p>

            <div className="card-actions">

              <button onClick={() => handleViewCertificate(course)}>
                👁 View Certificate
              </button>

              <button
                onClick={() => handleDownloadCertificate(course)}
                disabled={downloadingId === course.id}
              >
                {downloadingId === course.id ? 'Generating...' : 'Download'}
              </button>

            </div>

          </div>
        ))}
      </div>

      {/* MODAL */}
      {viewingCertificate && selectedCourse && (
        <div className="cert-modal-backdrop" onClick={handleCloseModal}>
          <div className="cert-modal-dialog" onClick={(e) => e.stopPropagation()}>

            <div className="cert-modal-header">
              <h3>{selectedCourse.courseName}</h3>
              <button onClick={handleCloseModal}>✖</button>
            </div>

            <div className="cert-modal-body">

              <CertificateTemplate
                certificateRef={certificateRef}
                applicantName={applicantName}
                course={selectedCourse}
                getIssuedDate={getIssuedDate}
                getVerificationUrl={getVerificationUrl}
              />

            </div>

            <div className="cert-modal-footer">

              <button onClick={() => handleDownloadCertificate(selectedCourse)}>
                Download PDF
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

/* ---------------- TEMPLATE ---------------- */
const CertificateTemplate = ({
  certificateRef,
  applicantName,
  course,
  getIssuedDate
}) => (
  <div className="certificate-template-wrapper" ref={certificateRef}>

    <img src={certificateBg} className="certificate-background" />

    <div className="certificate-name">{applicantName}</div>

    <div className="certificate-course">{course.courseName}</div>

    <div className="certificate-date">
      {getIssuedDate(course).replace("Issued On ", "")}
    </div>

    <div className="certificate-qr">
      <QRCode
        value={`name:${applicantName}\ncourse:${course.courseName}`}
        size={120}
        bordered={false}
      />
    </div>

  </div>
);

export default LmsCertificate;