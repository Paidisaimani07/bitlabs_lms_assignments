import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Snackbar from "../common/Snackbar";
import { apiUrl } from "../../services/ApplicantAPIService";
import EducationDetailsEditPopup from "./EducationDetailsEditPopup";
import { faPen } from "@fortawesome/free-solid-svg-icons";

const EDU_API = `${apiUrl}/applicant-education`;

const hintStyle = { color: "#9ca3af", fontStyle: "italic" };

const Section = ({ title, children, open, onToggle }) => (
  <div className="card-base" style={{ margin: 0 }}>
    <div className="card-title-row" style={{ marginBottom: 12 }}>
      <h4 className="card-title" style={{ fontSize: 14 }}>
        {title} <span className="req">*</span>
      </h4>
      <button
        type="button"
        className="edit-chip"
        onClick={onToggle}
        aria-label={open ? "Collapse section" : "Expand section"}
      >
        {open ? "−" : "+"}
      </button>
    </div>
    {open && children}
  </div>
);

const EducationDetailsCard = ({ applicantId }) => {
  const [data, setData] = useState(null);
  const [openGrad, setOpenGrad] = useState(true);
  const [openXII, setOpenXII] = useState(true);
  const [openX, setOpenX] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [snackbars, setSnackbars] = useState([]);

  const addSnackbar = (snackbar) => setSnackbars((p) => [...p, snackbar]);
  const handleCloseSnackbar = (i) =>
    setSnackbars((p) => p.filter((_, idx) => idx !== i));

  const fetchEducation = async () => {
    try {
      const jwt = localStorage.getItem("jwtToken");
      const { data } = await axios.get(`${EDU_API}/${applicantId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setData(data || {});
    } catch (e) {
      console.error("Education GET failed:", e?.response || e);
      setData({
        graduation: {},
        classXii: {},
        classX: {},
      });
    }
  };

  useEffect(() => {
    if (applicantId) fetchEducation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicantId]);

  const g = useMemo(() => data?.graduation || {}, [data]);
  const xii = useMemo(() => data?.classXii || {}, [data]);
  const x = useMemo(() => data?.classX || {}, [data]);

  return (
    <>
      <div className="col-lg-12 col-md-12">
        <div className="card-base soft-shadow">
          <div className="card-title-row">
            <div>
              <h3 className="card-title">Education details <span className="req">*</span></h3>
              <p className="card-subtitle">
                Details like course, university, and more, help recruiters identify your educational background
              </p>
            </div>
            <button
             type="button"
             className="portfolio-edit-btn"
             onClick={() => setEditOpen(true)}>
             Edit <FontAwesomeIcon icon={faPen} style={{ marginRight: "6px" }} />
           </button>
          </div>

          {/* Graduation */}
          <Section
            title="Graduation details"
            open={openGrad}
            onToggle={() => setOpenGrad((v) => !v)}
          >
            <div className="pd-grid">
              {/* row 1 */}
              <div className="pd-select-wrap">
                <select className="pd-select" disabled value={g.degree || ""} onChange={() => {}}>
                  <option value="">{g.degree || "Graduation/Diploma"}</option>
                </select>
                <span className="pd-caret">▾</span>
              </div>
              <input
                className="pd-input"
                readOnly
                placeholder="University / Institute"
                value={g.university || ""}
                style={!g.university ? hintStyle : {}}
              />
              <div className="pd-select-wrap">
                <select className="pd-select" disabled value={g.course || ""} onChange={() => {}}>
                  <option value="">{g.course || "Course"}</option>
                </select>
                <span className="pd-caret">▾</span>
              </div>

              {/* row 2 */}
              <input
                className="pd-input"
                readOnly
                placeholder="Specialization"
                value={g.specialization || ""}
                style={!g.specialization ? hintStyle : {}}
              />
              <div className="pd-select-wrap">
                <select className="pd-select" disabled value={g.courseType || ""} onChange={() => {}}>
                  <option value="">{g.courseType || "Course type"}</option>
                </select>
                <span className="pd-caret">▾</span>
              </div>
              <div className="pd-select-wrap">
                <select className="pd-select" disabled value={g.gradingSystem || ""} onChange={() => {}}>
                  <option value="">{g.gradingSystem || "Grading system"}</option>
                </select>
                <span className="pd-caret">▾</span>
              </div>

              {/* row 3 */}
             <div className="pd-with-icon">
  <input
    className="pd-input raw"
    readOnly
    placeholder="Course start year"
    value={g.startYear || ""}
    style={!g.startYear ? hintStyle : {}}
  />
  <span className="pd-icon" aria-hidden>📅</span>
</div>

<div className="pd-with-icon">
  <input
    className="pd-input raw"
    readOnly
    placeholder="Course ending year"
    value={g.endYear || ""}
    style={!g.endYear ? hintStyle : {}}
  />
  <span className="pd-icon" aria-hidden>📅</span>
</div>



            </div>
          </Section>

          {/* Class XII */}
          <Section
            title="Class XII details"
            open={openXII}
            onToggle={() => setOpenXII((v) => !v)}
          >
            <div className="pd-grid">
              <div className="pd-select-wrap">
                <select className="pd-select" disabled value={xii.board || ""} onChange={() => {}}>
                  <option value="">{xii.board || "Board of education"}</option>
                </select>
                <span className="pd-caret">▾</span>
              </div>

              <div className="pd-select-wrap">
                <select className="pd-select" disabled value={xii.passingYear || ""} onChange={() => {}}>
                  <option value="">{xii.passingYear || "Passing out year"}</option>
                </select>
                <span className="pd-caret">▾</span>
              </div>

              <div className="pd-select-wrap">
                <select className="pd-select" disabled value={xii.marksPercent || ""} onChange={() => {}}>
                  <option value="">{(xii.marksPercent ?? "") || "Marks in %age"}</option>

                </select>
                <span className="pd-caret">▾</span>
              </div>
            </div>
          </Section>

          {/* Class X */}
          <Section
            title="Class X details"
            open={openX}
            onToggle={() => setOpenX((v) => !v)}
          >
            <div className="pd-grid">
              <div className="pd-select-wrap">
                <select className="pd-select" disabled value={x.board || ""} onChange={() => {}}>
                  <option value="">{x.board || "Board of education"}</option>
                </select>
                <span className="pd-caret">▾</span>
              </div>

              <div className="pd-select-wrap">
                <select className="pd-select" disabled value={x.passingYear || ""} onChange={() => {}}>
                  <option value="">{x.passingYear || "Passing out year"}</option>
                </select>
                <span className="pd-caret">▾</span>
              </div>

              <div className="pd-select-wrap">
                <select className="pd-select" disabled value={x.marksPercent || ""} onChange={() => {}}>
                  <option value="">{(x.marksPercent ?? "") || "Marks in %age"}</option>
                </select>
                <span className="pd-caret">▾</span>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        isOpen={editOpen}
        onRequestClose={() => setEditOpen(false)}
        contentLabel="Edit Education Details"
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

        <EducationDetailsEditPopup
          applicantId={applicantId}
          initial={data || { graduation: {}, classXii: {}, classX: {} }}
          onSuccess={async () => {
            await fetchEducation();
            setEditOpen(false);
            addSnackbar({ message: "Education details saved successfully!", type: "success" });
          }}
          onError={(msg) =>
            addSnackbar({ message: msg || "Failed to save education details", type: "error" })
          }
        />
      </Modal>

      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={index}
          index={index}
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
        />
      ))}
    </>
  );
};

export default EducationDetailsCard;
