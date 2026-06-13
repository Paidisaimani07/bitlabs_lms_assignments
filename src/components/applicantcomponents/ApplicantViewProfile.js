import { useUserContext } from "../common/UserProvider";
import ApplicantHeaderComponent from "./ApplicantHeaderComponent";
import ResumeSummaryCard from "./ResumeSummaryCard";
import SocialLinksCard from "./SocialLinksCard";
import PersonalDetailsCard from "./PersonalDetailsCard";
import EducationDetailsCard from "./EducationDetailsCard";
import ProjectDetailsCard from "./ProjectDetailsCard";
import KeySkillsCard from "./KeySkillsCard";
import SkillBadgesGrid from "./SkillBadgesGrid";
import "./modalpopup.css";
import "./Portfolio.css";
import "./bitLabs-LMS/LmsCertificate.css";
import ApplicantAtsResume from "./ApplicantAtsResume/ApplicantAtsResume";
import { useResume } from "./ResumeContext";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProgressAPIService from "./bitLabs-LMS/ProgressAPIService";
import LmsUnlockModal from "./bitLabs-LMS/LmsUnlockModal";
import LmsCertificatesGrid from "./LmsCertificatesGrid";
import certificateBg from '../../images/certificate-template.png';
import apiClient from '../../services/apiClient';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { QRCode } from 'antd';
import htmlCssIcon from '../../images/html-css-certificate.png';
import pythonIcon from '../../images/python-certificate.png';
import javaIcon from '../../images/java-certificate.png';
import sqlIcon from '../../images/sql-certificate.png';
import javascriptIcon from '../../images/javascript-certificate.png';
import reactIcon from '../../images/react-certificate.png';
import springbootIcon from '../../images/springboot-certificate.png';

const getCourseIcon = (courseName) => {
  if (!courseName) return null;
  const name = courseName.toLowerCase();
  if (name.includes("html") || name.includes("css")) return htmlCssIcon;
  if (name.includes("python")) return pythonIcon;
  if (name.includes("springboot") || name.includes("spring boot")) return springbootIcon;
  if (name.includes("react")) return reactIcon;
  if (name.includes("javascript") || name.includes("js")) return javascriptIcon;
  if (name.includes("sql")) return sqlIcon;
  if (name.includes("java")) return javaIcon;
  return null;
};

