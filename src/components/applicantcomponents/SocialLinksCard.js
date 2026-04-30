// src/components/applicant/SocialLinksCard.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTimes } from "@fortawesome/free-solid-svg-icons";
import Snackbar from "../common/Snackbar";
import SocialLinksEditPopup from "./SocialLinksEditPopup";

const SOCIAL_API = "api/social-links";

const SocialLinksCard = ({ applicantId, onLoaded, showContent }) => {
  const [data, setData] = useState({});
  const [open, setOpen] = useState(false);
  const [snackbars, setSnackbars] = useState([]);
  const [loading, setLoading] = useState(false);

  const addSnackbar = (s) => setSnackbars((p) => [...p, s]);
  const closeSnackbar = (i) => setSnackbars((p) => p.filter((_, idx) => idx !== i));

  const fetchSocialLinks = async () => {
    try {
      const res = await apiClient.get(`${SOCIAL_API}/${applicantId}`);
      setData(res.data || {});
      return res.data || {};
    } catch (e) {
      console.error("Failed to fetch social links", e);
      setData({});
      return {};
    }
  };

  useEffect(() => {
    const loadSocialLinks = async () => {
      if (!applicantId) return;
      setLoading(true);
      await fetchSocialLinks();
      setLoading(false);
      onLoaded?.();
    };

    loadSocialLinks();
  }, [applicantId]);

  if (!showContent) {
    return (
      <div className="col-lg-12 col-md-12 common_style">
        <div className="card-base soft-shadow">
          <div className="card-title-row">
            <div className="skeleton" style={{ width: 120, height: 24 }} />
            <div className="skeleton" style={{ width: 60, height: 20 }} />
          </div>

          <div className="pd-grid" style={{ marginTop: 20 }}>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 40, borderRadius: 8 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card-base soft-shadow">
        
        <div className="card-title-row">
          <h4 className="card-title">Social Links <span className="req">*</span></h4>

          <button
            className="portfolio-edit-btn"
            onClick={() => setOpen(true)}
          >
            Edit <FontAwesomeIcon icon={faPen} />
          </button>
        </div>

        <div className="pd-grid">
          <input readOnly className="pd-input" value={data.github || ""} placeholder="GitHub" />
          <input readOnly className="pd-input" value={data.linkedIn || ""} placeholder="LinkedIn" />
          <input readOnly className="pd-input" value={data.leetcode || ""} placeholder="LeetCode" />
          <input readOnly className="pd-input" value={data.hackerrank || ""} placeholder="HackerRank" />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={open}
        onRequestClose={() => setOpen(false)}
        className="modal-content2"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <div style={{ position: "absolute", top: 10, right: 20 }}>
          <FontAwesomeIcon 
            icon={faTimes} 
            onClick={() => setOpen(false)}
            style={{ 
              cursor: 'pointer',
              fontSize: '18px',
              color: '#666',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#000'}
            onMouseLeave={(e) => e.target.style.color = '#666'}
          />
        </div>

        <SocialLinksEditPopup
          applicantId={applicantId}
          initial={data}
          onSuccess={async () => {
            await fetchSocialLinks();
            setOpen(false);
            addSnackbar({ message: "Updated successfully", type: "success" });
          }}
          onError={(msg) =>
            addSnackbar({ message: msg || "Update failed", type: "error" })
          }
        />
      </Modal>

      {snackbars.map((s, i) => (
        <Snackbar key={i} {...s} index={i} onClose={closeSnackbar} />
      ))}
    </>
  );
};

export default SocialLinksCard;