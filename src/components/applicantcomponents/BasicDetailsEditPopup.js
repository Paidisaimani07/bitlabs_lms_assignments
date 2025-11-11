// src/components/applicant/BasicDetailsEditPopup.jsx
import React, { useState } from "react";
import axios from "axios";
import Snackbar from "../common/Snackbar";
import { apiUrl } from "../../services/ApplicantAPIService";
const CARD_API = `${apiUrl}/applicant-card`;

const BasicDetailsEditPopup = ({ initial, applicantId, onSuccess }) => {
  const [form, setForm] = useState({
    name: initial?.name || "",
    role: initial?.role || "",
    mobileNumber: initial?.mobileNumber || "",
    passYear: initial?.passYear || "",
    city: initial?.city || "",
    state: initial?.state || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [snackbars, setSnackbars] = useState([]);

  const addSnackbar = (snackbar) => setSnackbars((prev) => [...prev, snackbar]);
  const handleCloseSnackbar = (index) =>
    setSnackbars((prev) => prev.filter((_, i) => i !== index));

  const rules = {
    name: (v) => {
      const t = (v ?? "").trim();
      if (!t) return "Name is required.";
      if (!/^[a-zA-Z .'-]{3,80}$/.test(t))
        return "Name must be 3–80 letters/spaces.";
      return "";
    },
    role: (v) => {
      const t = (v ?? "").trim();
      if (!t) return "Role is required.";
      if (!/^.{2,80}$/.test(t)) return "Role must be 2–80 characters.";
      return "";
    },
    mobileNumber: (v) => {
      const t = (v ?? "").trim();
      if (!t) return "Mobile number is required.";
      if (!/^[6789]\d{9}$/.test(t))
        return "Mobile must be 10 digits starting with 6/7/8/9.";
      return "";
    },
    passYear: (v) => {
      const t = (v ?? "").toString().trim();
      if (!t) return "Pass-out year is required.";
      if (!/^\d{4}$/.test(t)) return "Enter a valid year (e.g., 2024).";
      const y = Number(t);
      if (y < 1900 || y > 2100) return "Year must be between 1900 and 2100.";
      return "";
    },
    city: (v) => {
      const t = (v ?? "").trim();
      if (!t) return "City is required.";
      if (!/^[a-zA-Z .'-]{2,80}$/.test(t)) return "Enter a valid city.";
      return "";
    },
    state: (v) => {
      const t = (v ?? "").trim();
      if (!t) return "State is required.";
      if (!/^[a-zA-Z .'-]{2,80}$/.test(t)) return "Enter a valid state.";
      return "";
    },
  };

  const validateField = (name, value) => rules[name]?.(value) || "";

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: validateField(name, value) }));
  };

  const validateAll = () => {
    const next = Object.keys(form).reduce((acc, key) => {
      const msg = validateField(key, form[key]);
      if (msg) acc[key] = msg;
      return acc;
    }, {});
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async () => {
    if (!validateAll()) return;

    setSaving(true);
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),                  // ← include role
        mobileNumber: form.mobileNumber.trim(),
        passYear: Number(form.passYear),
        city: form.city.trim(),
        state: form.state.trim(),
      };

      await axios.put(`${CARD_API}/${applicantId}`, payload, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      addSnackbar({ message: "Personal details updated successfully!", type: "success" });
      onSuccess?.();
    } catch (e) {
      console.error("Update failed:", e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Failed to update personal details";
      addSnackbar({ message: String(msg), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="basic-details-edit-popup" style={{ paddingTop: 24 }}>
      <div className="popup-heading">Personal Details</div>

      <div className="pd-grid">
        {/* Name */}
        <div className="input-wrapper">
          <input
            type="text"
            name="name"
            placeholder="* Full name"
            value={form.name}
            onChange={onChange}
            className="pd-input"
            required
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        {/* Role */}
        <div className="input-wrapper">
          <input
            type="text"
            name="role"
            placeholder="* Role (e.g., Full-Stack Developer)"
            value={form.role}
            onChange={onChange}
            className="pd-input"
            required
          />
          {errors.role && <div className="error-message">{errors.role}</div>}
        </div>

        {/* Email (read-only / disabled) */}
        <div className="input-wrapper">
          <input
            type="email"
            value={initial?.email || ""}
            className="pd-input disabled-input"
            disabled
            placeholder="Email (read-only)"
            title="Email is read-only"
          />
        </div>

        {/* Mobile */}
        <div className="input-wrapper">
          <input
            type="tel"
            name="mobileNumber"
            placeholder="* Mobile number"
            value={form.mobileNumber}
            onChange={onChange}
            className="pd-input"
            required
          />
          {errors.mobileNumber && (
            <div className="error-message">{errors.mobileNumber}</div>
          )}
        </div>

        {/* Pass-out year */}
        <div className="input-wrapper">
          <input
            type="text"
            name="passYear"
            placeholder="* Pass-out year (e.g., 2024)"
            value={form.passYear}
            onChange={onChange}
            className="pd-input"
            inputMode="numeric"
            required
          />
          {errors.passYear && <div className="error-message">{errors.passYear}</div>}
        </div>

        {/* City */}
        <div className="input-wrapper">
          <input
            type="text"
            name="city"
            placeholder="* City"
            value={form.city}
            onChange={onChange}
            className="pd-input"
            required
          />
          {errors.city && <div className="error-message">{errors.city}</div>}
        </div>

        {/* State */}
        <div className="input-wrapper">
          <input
            type="text"
            name="state"
            placeholder="* State"
            value={form.state}
            onChange={onChange}
            className="pd-input"
            required
          />
          {errors.state && <div className="error-message">{errors.state}</div>}
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <button
          type="button"
          onClick={onSave}
          className="btn-primary"
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={index}
          index={index}
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
          link={snackbar.link}
          linkText={snackbar.linkText}
        />
      ))}
    </div>
  );
};

export default BasicDetailsEditPopup;
