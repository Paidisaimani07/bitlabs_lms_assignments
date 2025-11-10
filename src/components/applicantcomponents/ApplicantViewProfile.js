// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { apiUrl } from '../../services/ApplicantAPIService';
// import { useUserContext } from '../common/UserProvider';
// import { Link, useNavigate } from 'react-router-dom';

// import Camera from '../../images/icons/camera.png';
// import Resume from '../../images/icons/resume.png';
// import mortarboard1 from '../../images/icons/mortarboard1.png';
// import pencil1 from '../../images/icons/pencil1.png';

// import UploadImageComponent from './UploadImageComponent';
// import BasicDetailsEditPopup from './BasicDetailsEditPopup';
// import ProfessionalDetailsPopup from './ProfessionalDetailsPopup';
// import ResumeEditPopup from './ResumeEditPopup';
// import Snackbar from '../common/Snackbar';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faTimes } from '@fortawesome/free-solid-svg-icons';
// import Modal from 'react-modal';

// import Certified from '../../images/Certified.svg';
// import Profile_Certified from '../../images/Profile_Certified.svg';
// import SkillBadgesGrid from './SkillBadgesGrid';


// import './modalpopup.css';
// import './Portfolio.css';

// const ApplicantViewProfile = () => {
//   const [profileData, setProfileData] = useState(null);
//   const [imageSrc, setImageSrc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [alertShown] = useState(false);
//   const [resumeFileName, setResumeFileName] = useState('');
//   const [snackbars, setSnackbars] = useState([]);
//   const [flag, setFlag] = useState(false);

//   // modals
//   const [cameraModalIsOpen, setCameraModalIsOpen] = useState(false);
//   const [editModalIsOpen, setEditModalIsOpen] = useState(false);
//   const [edit1ModalIsOpen, setEdit1ModalIsOpen] = useState(false);
//   const [resumeModalIsOpen, setResumeModalIsOpen] = useState(false);
//   const [summaryModalIsOpen, setSummaryModalIsOpen] = useState(false); // NEW

//   const navigate = useNavigate();
//   const { user } = useUserContext();
//   const id = user.id;

//   const addSnackbar = (snackbar) => setSnackbars((prev) => [...prev, snackbar]);
//   const handleCloseSnackbar = (index) =>
//     setSnackbars((prev) => prev.filter((_, i) => i !== index));

//   // tests flag
//   useEffect(() => {
//     (async () => {
//       try {
//         const jwtToken = localStorage.getItem('jwtToken');
//         const { data } = await axios.get(`${apiUrl}/applicant1/tests/${user.id}`, {
//           headers: { Authorization: `Bearer ${jwtToken}` },
//         });
//         const allTestsPassed =
//           data.length >= 2 && data.every((t) => t.testStatus?.toLowerCase() === 'p');
//         setFlag(allTestsPassed);
//       } catch (e) {
//         console.error('Error fetching test data:', e);
//       }
//     })();
//   }, [user.id]);

//   // profile + photo
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const jwtToken = localStorage.getItem('jwtToken');

//         const profileRes = await axios.get(`${apiUrl}/applicantprofile/${id}/profile-view`, {
//           headers: { Authorization: `Bearer ${jwtToken}` },
//         });
//         if (!mounted) return;
//         setProfileData(profileRes.data);

//         const imgRes = await axios.get(`${apiUrl}/applicant-image/getphoto/${id}`, {
//           responseType: 'arraybuffer',
//           headers: { Authorization: `Bearer ${jwtToken}` },
//         });
//         const base64Image = btoa(
//           new Uint8Array(imgRes.data).reduce((s, b) => s + String.fromCharCode(b), '')
//         );
//         if (!mounted) return;
//         setImageSrc(`data:${imgRes.headers['content-type']};base64,${base64Image}`);

//         setLoading(false);
//       } catch (e) {
//         setLoading(false);
//         console.error('Error loading profile:', e);
//         addSnackbar({ message: 'Profile not found. Please fill in your profile.', type: 'error' });
//         // window.location.href = '/applicant-view-profile';
//       }
//     })();
//     return () => (mounted = false);
//   }, [id, user]);

