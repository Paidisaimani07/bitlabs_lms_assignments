import React from "react";
import "./CertificateVerify.css";

const CertificateVerify = () => {
  return (
    <div className="certificate-page">
      <div className="certificate">

        {/* Top Ribbon Badge */}
        <div className="badge-container">
          <div className="badge-ribbon"></div>

          <div className="badge">
            <div className="badge-inner">
              <h3>bitLabs</h3>
              <p>Certification</p>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="logo">
          <img src="/images/logo.png" alt="bitLabs" />
          <span>bitLabs</span>
        </div>

        {/* Title */}
        <div className="title-section">
          <h1>CERTIFICATE</h1>
          <h2>OF COMPLETION</h2>
        </div>

        {/* Content */}
        <div className="content">
          <p>This is to certify that</p>

          <h3 className="student-name">
            NAGUL MEERA SHAIK
          </h3>

          <p>
            has successfully completed the eLearning module on
          </p>

          <h4>
            Foundation Level - Full Stack Developer Online Course
          </h4>
        </div>

        {/* Footer */}
        <div className="footer">

          <div className="left-section">
            <div className="issue-date">
              <strong>Issued On</strong>
              <br />
              29 Aug 2026
            </div>

            <div className="signature">
              <img
                src="/images/signature.png"
                alt="Signature"
              />
              <p>Sreedhar Tatavarthi</p>
              <span>CEO, bitLabs</span>
            </div>
          </div>

          <div className="skills">
            <img src="/images/html.png" alt="HTML" />
            <img src="/images/css.png" alt="CSS" />
            <img src="/images/python.png" alt="Python" />
            <img src="/images/mysql.png" alt="MySQL" />
            <img src="/images/interview.png" alt="Interview" />
          </div>

          <div className="qr-section">
            <img src="/images/qr.png" alt="QR Code" />
            <p>Scan to verify</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CertificateVerify;         