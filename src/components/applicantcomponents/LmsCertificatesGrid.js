import certificateBg from '../../images/certificate-template.png';

/**
 * LMS CERTIFICATES GRID (FIXED)
 * - View → parent modal
 * - Download → real certificateUrl only
 */
const LmsCertificatesGrid = ({
    certificates = [],
    onViewCertificate,
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

                    </div>

                    {/* TITLE */}
                    <div className="cert-title">
                        {cert.courseName || "Course"}
                    </div>

                    {/* ACTIONS */}
                    <div className="cert-actions">

                        <button onClick={() => handleView(cert)}>
                            👁 View
                        </button>

                        <button onClick={() => handleDownload(cert)}>
                            ⬇ Download
                        </button>

                    </div>

                </div>
            ))}

        </div>
    );
};

export default LmsCertificatesGrid;