//   // resume filename
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         if (!profileData) return;
//         const jwtToken = localStorage.getItem('jwtToken');
//         const res = await axios.get(`${apiUrl}/applicant-pdf/getresume/${id}`, {
//           headers: { Authorization: `Bearer ${jwtToken}` },
//         });
//         if (!mounted) return;
//         if (res.data) {
//           const firstName = profileData?.basicDetails?.firstName || '';
//           const lastName = profileData?.basicDetails?.lastName || '';
//           setResumeFileName(`${firstName}_${lastName}.pdf`);
//         }
//       } catch (e) {
//         console.error('Error fetching resume:', e);
//       }
//     })();
//     return () => (mounted = false);
//   }, [id, profileData]);

//   if (loading) return <div>Loading...</div>;
//   if (!profileData || alertShown) {
//     return (
//       <div>
//         {!profileData && <p>Please fill in your bio data and upload a profile pic.</p>}
//         {alertShown && <p>Alert already shown.</p>}
//       </div>
//     );
//   }

//   // helpers
//   const formatUpdatedOn = (iso) => {
//     try {
//       const d = iso ? new Date(iso) : new Date();
//       return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
//     } catch {
//       return '';
//     }
//   };

//   const passOutYear =
//     profileData?.graduationDetails?.gyearOfPassing ||
//     profileData?.intermediateDetails?.iyearOfPassing ||
//     '';

//   const fullName = `${profileData?.basicDetails?.firstName || ''} ${profileData?.basicDetails?.lastName || ''}`.trim();
//   const roleTitle = profileData?.applicant?.title || 'Full–Stack Developer';
//   const updatedOnText = formatUpdatedOn(profileData?.updatedAt);
//   const phoneText = profileData?.basicDetails?.alternatePhoneNumber || '';
//   const emailText = profileData?.basicDetails?.email || '';
//   const locationText = [profileData?.basicDetails?.city, profileData?.basicDetails?.state, 'India']
//     .filter(Boolean)
//     .join(', ');
//   const score = profileData?.applicant?.overallScore ?? profileData?.score ?? 0;
//   const showMedals = !!flag;

//   // modal handlers
//   const handleCameraClick = () => setCameraModalIsOpen(true);
//   const handleEditClick = () => setEditModalIsOpen(true);
//   const handleEdit1Click = () => setEdit1ModalIsOpen(true);
//   const handleResumeClick = () => setResumeModalIsOpen(true);
//   const openSummary = () => setSummaryModalIsOpen(true);

//   const closeCameraModal = () => setCameraModalIsOpen(false);
//   const closeEditModal = () => setEditModalIsOpen(false);
//   const closeEdit1Modal = () => setEdit1ModalIsOpen(false);
//   const closeResumeModal = () => setResumeModalIsOpen(false);
//   const closeSummary = () => setSummaryModalIsOpen(false);

//   const handleResumeClick1 = async () => {
//     try {
//       const response = await axios.get(`${apiUrl}/applicant-pdf/getresume/${id}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` },
//         responseType: 'blob',
//       });
//       const blob = new Blob([response.data], { type: 'application/pdf' });
//       const url = window.URL.createObjectURL(blob);
//       window.open(url, '_blank');
//     } catch (error) {
//       console.error('Error fetching resume:', error);
//     }
//   };

//   // derived data for personal details card
//   const gender = profileData?.basicDetails?.gender || '';
//   const dob = profileData?.basicDetails?.dateOfBirth || '';
//   const pincode = profileData?.basicDetails?.pincode || '';
//   const address = profileData?.basicDetails?.address || '';
//   const languages = (profileData?.knownLanguages || []).join(', ');

