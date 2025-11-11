// src/components/applicant/ApplicantHeaderComponent.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPen } from "@fortawesome/free-solid-svg-icons";
import BasicDetailsEditPopup from "./BasicDetailsEditPopup";
import { apiUrl } from "../../services/ApplicantAPIService";

const CARD_API = `${apiUrl}/applicant-card`;
const PHOTO_GET_API = `${apiUrl}/applicant-image/getphoto`;
const PHOTO_UPLOAD_API = `${apiUrl}/applicant-image/uploadphoto`; // ← change if your endpoint is different

const DEFAULT_CARD = {
  applicantId: null,
  name: "",
  role: "Full–Stack Developer",
  mobileNumber: "",
  email: "",
  passYear: null,
  city: "",
  state: "",
  locationDisplay: "",
  lastUpdated: null,
  score: 0,
};

const ApplicantHeaderComponent = ({ applicantId }) => {
  const [card, setCard] = useState(DEFAULT_CARD);
  const [editOpen, setEditOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("../images/user/avatar/profile-pic.png");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

 const fetchCard = async () => {
  try {
    if (!applicantId) return;
    const jwtToken = localStorage.getItem("jwtToken");

    // 1) existing card endpoint
    const { data: cardData } = await axios.get(`${CARD_API}/${applicantId}`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    // 2) fetch score from profile-view
    let scoreFromProfile = 0;
    try {
      const { data: pv } = await axios.get(
        `${apiUrl}/applicantprofile/${applicantId}/profile-view`,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      scoreFromProfile =
        pv?.applicant?.overallScore ??
        pv?.score ??
        0;
    } catch (e) {
      // profile-view might be absent or not include score; keep default 0
      console.warn("Score fetch failed; using default 0.", e?.response || e);
    }

    // Merge with defaults + score
    setCard({ ...DEFAULT_CARD, ...(cardData || {}), score: scoreFromProfile });
  } catch (e) {
    console.error("Failed to load applicant card:", e?.response || e);
    setCard({ ...DEFAULT_CARD });
  }
};


  const fetchPhoto = async () => {
    try {
      if (!applicantId) return;
      const jwtToken = localStorage.getItem("jwtToken");
      const res = await axios.get(`${PHOTO_GET_API}/${applicantId}`, {
        responseType: "arraybuffer",
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      // build base64 data URL
      const base64 = btoa(
        new Uint8Array(res.data).reduce((s, b) => s + String.fromCharCode(b), "")
      );
      const mime = res.headers["content-type"] || "image/jpeg";
      setImageSrc(`data:${mime};base64,${base64}`);
    } catch (e) {
      // If no image yet, keep default placeholder
      console.info("No custom applicant photo yet or failed to fetch. Using placeholder.");
      setImageSrc("../images/user/avatar/profile-pic.png");
    }
  };

  useEffect(() => {
    fetchCard();
    fetchPhoto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicantId]);

  const fullName = useMemo(() => (card?.name?.trim() ? card.name : "—"), [card]);
  const roleTitle = useMemo(() => (card?.role?.trim() ? card.role : DEFAULT_CARD.role), [card]);
  const phoneText = useMemo(() => (card?.mobileNumber?.trim() ? card.mobileNumber : "—"), [card]);
  const emailText = useMemo(() => (card?.email?.trim() ? card.email : "—"), [card]);
  const passOutText = useMemo(
    () => (card?.passYear ? `${card.passYear} passed out` : "Passed out year not set"),
    [card]
  );
  const locationText = useMemo(
    () =>
      card?.locationDisplay?.trim()
        ? card.locationDisplay
        : [card?.city, card?.state].filter(Boolean).join(", ") || "—",
    [card]
  );

  const openFilePicker = () => fileInputRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client validation
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Please choose a PNG or JPG image.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Please choose an image ≤ 5 MB.");
      e.target.value = "";
      return;
    }

    // Preview instantly
    const previewUrl = URL.createObjectURL(file);
    setImageSrc(previewUrl);

    // Upload
    try {
      setUploading(true);
      const jwtToken = localStorage.getItem("jwtToken");
      const form = new FormData();
      form.append("file", file);

      await axios.post(`${PHOTO_UPLOAD_API}/${applicantId}`, form, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Re-fetch final image (to ensure we now show the one served by backend / CDN)
      await fetchPhoto();
    } catch (err) {
      console.error("Photo upload failed:", err);
      alert("Failed to upload photo. Please try again.");
      // rollback preview to previous
      await fetchPhoto();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

// Format and show "last updated"
const updatedOnText = useMemo(() => {
  if (!card?.lastUpdated) return "Not updated yet";
  const date = new Date(card.lastUpdated * 1000); // if backend gives epoch seconds
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}, [card?.lastUpdated]);

  return (
    <>
      <div className="portfolio-card">
        {/* left cluster */}
        <div className="portfolio-left">
          <div className="portfolio-avatar-wrap">
            <img
              className="portfolio-avatar"
              src={imageSrc}
              alt={`${fullName} profile`}
              onError={(e) => (e.currentTarget.src = "../images/user/avatar/profile-pic.png")}
            />
            {/* Pen / edit button overlay */}
            <button
              type="button"
              className="portfolio-camera-btn"
              onClick={openFilePicker}
              title={uploading ? "Uploading..." : "Edit photo"}
              disabled={uploading}
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg"
              style={{ display: "none" }}
              onChange={onFileChange}
            />
          </div>

          <div className="portfolio-meta">
            <div className="portfolio-name-row">
              <h3 className="portfolio-name">{fullName}</h3>
             <button
  type="button"
  className="portfolio-edit-btn"
  onClick={() => setEditOpen(true)}>
  Edit <FontAwesomeIcon icon={faPen} style={{ marginRight: "6px" }} />
</button>
            </div>
            <p className="portfolio-role">{roleTitle}</p>
            <p className="portfolio-updated">Portfolio last updated – {updatedOnText}</p>
          </div>
        </div>

        {/* divider */}
        <div className="portfolio-divider" aria-hidden="true" />

        {/* middle */}
        <div className="portfolio-middle">
          <div className="portfolio-row">
            <svg className="portfolio-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 5a2 2 0 012-2h2l2 5-2 1a13 13 0 006 6l1-2 5 2v2a2 2 0 01-2 2h-1C9.716 19 5 14.284 5 8V7a2 2 0 012-2H7"
                stroke="#9E9E9E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{phoneText}</span>
          </div>

          <div className="portfolio-row">
            <svg className="portfolio-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="#9E9E9E" strokeWidth="1.5" />
              <path d="M22 8l-10 6L2 8" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{emailText}</span>
          </div>

          <div className="portfolio-row">
            <svg className="portfolio-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                stroke="#9E9E9E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{passOutText}</span>
          </div>

          <div className="portfolio-row">
            <svg className="portfolio-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 22s7-5.686 7-12a7 7 0 0 0-14 0c0 6.314 7 12 7 12Z"
                stroke="#9E9E9E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="10" r="3" stroke="#9E9E9E" strokeWidth="1.5" />
            </svg>
            <span>{locationText}</span>
          </div>
        </div>

        {/* right score */}
        <div className="portfolio-right">
          <p className="portfolio-score-label">Score</p>
          <div className="portfolio-score">{card?.score ?? 0}</div>

        </div>
      </div>

      {/* Edit modal */}
      <Modal
        isOpen={editOpen}
        onRequestClose={() => setEditOpen(false)}
        contentLabel="Edit Details"
        className="modal-content2"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <div style={{ position: "absolute", top: 10, right: 20 }}>
          <FontAwesomeIcon
            icon={faTimes}
            onClick={() => setEditOpen(false)}
            style={{ cursor: "pointer", color: "#333" }}
          />
        </div>

        <BasicDetailsEditPopup
          initial={{
            name: card?.name || "",
            role: card?.role || "",
            mobileNumber: card?.mobileNumber || "",
            passYear: card?.passYear || "",
            city: card?.city || "",
            state: card?.state || "",
            email: card?.email || "",
          }}
          applicantId={applicantId}
          onSuccess={async () => {
            await fetchCard();
            setEditOpen(false);
          }}
        />
      </Modal>
    </>
  );
};

export default ApplicantHeaderComponent;
