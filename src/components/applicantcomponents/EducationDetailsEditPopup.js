import React, { useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";

const EDU_API = `${apiUrl}/applicant-education`;

const degreeOptions = [
  "B.E / B.Tech", "B.Sc", "BCA", "Diploma", "B.Com", "BBA", "M.E / M.Tech", "M.Sc", "MCA"
];
const courseTypeOptions = ["Full time", "Part time", "Distance"];
const gradingOptions = ["Percentage", "CGPA"];
const boardOptions = ["CBSE", "ICSE", "State Board", "Other"];

const yearRange = (from, to) => {
  const arr = [];
  for (let y = to; y >= from; y--) arr.push(y);
  return arr;
};
const YEARS = yearRange(1980, new Date().getFullYear() + 1);

const percentBuckets = [
  "≥ 90", "80–89", "70–79", "60–69", "< 60"
];

const required = (msg) => (v) => (v === 0 || v ? "" : msg);
const nonEmpty = (msg) => (v) => (String(v || "").trim() ? "" : msg);

const validators = {
  graduation: {
    degree: nonEmpty("Graduation/Diploma is required"),
    university: nonEmpty("University/Institute is required"),
    course: nonEmpty("Course (Branch) is required"),
    specialization: nonEmpty("Specialization is required"),
    courseType: nonEmpty("Course type is required"),
    gradingSystem: nonEmpty("Grading system is required"),
    startYear: required("Course start year is required"),
    endYear: required("Course ending year is required"),
  },
  classXii: {
    board: nonEmpty("Board of education is required"),
    passingYear: required("Passing year is required"),
    marksPercent: required("Marks % is required"),
  },
  classX: {
    board: nonEmpty("Board of education is required"),
    passingYear: required("Passing year is required"),
    marksPercent: required("Marks % is required"),
  },
};

const EducationDetailsEditPopup = ({ applicantId, initial, onSuccess, onError }) => {
  const [form, setForm] = useState({
    graduation: {
      degree: initial?.graduation?.degree || "",
      university: initial?.graduation?.university || "",
      course: initial?.graduation?.course || "",
      specialization: initial?.graduation?.specialization || "",
      courseType: initial?.graduation?.courseType || "",
      gradingSystem: initial?.graduation?.gradingSystem || "",
      startYear: initial?.graduation?.startYear || "",
      endYear: initial?.graduation?.endYear || "",
    },
    classXii: {
      board: initial?.classXii?.board || "",
      passingYear: initial?.classXii?.passingYear || "",
      marksPercent: initial?.classXii?.marksPercent || "",
    },
    classX: {
      board: initial?.classX?.board || "",
      passingYear: initial?.classX?.passingYear || "",
      marksPercent: initial?.classX?.marksPercent || "",
    },
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (path, value) => {
    setForm((f) => {
      const copy = structuredClone(f);
      const [a, b] = path.split(".");
      copy[a][b] = value;
      return copy;
    });
    setErrors((e) => {
      const [a, b] = path.split(".");
      const v = validators[a][b](value);
      return { ...e, [path]: v };
    });
  };

  const validateAll = () => {
    const next = {};
    for (const a of Object.keys(validators)) {
      for (const b of Object.keys(validators[a])) {
        const v = validators[a][b](form[a][b]);
        if (v) next[`${a}.${b}`] = v;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const canSave = useMemo(
    () => Object.values(errors).every((m) => !m) && !saving,
    [errors, saving]
  );

  const parsePercent = (bucket) => {
    if (bucket === "≥ 90") return 90;
    if (bucket === "< 60") return 59;
    const m = /(\d+)[–-](\d+)/.exec(bucket || "");
    if (m) return (Number(m[1]) + Number(m[2])) / 2;
    const n = Number(bucket);
    return Number.isFinite(n) ? n : null;
  };

  const save = async () => {
    if (!validateAll()) return;

    const payload = structuredClone(form);
    // ensure numeric types for years & percents
    payload.graduation.startYear = Number(payload.graduation.startYear);
    payload.graduation.endYear = Number(payload.graduation.endYear);
    payload.classXii.passingYear = Number(payload.classXii.passingYear);
    payload.classX.passingYear = Number(payload.classX.passingYear);

    // convert percent buckets to number if needed
    const p1 = parsePercent(payload.classXii.marksPercent);
    const p2 = parsePercent(payload.classX.marksPercent);
    payload.classXii.marksPercent = p1 ?? Number(payload.classXii.marksPercent);
    payload.classX.marksPercent = p2 ?? Number(payload.classX.marksPercent);

    try {
      setSaving(true);
      const jwt = localStorage.getItem("jwtToken");
      await axios.put(`${EDU_API}/${applicantId}`, payload, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });
      onSuccess?.();
    } catch (e) {
      console.error("Education PUT failed:", e?.response || e);
      onError?.(
        e?.response?.data?.message ||
          e?.response?.data ||
          e?.message ||
          "Failed to save education details"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingTop: 24 }}>
      <h3 style={{ marginBottom: 12 }}>Edit Education Details</h3>

      {/* Graduation */}
      <div className="card-base" style={{ margin: 0 }}>
        <div className="card-title-row" style={{ marginBottom: 12 }}>
          <h4 className="card-title" style={{ fontSize: 14 }}>
            Graduation details <span className="req">*</span>
          </h4>
        </div>
        <div className="pd-grid">
          <div className="pd-select-wrap">
            <select
              className="pd-select"
              value={form.graduation.degree}
              onChange={(e) => setField("graduation.degree", e.target.value)}
            >
              <option value="">Graduation/Diploma</option>
              {degreeOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <span className="pd-caret">▾</span>
            {errors["graduation.degree"] && (
              <div className="error-message">{errors["graduation.degree"]}</div>
            )}
          </div>

          <input
            className="pd-input"
            placeholder="University / Institute"
            value={form.graduation.university}
            onChange={(e) => setField("graduation.university", e.target.value)}
          />
          {errors["graduation.university"] && (
            <div className="error-message">{errors["graduation.university"]}</div>
          )}

          <div className="pd-select-wrap">
            <select
              className="pd-select"
              value={form.graduation.course}
              onChange={(e) => setField("graduation.course", e.target.value)}
            >
              <option value="">Course</option>
              {[
                "Computer Science", "Information Technology", "Electronics",
                "Mechanical", "Civil", "AI & ML", "Data Science"
              ].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="pd-caret">▾</span>
            {errors["graduation.course"] && (
              <div className="error-message">{errors["graduation.course"]}</div>
            )}
          </div>

          <input
            className="pd-input"
            placeholder="Specialization"
            value={form.graduation.specialization}
            onChange={(e) => setField("graduation.specialization", e.target.value)}
          />
          {errors["graduation.specialization"] && (
            <div className="error-message">{errors["graduation.specialization"]}</div>
          )}

          <div className="pd-select-wrap">
            <select
              className="pd-select"
              value={form.graduation.courseType}
              onChange={(e) => setField("graduation.courseType", e.target.value)}
            >
              <option value="">Course type</option>
              {courseTypeOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="pd-caret">▾</span>
            {errors["graduation.courseType"] && (
              <div className="error-message">{errors["graduation.courseType"]}</div>
            )}
          </div>

          <div className="pd-select-wrap">
            <select
              className="pd-select"
              value={form.graduation.gradingSystem}
              onChange={(e) => setField("graduation.gradingSystem", e.target.value)}
            >
              <option value="">Grading system</option>
              {gradingOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <span className="pd-caret">▾</span>
            {errors["graduation.gradingSystem"] && (
              <div className="error-message">{errors["graduation.gradingSystem"]}</div>
            )}
          </div>

          <div className="pd-input with-icon">
            <select
              className="pd-input raw"
              value={form.graduation.startYear}
              onChange={(e) => setField("graduation.startYear", e.target.value)}
            >
              <option value="">Course start year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span className="pd-icon">📅</span>
          </div>
          {errors["graduation.startYear"] && (
            <div className="error-message">{errors["graduation.startYear"]}</div>
          )}

          <div className="pd-input with-icon">
            <select
              className="pd-input raw"
              value={form.graduation.endYear}
              onChange={(e) => setField("graduation.endYear", e.target.value)}
            >
              <option value="">Course ending year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span className="pd-icon">📅</span>
          </div>
          {errors["graduation.endYear"] && (
            <div className="error-message">{errors["graduation.endYear"]}</div>
          )}
        </div>
      </div>

      {/* Class XII */}
      <div className="card-base" style={{ marginTop: 14 }}>
        <div className="card-title-row" style={{ marginBottom: 12 }}>
          <h4 className="card-title" style={{ fontSize: 14 }}>
            Class XII details <span className="req">*</span>
          </h4>
        </div>
        <div className="pd-grid">
          <div className="pd-select-wrap">
            <select
              className="pd-select"
              value={form.classXii.board}
              onChange={(e) => setField("classXii.board", e.target.value)}
            >
              <option value="">Board of education</option>
              {boardOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <span className="pd-caret">▾</span>
            {errors["classXii.board"] && (
              <div className="error-message">{errors["classXii.board"]}</div>
            )}
          </div>

          <div className="pd-select-wrap">
            <select
              className="pd-select"
              value={form.classXii.passingYear}
              onChange={(e) => setField("classXii.passingYear", e.target.value)}
            >
              <option value="">Passing out year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span className="pd-caret">▾</span>
            {errors["classXii.passingYear"] && (
              <div className="error-message">{errors["classXii.passingYear"]}</div>
            )}
          </div>

          <div className="pd-select-wrap">
            <select
              className="pd-select"
              value={form.classXii.marksPercent}
              onChange={(e) => setField("classXii.marksPercent", e.target.value)}
            >
              <option value="">Marks in %age</option>
              {percentBuckets.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span className="pd-caret">▾</span>
            {errors["classXii.marksPercent"] && (
              <div className="error-message">{errors["classXii.marksPercent"]}</div>
            )}
          </div>
        </div>
      </div>

      {/* Class X */}
      <div className="card-base" style={{ marginTop: 14 }}>
        <div className="card-title-row" style={{ marginBottom: 12 }}>
          <h4 className="card-title" style={{ fontSize: 14 }}>
            Class X details <span className="req">*</span>
          </h4>
        </div>
        <div className="pd-grid">
          <div className="pd-select-wrap">
            <select
              className="pd-select"
              value={form.classX.board}
              onChange={(e) => setField("classX.board", e.target.value)}
            >
              <option value="">Board of education</option>
              {boardOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <span className="pd-caret">▾</span>
            {errors["classX.board"] && (
              <div className="error-message">{errors["classX.board"]}</div>
            )}
          </div>

          <div className="pd-select-wrap">
            <select
              className="pd-select"
              value={form.classX.passingYear}
              onChange={(e) => setField("classX.passingYear", e.target.value)}
            >
              <option value="">Passing out year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span className="pd-caret">▾</span>
            {errors["classX.passingYear"] && (
              <div className="error-message">{errors["classX.passingYear"]}</div>
            )}
          </div>

          <div className="pd-select-wrap">
            <select
              className="pd-select"
              value={form.classX.marksPercent}
              onChange={(e) => setField("classX.marksPercent", e.target.value)}
            >
              <option value="">Marks in %age</option>
              {percentBuckets.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span className="pd-caret">▾</span>
            {errors["classX.marksPercent"] && (
              <div className="error-message">{errors["classX.marksPercent"]}</div>
            )}
          </div>
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
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EducationDetailsEditPopup;