//   return (
//     <div className="dashboard__content">
//       {/* Title */}
//       <div className="row mr-0 ml-10">
//         <div className="col-lg-12 col-md-12">
//           <section className="page-title-dashboard">
//             <div className="themes-container">
//               <div className="row">
//                 <div className="col-lg-12 col-md-12">
//                   <div className="title-dashboard">
//                     <div className="title-dash flex2">My Portfolio</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </div>
//       </div>

//       {/* ================= Header Card (already done) ================= */}
//       <div className="col-lg-12 col-md-12">
//         <div className="portfolio-card">
//           <div className="portfolio-left">
//             <div className="portfolio-avatar-wrap">
//               <img
//                 className="portfolio-avatar"
//                 src={imageSrc || '../images/user/avatar/profile-pic.png'}
//                 alt={`${fullName || 'User'} profile`}
//                 onError={() => setImageSrc('../images/user/avatar/profile-pic.png')}
//               />
//               <button
//                 type="button"
//                 className="portfolio-camera-btn"
//                 aria-label="Upload profile picture"
//                 onClick={handleCameraClick}
//               >
//                 <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
//                   <path d="M9 7l1.5-2h3L15 7h3a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h3z" stroke="#6b7280" fill="none" strokeWidth="1.5"/>
//                   <circle cx="12" cy="13" r="3.5" stroke="#6b7280" fill="none" strokeWidth="1.5"/>
//                 </svg>
//               </button>
//             </div>

//             <div className="portfolio-meta">
//               <div className="portfolio-name-row">
//                 <h3 className="portfolio-name">{fullName}</h3>

//                 {showMedals && (
//                   <div className="portfolio-medals" aria-label="Achievements">
//                     <span className="portfolio-medal" title="Gold">🥇</span>
//                     <span className="portfolio-medal" title="Silver">🥈</span>
//                     <span className="portfolio-medal" title="Bronze">🥉</span>
//                   </div>
//                 )}

//                 <button type="button" className="portfolio-edit-btn" onClick={handleEditClick}>
//                   Edit ✎
//                 </button>
//               </div>

//               <p className="portfolio-role">{roleTitle}</p>
//               <p className="portfolio-updated">Portfolio last updated – {updatedOnText}</p>
//             </div>
//           </div>

//           <div className="portfolio-divider" aria-hidden="true" />

//           <div className="portfolio-middle">
//             <div className="portfolio-row">
//               {/* phone */}
//               <svg className="portfolio-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//                 <path d="M3 5a2 2 0 012-2h2l2 5-2 1a13 13 0 006 6l1-2 5 2v2a2 2 0 01-2 2h-1C9.716 19 5 14.284 5 8V7a2 2 0 012-2H7" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//               <span>{phoneText || '-'}</span>
//             </div>
//             <div className="portfolio-row">
//               {/* email */}
//               <svg className="portfolio-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//                 <path d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="#9E9E9E" strokeWidth="1.5" />
//                 <path d="M22 8l-10 6L2 8" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//               <span>{emailText || '-'}</span>
//             </div>
//             <div className="portfolio-row">
//               {/* calendar */}
//               <svg className="portfolio-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//                 <path d="M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//               <span>{passOutYear ? `${passOutYear} passed out` : 'Passed out year not set'}</span>
//             </div>
//             <div className="portfolio-row">
//               {/* location */}
//               <svg className="portfolio-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//                 <path d="M12 22s7-5.686 7-12a7 7 0 0 0-14 0c0 6.314 7 12 7 12Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                 <circle cx="12" cy="10" r="3" stroke="#9E9E9E" strokeWidth="1.5"/>
//               </svg>
//               <span>{locationText || '-'}</span>
//             </div>
//           </div>

//           <div className="portfolio-right">
//             <p className="portfolio-score-label">Score</p>
//             <div className="portfolio-score">{Number.isFinite(+score) ? score : 0}</div>
//           </div>
//         </div>

