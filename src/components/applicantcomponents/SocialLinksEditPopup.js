// src/components/applicant/SocialLinksEditPopup.jsx
import React, { useState } from "react";
import apiClient from "../../services/apiClient";

const validators = {
github: (v) => {
  if (!v) return "GitHub is required";

  if (!/^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+(\/[A-Za-z0-9_.-]+)?\/?$/.test(v)) {
    return "Invalid GitHub URL";
  }

  return "";
},
  linkedIn: (v) => {
    if (!v) return "";
    if (!/^https:\/\/(www\.)?linkedin\.com\/.*$/.test(v))
      return "Invalid LinkedIn URL";
    return "";
  },
  leetcode: (v) => {
    if (!v) return "";
    if (!/^https:\/\/(www\.)?leetcode\.com\/.*$/.test(v))
      return "Invalid LeetCode URL";
    return "";
  },
  hackerrank: (v) => {
    if (!v) return "";
    if (!/^https:\/\/(www\.)?hackerrank\.com\/.*$/.test(v))
      return "Invalid HackerRank URL";
    return "";
  },
};

const SocialLinksEditPopup = ({ applicantId, initial, onSuccess, onError }) => {
  const [form, setForm] = useState({
    applicantId: applicantId,
    github: initial?.github || "",
    linkedIn: initial?.linkedIn || "",
    leetcode: initial?.leetcode || "",
    hackerrank: initial?.hackerrank || "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));

    setErrors((e) => ({
      ...e,
      [name]: validators[name](value),
    }));
  };

  const validateAll = () => {
    const newErrors = {
      github: validators.github(form.github),
      linkedIn: validators.linkedIn(form.linkedIn),
      leetcode: validators.leetcode(form.leetcode),
      hackerrank: validators.hackerrank(form.hackerrank),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => !e);
  };

const save = async () => {
  if (!validateAll()) return;

  setSaving(true);
  try {
    // Logic: If initial.github exists, we know a record is already in the DB.
    // Therefore, we should UPDATE (PUT) instead of CREATE (POST).
    const isExisting = !!initial?.github; 

    if (isExisting) {
      // ✅ Call the PUT endpoint you defined in your Controller
      await apiClient.put(`api/social-links/${applicantId}`, form);
    } else {
      // ✅ Call POST only if there is no existing record
      await apiClient.post(`api/social-links/`, form);
    }
    
    onSuccess?.();
  } catch (e) {
    onError?.(e?.response?.data?.message || "Update failed");
  } finally {
    setSaving(false);
  }
};

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>Edit Social Links</h3>

      <div className="pd-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            className="pd-input"
            placeholder="GitHub *"
            value={form.github}
            onChange={(e) => setField("github", e.target.value)}
          />
          {errors.github && (
            <div 
              className="error-message" 
              style={{ 
                margin: 0,
                fontSize: '12px',
                alignSelf: 'flex-start'
              }}
            >
              {errors.github}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            className="pd-input"
            placeholder="LinkedIn"
            value={form.linkedIn}
            onChange={(e) => setField("linkedIn", e.target.value)}
          />
          {errors.linkedIn && (
            <div 
              className="error-message" 
              style={{ 
                margin: 0,
                fontSize: '12px',
                alignSelf: 'flex-start'
              }}
            >
              {errors.linkedIn}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            className="pd-input"
            placeholder="LeetCode"
            value={form.leetcode}
            onChange={(e) => setField("leetcode", e.target.value)}
          />
          {errors.leetcode && (
            <div 
              className="error-message" 
              style={{ 
                margin: 0,
                fontSize: '12px',
                alignSelf: 'flex-start'
              }}
            >
              {errors.leetcode}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            className="pd-input"
            placeholder="HackerRank"
            value={form.hackerrank}
            onChange={(e) => setField("hackerrank", e.target.value)}
          />
          {errors.hackerrank && (
            <div 
              className="error-message" 
              style={{ 
                margin: 0,
                fontSize: '12px',
                alignSelf: 'flex-start'
              }}
            >
              {errors.hackerrank}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default SocialLinksEditPopup;