import React, { useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import CustomDropdown from "../common/CustomDropdown";

const EDU_API = `${apiUrl}/applicant-education`;

const degreeOptions = [
  { value: "B.E / B.Tech", label: "B.E / B.Tech" },
  { value: "B.Sc", label: "B.Sc" },
  { value: "BCA", label: "BCA" },
  { value: "Diploma", label: "Diploma" },
  { value: "B.Com", label: "B.Com" },
  { value: "BBA", label: "BBA" },
  { value: "M.E / M.Tech", label: "M.E / M.Tech" },
  { value: "M.Sc", label: "M.Sc" },
  { value: "MCA", label: "MCA" },
  { value: "MBA", label: "MBA" },
  { value: "PhD", label: "PhD" }
];

const specializationOptions = {
  "B.E / B.Tech": [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Artificial Intelligence & Machine Learning",
    "Data Science",
    "Aerospace Engineering",
    "Biotechnology",
    "Chemical Engineering",
    "Other"
  ],
  "B.Sc": [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Electronics",
    "Statistics",
    "Other"
  ],
  "BCA": [
    "Software Development",
    "Web Development",
    "Mobile App Development",
    "Database Management",
    "Cloud Computing",
    "Other"
  ],
  "Diploma": [
    "Computer Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Electronics & Communication",
    "Other"
  ],
 "B.Com": [
    "Accounting",
    "Finance",
    "Taxation",
    "Banking",
    "E-Commerce",
    "Other"
  ],
 "BBA": [
    "Marketing",
    "Finance",
    "Human Resources",
    "International Business",
    "Entrepreneurship",
    "Other"
  ],
  "M.E / M.Tech": [
    "Computer Science & Engineering",
    "Data Science",
    "Artificial Intelligence",
    "Machine Learning",
    "Cyber Security",
    "Other"
  ],
  "M.Sc": [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Data Science",
    "Other"
  ],
  "MCA": [
    "Software Engineering",
    "Cloud Computing",
    "Mobile Application Development",
    "Data Analytics",
    "Other"
  ],
 "MBA": [
    "Finance",
    "Marketing",
    "Human Resources",
    "Operations",
    "International Business",
    "Other"
  ],
 "PhD": [
    "Computer Science",
    "Engineering",
    "Sciences",
    "Management",
    "Other"
  ]
};
const courseTypeOptions = ["Full time", "Part time", "Distance"];
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

const validateYear = (value, { startYear } = {}) => {
  if (!value) return "Year is required";
  if (isNaN(value)) return "Must be a valid year";
  if (value < 1900) return "Year must be after 1900";
  if (startYear !== undefined && value < startYear) return "Must be after start year";
  return "";
};

const validatePercentage = (value) => {
  if (value === "") return "Marks % is required";
  const num = parseFloat(value);
  if (isNaN(num)) return "Must be a valid number";
  if (num < 0 || num > 100) return "Must be between 0 and 100";
  return "";
};

const validators = {
  graduation: {
    degree: nonEmpty("Graduation/Diploma is required"),
    university: nonEmpty("University/Institute is required"),
    course: nonEmpty("Course is required"),
    specialization: nonEmpty("Specialization is required"),
    courseType: nonEmpty("Course type is required"),
    board: nonEmpty("Board is required"),
    startYear: (value, form) => {
      if (!value) return "Start year is required";
      if (isNaN(value)) return "Must be a valid year";
      if (value < 1900) return "Year must be after 1900";
      if (form.graduation.endYear && value > form.graduation.endYear) {
        return "Must be before end year";
      }
      return "";
    },
    endYear: (value, form) => {
      if (!value) return "End year is required";
      if (isNaN(value)) return "Must be a valid year";
      if (value < form.graduation.startYear) return "Must be after start year";
      if (value > new Date().getFullYear() + 5) return "Invalid future year";
      return "";
    },
    marksPercent: validatePercentage,
  },
  classXii: {
    board: nonEmpty("Board of education is required"),
    passingYear: (value) => validateYear(value),
    marksPercent: validatePercentage,
  },
  classX: {
    board: nonEmpty("Board of education is required"),
    passingYear: (value) => validateYear(value),
    marksPercent: validatePercentage,
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
      board: initial?.graduation?.board || "",
      startYear: initial?.graduation?.startYear || "",
      endYear: initial?.graduation?.endYear || "",
      marksPercent: initial?.graduation?.marksPercent || ""
    },
    classXii: {
      board: initial?.classXii?.board || "",
      passingYear: initial?.classXii?.passingYear || "",
      marksPercent: initial?.classXii?.marksPercent || ""
    },
    classX: {
      board: initial?.classX?.board || "",
      passingYear: initial?.classX?.passingYear || "",
      marksPercent: initial?.classX?.marksPercent || ""
    }
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (path, value) => {
    setForm((f) => {
      const copy = JSON.parse(JSON.stringify(f));
      const [a, b] = path.split(".");
      copy[a][b] = value;

      if (path === 'graduation.degree') {
        copy.graduation.specialization = '';
        setErrors(e => ({
          ...e,
          'graduation.specialization': validators.graduation.specialization('')
        }));
      }

      const validator = validators[a]?.[b];
      if (validator) {
        const error = typeof validator === 'function' 
          ? validator(value, { ...copy, [a]: { ...copy[a] } })
          : validator;
        
        setErrors(e => ({
          ...e,
          [path]: error || ''
        }));
      }

      return copy;
    });
  };
  
  const getSpecializations = () => {
    const degree = form.graduation.degree || '';
    return specializationOptions[degree] || [];
  };

  const validateAll = () => {
    const newErrors = {};
    
    Object.entries(validators).forEach(([section, sectionValidators]) => {
      Object.entries(sectionValidators).forEach(([field, validator]) => {
        const value = form[section][field];
        const error = typeof validator === 'function' 
          ? validator(value, form) 
          : validator;
        
        if (error) {
          newErrors[`${section}.${field}`] = error;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = useMemo(() => {
    // Check if all required fields are filled and valid
    let isValid = true;
    
    // Check graduation fields
    const gradFields = ['degree', 'university', 'specialization', 'courseType', 'startYear', 'endYear', 'marksPercent'];
    for (const field of gradFields) {
      if (!form.graduation[field]) {
        isValid = false;
        break;
      }
    }
    
    // Check classXII fields
    const classXIIFields = ['board', 'passingYear', 'marksPercent'];
    for (const field of classXIIFields) {
      if (!form.classXii[field]) {
        isValid = false;
        break;
      }
    }
    
    // Check classX fields
    for (const field of classXIIFields) {
      if (!form.classX[field]) {
        isValid = false;
        break;
      }
    }
    
    return isValid && Object.keys(errors).length === 0;
  }, [form, errors]);

  const canSave = useMemo(
    () => isFormValid && !saving,
    [isFormValid, saving]
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

    const payload = {
      graduation: {
        degree: form.graduation.degree,
        university: form.graduation.university,
        course: form.graduation.course,
        specialization: form.graduation.specialization,
        courseType: form.graduation.courseType,
        board: form.graduation.board,
        startYear: Number(form.graduation.startYear),
        endYear: Number(form.graduation.endYear),
        marksPercent: parseFloat(form.graduation.marksPercent) || 0
      },
      classXii: {
        board: form.classXii.board,
        passingYear: Number(form.classXii.passingYear) || 0,
        marksPercent: parsePercent(form.classXii.marksPercent) || 0
      },
      classX: {
        board: form.classX.board,
        passingYear: Number(form.classX.passingYear) || 0,
        marksPercent: parsePercent(form.classX.marksPercent) || 0
      }
    };

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
            placeholder="Select Degree"
            onChange={(val) => {
              const selected = degreeOptions.find(d => d.value === val);
              setField("graduation.degree", selected.label);   
              setField("graduation.degreeValue", selected.value); 
              setField("graduation.specialization", ""); 
            }}
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

            {/* Marks Percentage */}
            <CustomDropdown
              label="Marks in %age"
              value={form.graduation.marksPercent}
              onChange={(val) => setField("graduation.marksPercent", val)}
              placeholder="Marks in %age"
              options={percentBuckets}
              error={errors["graduation.marksPercent"]}
            />

          {/* <CustomDropdown
            value={form.graduation.course}
            options={[
              "Computer Science", "Information Technology", "Electronics",
              "Mechanical", "Civil", "AI & ML", "Data Science"
            ]}
            placeholder="Course"
            onChange={(val) => setField("graduation.course", val)}
            error={errors["graduation.course"]}
          /> */}

          <CustomDropdown
            value={form.graduation.specialization}
            options={[
              { value: "", label: "Select Specialization" },
              ...getSpecializations().map(spec => ({
                value: spec,
                label: spec
              })),
              ...(form.graduation.specialization &&
                !getSpecializations().includes(form.graduation.specialization) ? [{
                  value: form.graduation.specialization,
                  label: form.graduation.specialization
                }] : [])
            ]}
            placeholder="Select Specialization"
            onChange={(val) => setField("graduation.specialization", val)}
            error={errors["graduation.specialization"]}
            disabled={!form.graduation.degree}
            searchable={true}
            clearable={true}
          />

          <CustomDropdown
            value={form.graduation.courseType}
            options={courseTypeOptions}
            placeholder="Course Type"
            onChange={(val) => setField("graduation.courseType", val)}
            error={errors["graduation.courseType"]}
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