//         {/* Camera modal */}
//         <Modal
//           isOpen={cameraModalIsOpen}
//           onRequestClose={() => setCameraModalIsOpen(false)}
//           contentLabel="Upload Photo"
//           className="modal-content1"
//           overlayClassName="modal-overlay"
//         >
//           <div style={{ position: 'absolute', top: 10, right: 20 }}>
//             <FontAwesomeIcon icon={faTimes} onClick={() => setCameraModalIsOpen(false)} style={{ cursor: 'pointer', color: '#333' }} />
//           </div>
//           <UploadImageComponent id={id} />
//         </Modal>

//         {/* Basic details edit */}
//         <Modal
//           isOpen={editModalIsOpen}
//           onRequestClose={() => setEditModalIsOpen(false)}
//           contentLabel="Edit Details"
//           className="modal-content2"
//           overlayClassName="modal-overlay"
//         >
//           <div style={{ position: 'absolute', top: 10, right: 20 }}>
//             <FontAwesomeIcon icon={faTimes} onClick={() => setEditModalIsOpen(false)} style={{ cursor: 'pointer', color: '#333' }} />
//           </div>
//           <BasicDetailsEditPopup applicantDetails={profileData.basicDetails} />
//         </Modal>
//       </div>

//       {/* ================= NEW: Resume Summary card ================= */}
//       <div className="col-lg-12 col-md-12">
//         <div className="card-base soft-shadow">
//           <div className="card-title-row">
//             <h4 className="card-title">Resume summary <span className="req">*</span></h4>
//             <button type="button" className="edit-chip" onClick={openSummary}>Edit ✎</button>
//           </div>
//           <p className="summary-text">
//             {profileData?.applicant?.summary ||
//               'We are seeking a skilled Java Full Stack Developer to design, develop, and maintain scalable web applications...'}
//           </p>
//         </div>
//       </div>

//       {/* Summary edit (simple textarea for now) */}
//       <Modal
//         isOpen={summaryModalIsOpen}
//         onRequestClose={closeSummary}
//         contentLabel="Edit Summary"
//         className="modal-content2"
//         overlayClassName="modal-overlay"
//       >
//         <div style={{ position: 'absolute', top: 10, right: 20 }}>
//           <FontAwesomeIcon icon={faTimes} onClick={closeSummary} style={{ cursor: 'pointer', color: '#333' }} />
//         </div>
//         <div style={{ paddingTop: 24 }}>
//           <h3 style={{ marginBottom: 12 }}>Edit Resume Summary</h3>
//           <textarea defaultValue={profileData?.applicant?.summary || ''} rows={8} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
//           <div style={{ marginTop: 12, textAlign: 'right' }}>
//             <button className="btn-primary" onClick={closeSummary}>Save</button>
//           </div>
//         </div>
//       </Modal>

//       {/* ================= NEW: Personal details card ================= */}
//       <div className="col-lg-12 col-md-12">
//         <div className="card-base soft-shadow">
//           <div className="card-title-row">
//             <h4 className="card-title">Personal details <span className="req">*</span></h4>
//             <button type="button" className="edit-chip" onClick={handleEditClick}>Edit ✎</button>
//           </div>

//           <p className="card-subtitle">
//             This information is important for employers to know you better
//           </p>

//           <div className="pd-grid">
//             <input className="pd-input" readOnly placeholder="Enter full name" value={fullName} />
//             <div className="pd-select-wrap">
//               <select className="pd-select" disabled value={gender || ''} onChange={() => {}}>
//                 <option value="">{gender ? gender : 'Choose gender'}</option>
//               </select>
//               <span className="pd-caret">▾</span>
//             </div>
//             <input className="pd-input" readOnly placeholder="Enter email" value={emailText} />

//             <input className="pd-input" readOnly placeholder="Enter phone number" value={phoneText} />
//             <div className="pd-input with-icon">
//               <input className="pd-input raw" readOnly placeholder="Date of birth" value={dob ? dob : ''} />
//               <span className="pd-icon" aria-hidden>📅</span>
//             </div>
//             <input className="pd-input" readOnly placeholder="PIN code" value={pincode} />

