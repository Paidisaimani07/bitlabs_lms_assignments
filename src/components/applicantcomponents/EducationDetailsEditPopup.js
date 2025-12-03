import React, { useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import CustomDropdown from "../common/CustomDropdown";

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
      <h3 style={{ marginBottom: 12 }}>Edit education details</h3>

      {/* Graduation */}
      <div className="card-base" style={{ margin: 0 }}>
        <div className="card-title-row" style={{ marginBottom: 12 }}>
          <h4 className="card-title" style={{ fontSize: 14 }}>
            Graduation details <span className="req">*</span>
          </h4>
        </div>
        <div className="pd-grid">
          <CustomDropdown
            value={form.graduation.degree}
            options={degreeOptions}
            placeholder="Graduation/Diploma"
            onChange={(val) => setField("graduation.degree", val)}
            error={errors["graduation.degree"]}
          />

          <div className="field-align">
            <input
              className="pd-input"
              placeholder="University / Institute"
              value={form.graduation.university}
              onChange={(e) => setField("graduation.university", e.target.value)}
            />
            {errors["graduation.university"] && (
              <div className="error-message">{errors["graduation.university"]}</div>
            )}</div>

          <CustomDropdown
            value={form.graduation.course}
            options={[
              "Computer Science", "Information Technology", "Electronics",
              "Mechanical", "Civil", "AI & ML", "Data Science"
            ]}
            placeholder="Course"
            onChange={(val) => setField("graduation.course", val)}
            error={errors["graduation.course"]}
          />

          <div className="field-align">
            <input
              className="pd-input"
              placeholder="Specialization"
              value={form.graduation.specialization}
              onChange={(e) => setField("graduation.specialization", e.target.value)}
            />
            {errors["graduation.specialization"] && (
              <div className="error-message">{errors["graduation.specialization"]}</div>
            )}
          </div>

          <CustomDropdown
            value={form.graduation.courseType}
            options={courseTypeOptions}
            placeholder="Course Type"
            onChange={(val) => setField("graduation.courseType", val)}
            error={errors["graduation.courseType"]}
          />

          <CustomDropdown
            value={form.graduation.gradingSystem}
            options={gradingOptions}
            placeholder="Grading System"
            onChange={(val) => setField("graduation.gradingSystem", val)}
            error={errors["graduation.gradingSystem"]}
          />

          <div className="field-align">
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
          </div>
          <div className="field-align">
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
      </div>

      {/* Class XII */}
      <div className="card-base" style={{ marginTop: 14 }}>
        <div className="card-title-row" style={{ marginBottom: 12 }}>
          <h4 className="card-title" style={{ fontSize: 14 }}>
            Class XII details <span className="req">*</span>
          </h4>
        </div>

        <div className="pd-grid">

          {/* Board of Education */}
          <CustomDropdown
            value={form.classXii.board}
            onChange={(v) => setField("classXii.board", v)}
            options={boardOptions}
            placeholder="Board of education"
            error={errors["classXii.board"]}
          />

          {/* Passing Out Year */}
          <CustomDropdown
            value={form.classXii.passingYear}
            onChange={(v) => setField("classXii.passingYear", v)}
            options={YEARS}
            placeholder="Passing out year"
            error={errors["classXii.passingYear"]}
          />

          {/* Marks Percentage */}
          <CustomDropdown
            value={form.classXii.marksPercent}
            onChange={(v) => setField("classXii.marksPercent", v)}
            options={percentBuckets}
            placeholder="Marks in %age"
            error={errors["classXii.marksPercent"]}
          />

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

          {/* Board */}
          <CustomDropdown
            label="Board of education"
            value={form.classX.board}
            onChange={(val) => setField("classX.board", val)}
            placeholder="Board of education"
            options={boardOptions}
            error={errors["classX.board"]}
          />

          {/* Passing Year */}
          <CustomDropdown
            label="Passing out year"
            value={form.classX.passingYear}
            onChange={(val) => setField("classX.passingYear", val)}
            placeholder="Passing out year"
            options={YEARS}
            error={errors["classX.passingYear"]}
          />

          {/* Marks Percentage */}
          <CustomDropdown
            label="Marks in %age"
            value={form.classX.marksPercent}
            onChange={(val) => setField("classX.marksPercent", val)}
            placeholder="Marks in %age"
            options={percentBuckets}
            error={errors["classX.marksPercent"]}
          />

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

export default EducationDetailsEditPopup;