const getIssuedDate = (course) => {
  if (!course) return '';
  const src =
    course.completedDate ||
    course.completed_date ||
    course.updatedAt ||
    course.updated_at;

  let date;
  if (Array.isArray(src)) {
    const year = src[0] || new Date().getFullYear();
    const month = src[1] !== undefined ? src[1] - 1 : new Date().getMonth();
    const day = src[2] || 1;
    date = new Date(year, month, day);
  } else if (src) {
    date = new Date(src);
  } else {
    date = new Date();
  }

  if (isNaN(date.getTime())) {
    date = new Date();
  }

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const ApplicantViewProfile = () => {
  const { user } = useUserContext();
  const applicantId = user?.id;
  const { resumeState, setProfileData } = useResume();
  const profileData = resumeState.profileData;
  const navigate = useNavigate();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [checkingProgress, setCheckingProgress] = useState(false);
  const [lmsCertificates, setLmsCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [applicantName, setApplicantName] = useState('');

  const handleLmsCertificatesClick = async () => {
    if (!applicantId) return;

    try {
      setCheckingProgress(true);

      const progressData = await ProgressAPIService.getApplicantProgress(applicantId);

      const completedCourses = progressData.filter(
        course => course.overallProgress === 100
      );

      setLmsCertificates(completedCourses);

      if (completedCourses.length > 0) {
        // Scroll to certificates section
        const certSection = document.getElementById('lms-certificates-section');
        if (certSection) {
          certSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        setShowUnlockModal(true);
      }

    } catch (error) {
      console.error('Error checking progress:', error);
      setShowUnlockModal(true);
    } finally {
      setCheckingProgress(false);
    }
  };

  const handleViewCertificate = (cert) => {
    setSelectedCertificate(cert);
    setShowCertificateModal(true);
  };

  const [downloadingCertificate, setDownloadingCertificate] = useState(null);
  const downloadRef = useRef(null);

  const handleDownloadCertificate = async (course) => {
    try {
      setDownloadingCertificate(course);
      // Wait for offscreen template rendering
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!downloadRef.current) {
        console.error("Download template ref not found");
        return;
      }

      const canvas = await html2canvas(downloadRef.current, {
        scale: 2.5,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/jpeg');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);

      const name = course.courseName?.replace(/[^a-z0-9]/gi, '_') || 'Certificate';
      pdf.save(`${name}.pdf`);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloadingCertificate(null);
    }
  };

  const [loadedSections, setLoadedSections] = useState({
    header: false,
    summary: false,
    socialLinks: false,
    personal: false,
    education: false,
    projects: false,
    skills: false,
    //SkillBadgesGrid: false
  });

  const location = useLocation();
  const atsRef = useRef(null);

  useEffect(() => {
    if (location.state?.scrollToATS && atsRef.current) {
      atsRef.current.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    }
  }, [location.state]);
  const markLoaded = (section) => {
    setLoadedSections((prev) => ({
      ...prev,
      [section]: true,
    }));
  };
  const allLoaded = Object.values(loadedSections).every(Boolean);
  console.log("Loaded sections:", loadedSections);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!applicantId) return;

      try {
        setLoadingCertificates(true);

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

        const completedCourses = progressData.filter(
          course => course.overallProgress === 100
        );

        setLmsCertificates(completedCourses);

        if (completedCourses.length > 0) {
          setApplicantName(
            completedCourses[0].applicantName ||
            completedCourses[0].applicant_name ||
            fallbackName ||
            user?.name ||
            'Student Name'
          );
        }
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoadingCertificates(false);
      }
    };

    fetchCertificates();
  }, [applicantId, user?.name]);

  useEffect(() => {
    console.log("Context profileData updated:", resumeState.profileData);
    console.log("Context profileData updated:", resumeState.jobDescription);
  }, [resumeState]);

  return (
    <div className="border-style">
      <div className="blur-border-style"></div>
      <div className="dashboard__content">
        {/* Title */}
        <div className="row mr-0 ml-10 extraSpace">
          <div className="col-lg-12 col-md-12">
            <section className="page-title-dashboard">
              <div className="themes-container">
                <div className="row">
                  <div className="col-lg-12 col-md-12">
                    <div
                      className="title-dashboard"
                      style={{ margin: "0 0 -15px -40px" }}
                    >
                      <div className="title-dash flex2 common_style">
                        My portfolio
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        {applicantId ? (
          <>
            <ApplicantHeaderComponent
              applicantId={applicantId}
              setProfileData={setProfileData}
              onLoaded={() => markLoaded("header")}
              showContent={allLoaded}
            />
            <ResumeSummaryCard
              applicantId={applicantId}
              onLoaded={() => markLoaded("summary")}
              showContent={allLoaded}
              onChange={(data) =>
                setProfileData((prev) => ({
                  ...prev,
                  resumeSummary: data,
                }))
              }
            />
            <SocialLinksCard
              applicantId={applicantId}
              onLoaded={() => markLoaded("socialLinks")}
              showContent={allLoaded}
            />
            <PersonalDetailsCard
              applicantId={applicantId}
              onLoaded={() => markLoaded("personal")}
              showContent={allLoaded}
              onChange={(data) =>
                setProfileData((prev) => ({
                  ...prev,
                  personalDetails: data,
                }))
              }
            />
            <EducationDetailsCard
              applicantId={applicantId}
              onLoaded={() => markLoaded("education")}
              showContent={allLoaded}
              onChange={(data) =>
                setProfileData((prev) => ({
                  ...prev,
                  educationDetails: data,
                }))
              }
            />
            <ProjectDetailsCard
              applicantId={applicantId}
              onLoaded={() => markLoaded("projects")}
              showContent={allLoaded}
              onChange={(data) =>
                setProfileData((prev) => ({
                  ...prev,
                  projectDetails: data,
                }))
              }
            />
            <KeySkillsCard
              applicantId={applicantId}
              onLoaded={() => markLoaded("skills")}
              showContent={allLoaded}
              onChange={(data) =>
                setProfileData((prev) => ({
                  ...prev,
                  keySkills: data,
                }))
              }
            />
            <div ref={atsRef}>
              <ApplicantAtsResume
                applicantId={applicantId}
                onLoaded={() => markLoaded("applicantAtsResume")}
                showContent={allLoaded}
              />
            </div>
            {/* ===================== Skill Badges (NEW CARD) ===================== */}
            <div className="card-base soft-shadow">
              <div className="card-title-row">
                <h3 className="card-title common_style">Passed skill badges</h3>
              </div>
              <SkillBadgesGrid
                onLoaded={() => markLoaded("skillBadges")}
                showContent={allLoaded}
              />
            </div>
            {/* =================== /Skill Badges (NEW CARD) =================== */}
            {/* ===================== LMS CERTIFICATES ===================== */}
            <div id="lms-certificates-section" className="card-base soft-shadow">
              <div className="card-title-row">
                <h3 className="card-title common_style">LMS Certificates</h3>
              </div>

              {loadingCertificates ? (
                <p>Loading certificates...</p>
              ) : (
                <LmsCertificatesGrid
                  certificates={lmsCertificates}
                  onViewCertificate={handleViewCertificate}
                  onDownloadCertificate={handleDownloadCertificate}
                  applicantName={applicantName}
                />
              )}
            </div>
            <LmsUnlockModal isOpen={showUnlockModal} onClose={() => setShowUnlockModal(false)} />

            {/* Certificate View Modal */}
            {showCertificateModal && selectedCertificate && (
              <div
                className="cert-modal-backdrop"
                onClick={() => setShowCertificateModal(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(15,23,42,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 999
                }}
              >
                <div
                  className="cert-modal-dialog"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    width: '90%',
                    maxWidth: '900px',
                    padding: '20px',
                    maxHeight: '90vh',
                    overflow: 'auto'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{selectedCertificate.courseName}</h3>
                    <button
                      onClick={() => setShowCertificateModal(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#64748b'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="certificate-preview-outer">
                      <div className="certificate-preview-scaler">
                        <div 
                          className="certificate-template-wrapper"
                          style={{ fontFamily: 'Georgia, serif' }}
                        >
                          <img 
                            src={certificateBg} 
                            alt="Certificate" 
                            className="certificate-background"
                          />
                          
                          <div className="certificate-name">
                            {applicantName}
                          </div>
                          
                          <div className="certificate-course">
                            {selectedCertificate.courseName}
                          </div>
                          
                          <div className="certificate-date">
                            {getIssuedDate(selectedCertificate)}
                          </div>

                          {getCourseIcon(selectedCertificate.courseName) && (
                            <div className="certificate-skill-icon">
                              <img 
                                src={getCourseIcon(selectedCertificate.courseName)} 
                                alt="Skill Icon" 
                              />
                            </div>
                          )}

                          <div className="certificate-qr">
                            <QRCode
                              value={`name:${selectedCertificate.applicantName || selectedCertificate.applicant_name || applicantName || 'Student'}\ncourse:${selectedCertificate.courseName || selectedCertificate.course_name || 'Course'}\nVERIFIED`}
                              size={120}
                              bordered={false}
                              type="svg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button
                      onClick={() => handleDownloadCertificate(selectedCertificate)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'linear-gradient(286deg, #FBBB5C 0%, #E66A0E 100%)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => setShowCertificateModal(false)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '6px',
                        border: '2px solid #e66a0e',
                        background: 'white',
                        color: '#e66a0e',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden container for offscreen PDF rendering and download capture */}
            {downloadingCertificate && (
              <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div 
                  ref={downloadRef}
                  className="certificate-template-wrapper"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  <img 
                    src={certificateBg} 
                    alt="Certificate" 
                    className="certificate-background"
                  />
                  
                  <div className="certificate-name">
                    {applicantName}
                  </div>
                  
                  <div className="certificate-course">
                    {downloadingCertificate.courseName}
                  </div>
                  
                  <div className="certificate-date">
                    {getIssuedDate(downloadingCertificate)}
                  </div>

                  {getCourseIcon(downloadingCertificate.courseName) && (
                    <div className="certificate-skill-icon">
                      <img 
                        src={getCourseIcon(downloadingCertificate.courseName)} 
                        alt="Skill Icon" 
                      />
                    </div>
                  )}

                  <div className="certificate-qr">
                    <QRCode
                      value={`name:${downloadingCertificate.applicantName || downloadingCertificate.applicant_name || applicantName || 'Student'}\ncourse:${downloadingCertificate.courseName || downloadingCertificate.course_name || 'Course'}\nVERIFIED`}
                      size={120}
                      bordered={false}
                      type="svg"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div>Unable to identify applicant.</div>
        )}
      </div>
    </div>
  );
};

export default ApplicantViewProfile;