//             <input className="pd-input span-2" readOnly placeholder="Permanent address" value={address} />
//             <div className="pd-input with-add">
//               <input className="pd-input raw" readOnly placeholder="Known Language" value={languages} />
//               <button className="pd-add" type="button" disabled>+</button>
//             </div>
//           </div>

//           {/* upload area */}
//           <div className="resume-drop" onClick={handleResumeClick}>
//             <div className="resume-drop-inner">
//               <span className="resume-pill">
//                 <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
//                   <path d="M12 16V8M8 12h8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
//                 </svg>
//                 Resume upload
//               </span>
//               <div className="resume-note">Supported Formats: doc, docx, rtf, pdf</div>
//             </div>
//           </div>
//         </div>
//       </div>

// {/* ===================== Education details (NEW CARD) ===================== */}
// <div className="card-base soft-shadow">
//   <div className="card-title-row">
//     <h3 className="card-title">Education details <span className="req">*</span></h3>
//     <button type="button" className="edit-chip">Edit ✎</button>
//   </div>
//   <p className="card-subtitle">
//     Details like course, university, and more, help recruiters identify your educational background
//   </p>

//   {/* Graduation details */}
//   <div className="card-base" style={{ margin: 0 }}>
//     <div className="card-title-row" style={{ marginBottom: 12 }}>
//       <h4 className="card-title" style={{ fontSize: 14 }}>
//         Graduation details <span className="req">*</span>
//       </h4>
//       <button type="button" className="edit-chip" aria-label="Collapse section">−</button>
//     </div>

//     <div className="pd-grid">
//       <div className="pd-select-wrap">
//         <select className="pd-select" defaultValue="">
//           <option value="" disabled>Graduation/Diploma</option>
//           <option>B.E / B.Tech</option>
//           <option>B.Sc</option>
//           <option>BCA</option>
//           <option>Diploma</option>
//         </select>
//         <span className="pd-caret">▾</span>
//       </div>

//       <input className="pd-input" placeholder="University / Institute" />

//       <div className="pd-select-wrap">
//         <select className="pd-select" defaultValue="">
//           <option value="" disabled>Course</option>
//           <option>Computer Science</option>
//           <option>Information Technology</option>
//           <option>Electronics</option>
//         </select>
//         <span className="pd-caret">▾</span>
//       </div>

//       <input className="pd-input" placeholder="Specialization" />

//       <div className="pd-select-wrap">
//         <select className="pd-select" defaultValue="">
//           <option value="" disabled>Course type</option>
//           <option>Full time</option>
//           <option>Part time</option>
//           <option>Distance</option>
//         </select>
//         <span className="pd-caret">▾</span>
//       </div>

//       <div className="pd-select-wrap">
//         <select className="pd-select" defaultValue="">
//           <option value="" disabled>Grading system</option>
//           <option>Percentage</option>
//           <option>CGPA</option>
//         </select>
//         <span className="pd-caret">▾</span>
//       </div>

//       <div className="pd-input with-icon">
//         <input className="pd-input raw" placeholder="Course start year" />
//         <span className="pd-icon">📅</span>
//       </div>

//       <div className="pd-input with-icon">
//         <input className="pd-input raw" placeholder="Course ending year" />
//         <span className="pd-icon">📅</span>
//       </div>
//     </div>
//   </div>

//   {/* Class XII details */}
//   <div className="card-base" style={{ marginTop: 14 }}>
//     <div className="card-title-row" style={{ marginBottom: 12 }}>
//       <h4 className="card-title" style={{ fontSize: 14 }}>
//         Class XII details <span className="req">*</span>
//       </h4>
//       <button type="button" className="edit-chip" aria-label="Collapse section">−</button>
//     </div>

//     <div className="pd-grid">
//       <div className="pd-select-wrap">
//         <select className="pd-select" defaultValue="">
//           <option value="" disabled>Board of education</option>
//           <option>CBSE</option>
//           <option>ICSE</option>
//           <option>State Board</option>
//         </select>
//         <span className="pd-caret">▾</span>
//       </div>

