import certificateBg from '../../images/certificate-template.png';
import eyeIcon from '../../images/eye-certificate.png';
import downloadIcon from '../../images/download-certificate.png';

/**
 * LMS CERTIFICATES GRID (FIXED)
 * - View → parent modal
 * - Download → real certificateUrl only
 */
const LmsCertificatesGrid = ({
    certificates = [],
    onViewCertificate,
    onDownloadCertificate,
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

                    {/* PREVIEW (STATIC TEMPLATE ONLY) */}
                    <div className="cert-preview">

                        <img
                            src={certificateBg}
                            alt="certificate"
                            className="cert-bg"
                        />

                        <div className="cert-name">
                            {cert.applicantName || "Your Name"}
                        </div>

                        <div className="cert-course">
                            {cert.courseName}
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