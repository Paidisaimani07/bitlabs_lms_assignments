import React, { useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";

const PERSONAL_API = `${apiUrl}/applicant-personal`;

const toISO = (v) => {
  // normalize to YYYY-MM-DD for the date input & backend
  if (!v) return "";
  // already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  // try DD-MM-YYYY
  const m = /^(\d{2})[-/](\d{2})[-/](\d{4})$/.exec(v);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return v; // fallback
};

const validators = {
  fullName: (v) => {
    const t = (v || "").trim();
    if (!t) return "Full Name is required.";
    if (!/^[a-zA-Z .'-]{3,80}$/.test(t)) return "Use 3–80 letters/spaces.";
    return "";
  },
  gender: (v) => (!v ? "Gender is required." : ""),
  email: (v) => {
    const t = (v || "").trim();
    if (!t) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "Enter a valid email.";
    return "";
  },
  phone: (v) => {
    const t = (v || "").trim();
    if (!t) return "Phone number is required.";
    if (!/^[6789]\d{9}$/.test(t)) return "Phone must be 10 digits starting with 6/7/8/9.";
    return "";
  },
  dateOfBirth: (v) => (!v ? "Date of birth is required." : ""),
  pincode: (v) => {
    const t = (v || "").trim();
    if (!t) return "PIN code is required.";
    if (!/^\d{6}$/.test(t)) return "PIN must be 6 digits.";
    return "";
  },
  address: (v) => {
    const t = (v || "").trim();
    if (!t) return "Permanent address is required.";
    if (t.length < 10) return "Address looks too short.";
    return "";
  },
  knownLanguages: (arr) =>
    !arr || arr.length === 0 ? "At least one language is required." : "",
};

const splitFullName = (name) => {
  const t = (name || "").trim().replace(/\s+/g, " ");
  if (!t) return { firstName: "", lastName: "" };
  const parts = t.split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.slice(-1)[0] };
};

const PersonalDetailsEditPopup = ({ applicantId, initial, onSuccess, onError }) => {
  const [form, setForm] = useState({
    fullName: initial?.fullName || "",
    gender: initial?.gender || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    dateOfBirth: toISO(initial?.dateOfBirth || ""),
    pincode: initial?.pincode || "",
    address: initial?.address || "",
    knownLanguages: Array.isArray(initial?.knownLanguages) ? initial.knownLanguages : [],
  });
  const [langInput, setLangInput] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    const v = name === "knownLanguages" ? value : value;
    setErrors((e) => ({
      ...e,
      [name]: validators[name] ? validators[name](v) : "",
    }));
  };

  const tryAddLanguage = () => {
    const t = langInput.trim();
    if (!t) return;
    if (!form.knownLanguages.includes(t)) {
      const next = [...form.knownLanguages, t];
      setField("knownLanguages", next);
    }
    setLangInput("");
  };
  const removeLanguage = (lang) =>
    setField(
      "knownLanguages",
      form.knownLanguages.filter((l) => l !== lang)
    );

  const validateAll = () => {
    const next = {
      fullName: validators.fullName(form.fullName),
      gender: validators.gender(form.gender),
      email: validators.email(form.email),
      phone: validators.phone(form.phone),
      dateOfBirth: validators.dateOfBirth(form.dateOfBirth),
      pincode: validators.pincode(form.pincode),
      address: validators.address(form.address),
      knownLanguages: validators.knownLanguages(form.knownLanguages),
    };
    setErrors(next);
    return Object.values(next).every((m) => !m);
  };

  const canSave = useMemo(
    () => Object.values(errors).every((m) => !m) && !saving,
    [errors, saving]
  );

  const save = async () => {
    if (!validateAll()) return;
    setSaving(true);
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      const payload = {
        fullName: form.fullName.trim(),
        gender: form.gender,
        email: form.email,                // disabled but submitted (server expects)
        phone: form.phone.trim(),
        dateOfBirth: toISO(form.dateOfBirth),
        pincode: form.pincode.trim(),
        address: form.address.trim(),
        knownLanguages: form.knownLanguages, // ARRAY
      };
      await axios.put(`${PERSONAL_API}/${applicantId}`, payload, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });
      onSuccess?.();
    } catch (e) {
      console.error("Personal details update failed:", e?.response || e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Failed to update personal details";
      onError?.(String(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingTop: 24 }}>
      <h3 style={{ marginBottom: 12 }}>Edit personal details</h3>

      <div className="pd-grid">
        {/* Full name */}
        <div className="input-wrapper">
          <input
            className="pd-input"
            type="text"
            placeholder="* Enter full name"
            value={form.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
          />
          {errors.fullName && <div className="error-message">{errors.fullName}</div>}
        </div>

        {/* Gender */}
        <div className="pd-select-wrap">
          <select
            className="pd-select"
            value={form.gender}
            onChange={(e) => setField("gender", e.target.value)}
          >
            <option value="">Choose gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <span className="pd-caret">▾</span>
          {errors.gender && <div className="error-message">{errors.gender}</div>}
        </div>

        {/* Email (disabled / read-only) */}
        <div className="input-wrapper">
          <input
            className="pd-input disabled-input"
            type="email"
            placeholder="* Enter email"
            value={form.email}
            disabled
            readOnly
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        {/* Phone */}
        <div className="input-wrapper">
          <input
            className="pd-input"
            type="tel"
            placeholder="* Enter phone number"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
          />
          {errors.phone && <div className="error-message">{errors.phone}</div>}
        </div>

        {/* DOB (ISO) */}
        <div className="pd-input with-icon">
          <input
            className="pd-input raw"
            type="date"
            placeholder="* Date of birth"
            value={form.dateOfBirth}
            onChange={(e) => setField("dateOfBirth", e.target.value)}
          />
          <span className="pd-icon" aria-hidden>📅</span>
        </div>
        {errors.dateOfBirth && (
          <div className="error-message" style={{ gridColumn: "1 / -1" }}>{errors.dateOfBirth}</div>
        )}

        {/* PIN */}
        <div className="input-wrapper">
          <input
            className="pd-input"
            placeholder="* PIN code"
            value={form.pincode}
            onChange={(e) => setField("pincode", e.target.value)}
          />
          {errors.pincode && <div className="error-message">{errors.pincode}</div>}
        </div>

        {/* Address (full width) */}
        <div className="input-wrapper span-2">
          <input
            className="pd-input"
            placeholder="* Permanent address"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
          />
          {errors.address && <div className="error-message">{errors.address}</div>}
        </div>

        {/* Known Languages (chips) */}
        <div className="input-wrapper span-2">
          <div className="pd-input" style={{ padding: 8 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {form.knownLanguages.map((lang) => (
                <span
                  key={lang}
                  className="skill-chip"
                  style={{ background: "#eef2ff", color: "#1e3a8a" }}
                >
                  {lang}
                  <span
                    className="chip-x"
                    onClick={() => removeLanguage(lang)}
                    style={{ marginLeft: 6, cursor: "pointer" }}
                  >
                    ×
                  </span>
                </span>
              ))}
              <input
                style={{
                  border: "none",
                  outline: "none",
                  flex: 1,
                  minWidth: 180,
                }}
                placeholder="Type a language and press Enter"
                value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    tryAddLanguage();
                  }
                }}
              />
              <button
                type="button"
                className="pd-add"
                onClick={tryAddLanguage}
                style={{ cursor: "pointer" }}
              >
                +
              </button>
            </div>
          </div>
          {errors.knownLanguages && (
            <div className="error-message">{errors.knownLanguages}</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <button
          className="btn-primary"
          onClick={save}
          disabled={!canSave}
          aria-busy={saving}
          style={{ opacity: !canSave ? 0.6 : 1 }}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
};

export default PersonalDetailsEditPopup;