//       <div className="pd-select-wrap">
//         <select className="pd-select" defaultValue="">
//           <option value="" disabled>Passing out year</option>
//           <option>2018</option>
//           <option>2019</option>
//           <option>2020</option>
//           <option>2021</option>
//           <option>2022</option>
//         </select>
//         <span className="pd-caret">▾</span>
//       </div>

//       <div className="pd-select-wrap">
//         <select className="pd-select" defaultValue="">
//           <option value="" disabled>Marks in %age</option>
//           <option>{'≥ 90%'}</option>
//           <option>80–89%</option>
//           <option>70–79%</option>
//           <option>{'< 70%'}</option>
//         </select>
//         <span className="pd-caret">▾</span>
//       </div>
//     </div>
//   </div>

//   {/* Class X details */}
//   <div className="card-base" style={{ marginTop: 14 }}>
//     <div className="card-title-row" style={{ marginBottom: 12 }}>
//       <h4 className="card-title" style={{ fontSize: 14 }}>
//         Class X details <span className="req">*</span>
//       </h4>
//       <button type="button" className="edit-chip" aria-label="Collapse section">−</button>
//     </div>

//     <div className="pd-grid">
//       <div className="pd-select-wrap">
//         <select className="pd-select" defaultValue="">
//           <option value="" disabled>Board of education</option>
//           <option>CBSE</option>
//           <option>ICSE</option>
//           <option>State Board</option>
//         </select>
//         <span className="pd-caret">▾</span>
//       </div>

//       <div className="pd-select-wrap">
//         <select className="pd-select" defaultValue="">
//           <option value="" disabled>Passing out year</option>
//           <option>2016</option>
//           <option>2017</option>
//           <option>2018</option>
//           <option>2019</option>
//           <option>2020</option>
//         </select>
//         <span className="pd-caret">▾</span>
//       </div>

//       <div className="pd-select-wrap">
//         <select className="pd-select" defaultValue="">
//           <option value="" disabled>Marks in %age</option>
//           <option>{'≥ 90%'}</option>
//           <option>80–89%</option>
//           <option>70–79%</option>
//           <option>{'< 70%'}</option>
//         </select>
//         <span className="pd-caret">▾</span>
//       </div>
//     </div>
//   </div>
// </div>
// {/* =================== /Education details (NEW CARD) =================== */}

// {/* ===================== Project details (2-column) ===================== */}
// <div className="card-base soft-shadow">
//   <div className="card-title-row">
//     <h3 className="card-title">Project details <span className="req">*</span></h3>
//     <button type="button" className="edit-chip">Edit ✎</button>
//   </div>
//   <p className="card-subtitle">
//     Stand out for employers by adding details about projects you have done in college, internships, or at work
//   </p>

//   {/* 2 columns exactly */}
//   <div
//     className="pd-grid"
//     style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}
//   >
//     <input className="pd-input" placeholder="Project title" />
//     <input className="pd-input" placeholder="Specialisation on the project" />

//     <div className="pd-input with-add">
//       <input className="pd-input raw" placeholder="Technologies used for project" />
//       <button className="pd-add" type="button" aria-label="add technology">+</button>
//     </div>

//     <input className="pd-input" placeholder="Project team size" />

//     <input className="pd-input" placeholder="Your role in the project" />

//     <div className="pd-input with-add">
//       <input className="pd-input raw" placeholder="Skills used" />
//       <button className="pd-add" type="button" aria-label="add skill">+</button>
//     </div>

//     {/* last row: two textareas, one per column */}
//     <textarea
//       className="pd-input"
//       placeholder="Role description"
//       style={{ height: 120, resize: 'none' }}
//     />
//     <textarea
//       className="pd-input"
//       placeholder="Project description"
//       style={{ height: 120, resize: 'none' }}
//     />
//   </div>
// </div>
// {/* =================== /Project details (2-column) =================== */}
// {/* ===================== Key skills (NEW CARD) ===================== */}
// <div className="card-base soft-shadow card-skills">
//   <div className="card-title-row">
//     <h3 className="card-title">Key skills <span className="req">*</span></h3>
//     <button type="button" className="edit-chip">Edit ✎</button>
//   </div>
//   <p className="card-subtitle">
//     Add skills that best define your expertise, for e.g., Direct Marketing, Oracle, Java, etc. (Minimum 1)
//   </p>

