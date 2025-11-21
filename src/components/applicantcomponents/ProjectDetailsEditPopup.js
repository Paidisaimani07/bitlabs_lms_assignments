// src/components/applicant/ProjectDetailsEditPopup.jsx
import React, { useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";

const PROJ_API = `${apiUrl}/applicant-projects`;

const required = (msg) => (v) => (String(v ?? "").trim() ? "" : msg);
const requiredNum = (msg) => (v) => (v === 0 || v ? "" : msg);

const validators = {
  projectTitle: required("Project title is required"),
  specialization: required("Specialization on the project is required"),
  technologiesUsed: required("Technologies used is required"),
  teamSize: requiredNum("Team size is required"),
  roleInProject: required("Your role is required"),
  skillsUsed: required("Skills used is required"),
  roleDescription: required("Role description is required"),
  projectDescription: required("Project description is required"),
};

const Field = ({ label, requiredMark, children }) => (
  <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6, color: "#111827" }}>
    {label} {requiredMark && <span className="req">*</span>}
    <div>{children}</div>
  </label>
);

const Error = ({ msg }) =>
  msg ? <div className="error-message" style={{ marginTop: 6 }}>{msg}</div> : null;

const ChipEditor = ({ value, onChange, placeholder }) => {
  const [draft, setDraft] = useState("");
  const items = useMemo(
    () =>
      (value || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [value]
  );

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    const next = Array.from(new Set([...items, t]));
    onChange(next.join(", "));
    setDraft("");
  };
  const remove = (i) => {
    const next = items.filter((_, idx) => idx !== i);
    onChange(next.join(", "));
  };

  return (
    <>
      <div className="pd-input with-add" style={{ marginBottom: 8 }}>
        <input
          className="pd-input raw"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button className="pd-add" type="button" onClick={add} aria-label="add">+</button>
      </div>
      <div className="skills-list">
        {items.map((t, i) => (
          <span key={`${t}-${i}`} className="skill-chip">
            {t}
            <span className="chip-x" onClick={() => remove(i)} role="button" aria-label={`remove ${t}`}>×</span>
          </span>
        ))}
      </div>
    </>
  );
};

const ProjectDetailsEditPopup = ({ applicantId, initial, onSuccess, onError }) => {
  const [form, setForm] = useState({
    projectTitle: initial?.projectTitle || "",
    specialization: initial?.specialization || "",
    technologiesUsed: initial?.technologiesUsed || "",
    teamSize: initial?.teamSize ?? "",
    roleInProject: initial?.roleInProject || "",
    skillsUsed: initial?.skillsUsed || "",
    roleDescription: initial?.roleDescription || "",
    projectDescription: initial?.projectDescription || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: validators[name](value) }));
  };

  const validateAll = () => {
    const next = {};
    Object.keys(validators).forEach((k) => {
      const msg = validators[k](form[k]);
      if (msg) next[k] = msg;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const canSave = useMemo(
    () => Object.values(errors).every((m) => !m) && !saving,
    [errors, saving]
  );

  const save = async () => {
    if (!validateAll()) return;
    const payload = { ...form, teamSize: Number(form.teamSize) };
    try {
      setSaving(true);
      const jwt = localStorage.getItem("jwtToken");
      await axios.put(`${PROJ_API}/${applicantId}`, payload, {
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
      });
      onSuccess?.();
    } catch (e) {
      console.error("Project PUT failed:", e?.response || e);
      onError?.(
        e?.response?.data?.message || e?.response?.data || e?.message || "Failed to save project details"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 940 }}>
      <h3 style={{ margin: 0, marginBottom: 16, fontSize: 20, fontWeight: 800 }}>
        Edit Project Details
      </h3>

      {/* Two-column grid, balanced spacing */}
      <div
        className="pd-grid"
        style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}
      >
        {/* Row 1 */}
        <div>
          <Field label="Project title" requiredMark>
            <input
              className="pd-input"
              placeholder="e.g., Online Job Portal"
              value={form.projectTitle}
              onChange={(e) => setField("projectTitle", e.target.value)}
            />
          </Field>
          <Error msg={errors.projectTitle} />
        </div>

        <div>
          <Field label="Specialisation on the project" requiredMark>
            <input
              className="pd-input"
              placeholder="e.g., Full Stack Web Development"
              value={form.specialization}
              onChange={(e) => setField("specialization", e.target.value)}
            />
          </Field>
          <Error msg={errors.specialization} />
        </div>

        {/* Row 2 */}
        <div className="span-2">
          <Field label="Technologies used for project" requiredMark>
            <ChipEditor
              value={form.technologiesUsed}
              onChange={(v) => setField("technologiesUsed", v)}
              placeholder="Type a technology and press Enter (React, Spring Boot, MySQL...)"
            />
          </Field>
          <Error msg={errors.technologiesUsed} />
        </div>

        {/* Row 3 */}
        <div>
          <Field label="Project team size" requiredMark>
            <input
              className="pd-input"
              placeholder="e.g., 4"
              value={form.teamSize}
              inputMode="numeric"
              onChange={(e) => setField("teamSize", e.target.value.replace(/\D/g, ""))}
            />
          </Field>
          <Error msg={errors.teamSize} />
        </div>

        <div>
          <Field label="Your role in the project" requiredMark>
            <input
              className="pd-input"
              placeholder="e.g., Backend Developer"
              value={form.roleInProject}
              onChange={(e) => setField("roleInProject", e.target.value)}
            />
          </Field>
          <Error msg={errors.roleInProject} />
        </div>

        {/* Row 4 */}
        <div className="span-2">
          <Field label="Skills used" requiredMark>
            <ChipEditor
              value={form.skillsUsed}
              onChange={(v) => setField("skillsUsed", v)}
              placeholder="Type a skill and press Enter (REST API, JPA, Docker...)"
            />
          </Field>
          <Error msg={errors.skillsUsed} />
        </div>

        {/* Row 5 — Full width textareas, equal height */}
        <div>
          <Field label="Role description" requiredMark>
            <textarea
              className="pd-input"
              placeholder="What did you specifically contribute? (e.g., designed and implemented REST APIs...)"
              value={form.roleDescription}
              onChange={(e) => setField("roleDescription", e.target.value)}
              style={{ height: 140, resize: "vertical" }}
            />
          </Field>
          <Error msg={errors.roleDescription} />
        </div>

        <div>
          <Field label="Project description" requiredMark>
            <textarea
              className="pd-input"
              placeholder="What is this project about? Who uses it? Impact, tech, results..."
              value={form.projectDescription}
              onChange={(e) => setField("projectDescription", e.target.value)}
              style={{ height: 140, resize: "vertical" }}
            />
          </Field>
          <Error msg={errors.projectDescription} />
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <button
          className="btn-primary"
          onClick={save}
          disabled={!canSave}
          aria-busy={saving}
          style={{ minWidth: 140, height: 40, opacity: !canSave ? 0.6 : 1 }}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
};

export default ProjectDetailsEditPopup;
