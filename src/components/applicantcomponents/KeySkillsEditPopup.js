// src/components/applicant/KeySkillsEditPopup.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { apiUrl } from "../../services/ApplicantAPIService";

const SKILLS_API = (id) => `${apiUrl}/applicantprofile/${id}/skills`;

const normalize = (s = "") => s.trim().replace(/\s+/g, " ");

const KeySkillsEditPopup = ({
  applicantId,
  isOpen,
  onClose,
  onSaved, // callback to refresh parent list
  initialSkills = [],
}) => {
  const [skills, setSkills] = useState([]);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // initialize on open
  useEffect(() => {
    if (isOpen) {
      setSkills([...new Set((initialSkills || []).map(normalize))]);
      setDraft("");
      setError("");
    }
  }, [isOpen, initialSkills]);

  const addDraft = () => {
    const v = normalize(draft);
    if (!v) return;
    if (v.length < 2) return setError("Skill must be at least 2 characters.");
    if (v.length > 80) return setError("Skill cannot exceed 80 characters.");
    if (skills.some((s) => s.toLowerCase() === v.toLowerCase()))
      return setError("Skill already added.");

    setSkills((prev) => [...prev, v]);
    setDraft("");
    setError("");
  };

  const removeSkill = (name) => {
    setSkills((prev) => prev.filter((s) => s.toLowerCase() !== name.toLowerCase()));
  };

  const canSave = useMemo(() => skills.length > 0, [skills]);

  const save = async () => {
    if (!canSave) {
      setError("Add at least one skill.");
      return;
    }
    setSaving(true);
    try {
      const jwt = localStorage.getItem("jwtToken");
      await axios.put(
        SKILLS_API(applicantId),
        { skills },
        { headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" } }
      );
      onSaved?.();
      onClose?.();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Failed to save skills.";
      setError(String(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit Key Skills"
      className="modal-content2"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div style={{ position: "absolute", top: 10, right: 20 }}>
        <FontAwesomeIcon
          icon={faTimes}
          onClick={onClose}
          style={{ cursor: "pointer", color: "#333" }}
        />
      </div>

      <div style={{ paddingTop: 24 }}>
        <h3 style={{ marginBottom: 12, fontWeight: 800 }}>Edit Key Skills</h3>
        <p className="card-subtitle" style={{ marginBottom: 12 }}>
          Add skills that best define your expertise, e.g., Java, React, SQL. (Minimum 1)
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            className="pd-input"
            type="text"
            placeholder="Add a skill"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDraft();
              }
            }}
            style={{ flex: 1 }}
          />
          <button type="button" className="btn-primary" onClick={addDraft} style={{ whiteSpace: "nowrap" }}>
            Add
          </button>
        </div>

        {error ? (
          <div className="error-message" style={{ marginBottom: 8 }}>{error}</div>
        ) : null}

        {/* Chips */}
        <div className="skills-pad">
          <div className="skills-list">
            {skills.map((s) => (
              <div key={s} className="skill-chip">
                {s}
                <span className="chip-x" onClick={() => removeSkill(s)} title="Remove">
                  ×
                </span>
              </div>
            ))}
            {!skills.length && (
              <div style={{ color: "#777" }}>No skills yet — add your first one above.</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button className="btn-primary" disabled={!canSave || saving} onClick={save} aria-busy={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default KeySkillsEditPopup;