//   {/* input */}
//   <div style={{ marginBottom: 16 }}>
//     <input
//       className="pd-input"
//       type="text"
//       placeholder="Add skills"
//       style={{ width: '100%' }}
//     />
//   </div>

//   {/* keep chips INSIDE card padding */}
//   <div className="skills-pad">
//     <div className="skills-list">
//       {[
//         'Python','Java','Next JS','Machine Learning','Deep Learning','NLP','Gen AI',
//         'HTML5','React','CSS3','SQL',
//       ].map((skill) => (
//         <div key={skill} className="skill-chip">
//           {skill}
//           <span className="chip-x">×</span>
//         </div>
//       ))}
//     </div>
//   </div>
// </div>
// {/* =================== /Key skills (NEW CARD) =================== */}
// {/* ===================== Skill Badges (NEW CARD) ===================== */}
// <div className="card-base soft-shadow">
//   <div className="card-title-row">
//     <h3 className="card-title">Skill Badges</h3>
//   </div>
//   <SkillBadgesGrid />
// </div>
// {/* =================== /Skill Badges (NEW CARD) =================== */}


//       {snackbars.map((snackbar, index) => (
//         <Snackbar
//           key={index}
//           index={index}
//           message={snackbar.message}
//           type={snackbar.type}
//           onClose={handleCloseSnackbar}
//           link={snackbar.link}
//           linkText={snackbar.linkText}
//         />
//       ))}
//     </div>
//   );
// };

// export default ApplicantViewProfile;

// src/components/applicant/ApplicantViewProfile.jsx

// src/components/applicant/ApplicantViewProfile.jsx
// src/components/applicant/ApplicantViewProfile.jsx
import React from "react";
import { useUserContext } from "../common/UserProvider";
import ApplicantHeaderComponent from "./ApplicantHeaderComponent";
import ResumeSummaryCard from "./ResumeSummaryCard"; // ← add this
import PersonalDetailsCard from "./PersonalDetailsCard";
import EducationDetailsCard from "./EducationDetailsCard";
import ProjectDetailsCard from "./ProjectDetailsCard";
import KeySkillsCard from "./KeySkillsCard";
import SkillBadgesGrid from './SkillBadgesGrid';
import "./modalpopup.css";
import "./Portfolio.css";

const ApplicantViewProfile = () => {
  const { user } = useUserContext();
  const applicantId = user?.id;

  return (
    <div className="dashboard__content">
      {/* Title */}
      <div className="row mr-0 ml-10">
        <div className="col-lg-12 col-md-12">
          <section className="page-title-dashboard">
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12">
                  <div className="title-dashboard">
                    <div className="title-dash flex2">My Portfolio</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      {applicantId ? (
        <>
          <ApplicantHeaderComponent applicantId={applicantId} />
          <ResumeSummaryCard applicantId={applicantId} />
          <PersonalDetailsCard applicantId={applicantId} />
          <EducationDetailsCard applicantId={applicantId} />
          <ProjectDetailsCard applicantId={applicantId} />
          <KeySkillsCard applicantId={applicantId} />
           {/* ===================== Skill Badges (NEW CARD) ===================== */}
<div className="card-base soft-shadow">
 <div className="card-title-row">
     <h3 className="card-title">Skill Badges</h3>
   </div>
   <SkillBadgesGrid />
 </div>
 {/* =================== /Skill Badges (NEW CARD) =================== */}
        </>
      ) : (
        <div>Unable to identify applicant.</div>
      )}
    </div>
  );
};

export default ApplicantViewProfile;
