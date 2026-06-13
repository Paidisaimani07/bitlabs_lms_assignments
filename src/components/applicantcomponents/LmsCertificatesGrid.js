import React from 'react';
import { QRCode } from 'antd';
import certificateBg from '../../images/certificate-template.png';
import eyeIcon from '../../images/eye-certificate.png';
import downloadIcon from '../../images/download-certificate.png';
import htmlCssIcon from '../../images/html-css-certificate.png';
import pythonIcon from '../../images/python-certificate.png';
import javaIcon from '../../images/java-certificate.png';
import sqlIcon from '../../images/sql-certificate.png';
import javascriptIcon from '../../images/javascript-certificate.png';
import reactIcon from '../../images/react-certificate.png';
import springbootIcon from '../../images/springboot-certificate.png';
import './bitLabs-LMS/LmsCertificate.css';

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

/**
 * LMS CERTIFICATES GRID (FIXED)
 * - View → parent modal
 * - Download → real certificateUrl only
 */
const LmsCertificatesGrid = ({
    certificates = [],
    onViewCertificate,
    onDownloadCertificate,
    applicantName,
}) => {

    if (!certificates.length) {
        return <p>No certificates available</p>;
    }

    /* ---------------- VIEW ---------------- */
    const handleView = (cert) => {
        if (onViewCertificate) {
            onViewCertificate(cert);
        } else {
            console.warn("onViewCertificate not provided");
        }
    };

    /* ---------------- DOWNLOAD ---------------- */
    const handleDownload = async (cert) => {
        if (onDownloadCertificate) {
            onDownloadCertificate(cert);
        } else {
            try {
                if (!cert?.certificateUrl) {
                    alert("Certificate not available yet");
                    return;
                }

                const response = await fetch(cert.certificateUrl);
                const blob = await response.blob();

                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = `${cert.courseName || "certificate"}.png`;
                link.click();

            } catch (err) {
                console.error("Download failed:", err);
            }
        }
    };

    return (
        <div className="cert-grid">

            {certificates.map((cert, index) => (
                <div key={index} className="cert-card">

                    {/* PREVIEW (REAL SCALED ORIGINAL CERTIFICATE) */}
                    <div className="cert-preview">
                        <div className="cert-card-preview-scaler">
                            <div 
                                className="certificate-template-wrapper"
                                style={{ fontFamily: 'Georgia, serif' }}
                            >
                                <img 
                                    src={certificateBg} 
                                    className="certificate-background" 
                                    alt="Certificate Background" 
                                />

                                <div className="certificate-name">
                                    {applicantName || cert.applicantName || "Student Name"}
                                </div>

                                <div className="certificate-course">
                                    {cert.courseName}
                                </div>

                                <div className="certificate-date">
                                    {getIssuedDate(cert)}
                                </div>

                                {getCourseIcon(cert.courseName) && (
                                    <div className="certificate-skill-icon">
                                        <img 
                                            src={getCourseIcon(cert.courseName)} 
                                            alt="Skill Icon" 
                                        />
                                    </div>
                                )}

                                <div className="certificate-qr">
                                    <QRCode
                                        value={`name:${cert.applicantName || 'Student'}\ncourse:${cert.courseName || 'Course'}\nVERIFIED`}
                                        size={120}
                                        bordered={false}
                                        type="svg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="cert-hover-overlay">
                            <button 
                                className="cert-icon-btn view-btn" 
                                onClick={() => handleView(cert)}
                                title="View"
                            >
                                <img src={eyeIcon} alt="View" />
                            </button>
                            <button 
                                className="cert-icon-btn download-btn" 
                                onClick={() => handleDownload(cert)}
                                title="Download"
                            >
                                <img src={downloadIcon} alt="Download" />
                            </button>
                        </div>

                    </div>

                    {/* TITLE */}
                    <div className="cert-title">
                        {cert.courseName || "Course"}
                    </div>

                </div>
            ))}

        </div>
    );
};

export default LmsCertificatesGrid;