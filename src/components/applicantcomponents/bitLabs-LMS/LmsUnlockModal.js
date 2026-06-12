import React from 'react';
import '../../common/Snackbar.css';

const LmsUnlockModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`modal1 ${isOpen ? 'show' : ''}`}
      style={{
        display: isOpen ? 'block' : 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
      }}
    >
      <div className="modal1-dialog" role="document" style={{ marginTop: '15%' }}>
        <div className="modal1-content" style={{ borderRadius: '12px', padding: '16px' }}>
          <div className="modal1-header" style={{ borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="modal1-title" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1A1A17', margin: 0 }}>LMS Certificate</h5>
            <button
              type="button"
              className="close"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#5f6368',
                lineHeight: 1,
                padding: 0
              }}
            >
              &times;
            </button>
          </div>
          <div className="modal1-body" style={{ fontSize: '1rem', color: '#5F6368', padding: '16px 0', textAlign: 'left' }}>
            Complete at least one course to unlock your certificate.
          </div>
          <div className="modal1-footer" style={{ borderTop: 'none', justifyContent: 'flex-end', display: 'flex', gap: '8px', padding: 0 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent linear-gradient(286deg, #FBBB5C 0%, #E66A0E 100%) 0% 0% no-repeat padding-box',
                color: '#FFFFFF',
                padding: '10px 28px',
                borderRadius: '50px',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(249, 115, 22, 0.2)',
                transition: 'all 0.3s ease',
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LmsUnlockModal;
