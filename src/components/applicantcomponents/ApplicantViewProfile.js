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
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', paddingBottom: '8px' }}>
                <button
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'transparent linear-gradient(286deg, #FBBB5C 0%, #E66A0E 100%) 0% 0% no-repeat padding-box',
                    color: '#FFFFFF',
                    padding: '16px 40px',
                    borderRadius: '50px',
                    border: 'none',
                    fontWeight: '500',
                    fontSize: '14px',
                    letterSpacing: '0.5px',
                    textTransform: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(249, 115, 22, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(249, 115, 22, 0.45)';
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.color = '#E66A0E';
                    e.currentTarget.style.border = '2px solid #E66A0E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(249, 115, 22, 0.3)';
                    e.currentTarget.style.background = 'transparent linear-gradient(286deg, #FBBB5C 0%, #E66A0E 100%) 0% 0% no-repeat padding-box';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.border = 'none';
                  }}
                  onClick={handleLmsCertificatesClick}
                  disabled={checkingProgress}
                >
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {checkingProgress ? 'Checking...' : 'LMS Certificates'}
                  </span>
                </button>
              </div>
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
                    <div 
                      style={{
                        position: 'relative',
                        width: '1060px',
                        height: '750px',
                        fontFamily: 'Georgia, serif',
                        overflow: 'visible',
                        transform: 'scale(0.85)',
                        transformOrigin: 'top center'
                      }}
                    >
                      <img 
                        src={certificateBg} 
                        alt="Certificate" 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                      
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '13%',
                        transform: 'translateX(-50%)',
                        fontSize: '35px',
                        fontWeight: 700,
                        color: '#111827',
                        whiteSpace: 'nowrap'
                      }}>
                        {applicantName}
                      </div>
                      
                      <div style={{
                        position: 'absolute',
                        top: '60%',
                        left: '8%',
                        fontSize: '20px',
                        color: '#334155',
                        textAlign: 'left',
                        maxWidth: '90%',
                        wordWrap: 'break-word'
                      }}>
                        {selectedCertificate.courseName}
                      </div>
                      
                      <div style={{
                        position: 'absolute',
                        top: '65.5%',
                        left: '16%',
                        fontSize: '14px',
                        color: '#475569'
                      }}>
                        {selectedCertificate.completedDate || selectedCertificate.completed_date || new Date().toLocaleDateString()}
                      </div>

                 

                      <div style={{
                        position: 'absolute',
                        top: '70%',
                        right: '70px'
                      }}>
                        {/* <QRCode
                          value={`name:${selectedCertificate.applicantName || selectedCertificate.applicant_name || user?.name}\ncourse:${selectedCertificate.courseName}`}
                          size={120}
                          bordered={false}
                        /> */}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
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
          </>
        ) : (
          <div>Unable to identify applicant.</div>
        )}
      </div>
    </div>
  );
};

export default ApplicantViewProfile;
