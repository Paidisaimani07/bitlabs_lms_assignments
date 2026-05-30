import React, { useEffect, useState } from "react";
import RecruiterNavBar from "./RecruiterNavBar";
import { useNavigate } from "react-router-dom";

function RecruiterLmsOverview() {
  const navigate = useNavigate();
  const [imageSrc, setImageSrc] = useState(null);
  const [showStudentsOverview, setShowStudentsOverview] = useState(false);

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [progressFilter, setProgressFilter] = useState("");
  const [assignmentsFilter, setAssignmentsFilter] = useState("");
  const [coursesFilter, setCoursesFilter] = useState("");

  const API = process.env.REACT_APP_API_URL;

  // ✅ Fetch LMS data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("API BASE:", API);

        if (!API) {
          console.error("❌ REACT_APP_API_URL is not defined in .env");
          return;
        }

        const url = `${API}/api/progress/lms-overview-page`;
        console.log("FETCH URL:", url);

        const token = localStorage.getItem('jwtToken');
        const headers = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(url, {
          method: "GET",
          headers: headers,
        });

        console.log("STATUS:", res.status);
        console.log("HEADERS:", Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ API ERROR RESPONSE:", errorText);
          setStudents([]);
          return;
        }

        const data = await res.json();
        console.log("API RESPONSE:", data);
        console.log("Response type:", typeof data);
        console.log("Is array:", Array.isArray(data));
        console.log("Keys:", Object.keys(data));

        const list = Array.isArray(data)
          ? data
          : data?.data || data?.content || data?.students || [];

        console.log("FINAL STUDENT LIST:", list);
        console.log("Student count:", list.length);

        setStudents(list);
      } catch (err) {
        console.error("❌ FETCH ERROR:", err);
        setStudents([]);
      }
    };

    fetchData();
  }, [API]);

  // ✅ Safe filter
  const filteredStudents = (students || []).filter((s) => {
    const nameMatch = (s?.applicantName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const progressValue = s?.overallProgress != null ? Number(s.overallProgress) : 0;
    const progressMatch = progressFilter === "" || 
      (progressFilter === "high" && progressValue >= 70) ||
      (progressFilter === "medium" && progressValue >= 40 && progressValue < 70) ||
      (progressFilter === "low" && progressValue < 40);
    
    const assignmentsValue = s?.assignmentsSubmitted ?? 0;
    const assignmentsMatch = assignmentsFilter === "" || 
      (assignmentsFilter === "completed" && assignmentsValue > 0) ||
      (assignmentsFilter === "pending" && assignmentsValue === 0);
    
    const coursesValue = s?.coursesCompleted ?? 0;
    const coursesMatch = coursesFilter === "" || 
      (coursesFilter === "completed" && coursesValue > 0) ||
      (coursesFilter === "pending" && coursesValue === 0);
    
    return nameMatch && progressMatch && assignmentsMatch && coursesMatch;
  });

  // Styles
  const dashboardContainer = {
    minHeight: "100vh",
  };

  const lmsContent = {
    marginLeft: window.innerWidth > 1024 ? "260px" : "0px",
    padding: "45px",
  };

  const lmsCard = {
    background: "transparent",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0px 2px 12px rgba(0,0,0,0.08)",
  };

  const lmsTitle = {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "15px",
  };

  const lmsSubtitle = {
    fontSize: "20px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "10px",
  };

  const lmsText = {
    fontSize: "16px",
    color: "#64748b",
    lineHeight: "1.6",
  };

  const buttonStyle = {
    marginTop: "20px",
    backgroundColor: "#F97316",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  };

  const thStyle = {
    padding: "12px",
    fontWeight: "700",
    color: "#374151",
    borderBottom: "1px solid #ddd",
    textAlign: "left",
  };

  const tdStyle = {
    padding: "12px",
    color: "#4b5563",
  };

  return (
    <div style={dashboardContainer}>
      <RecruiterNavBar imageSrc={imageSrc} setImageSrc={setImageSrc} />

      <div style={lmsContent}>
        <div style={lmsCard}>
          <h2 style={lmsTitle}>LMS Overview</h2>

          <h4 style={lmsSubtitle}>Learning Management System</h4>

          <p style={lmsText}>This is LMS Overview Page</p>

          {/* Toggle Button */}
          <button
            style={buttonStyle}
            onClick={() =>
              setShowStudentsOverview(!showStudentsOverview)
            }
          >
            {showStudentsOverview
              ? "Hide LMS Students Overview"
              : "View LMS Students Overview"}
          </button>

          {/* STUDENTS SECTION */}
          {showStudentsOverview && (
            <div style={{ marginTop: "25px" }}>
              
              {/* Filters Container */}
              <div style={{ 
                display: "flex", 
                gap: "15px", 
                flexWrap: "wrap", 
                marginBottom: "20px",
                alignItems: "center"
              }}>
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "10px",
                    width: "200px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                />

                {/* Progress Filter */}
                <select
                  value={progressFilter}
                  onChange={(e) => setProgressFilter(e.target.value)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    width: "150px",
                  }}
                >
                  <option value="">All Progress</option>
                  <option value="high">High (≥70%)</option>
                  <option value="medium">Medium (40-70%)</option>
                  <option value="low">Low (&lt;40%)</option>
                </select>

                {/* Assignments Filter */}
                <select
                  value={assignmentsFilter}
                  onChange={(e) => setAssignmentsFilter(e.target.value)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    width: "150px",
                  }}
                >
                  <option value="">All Assignments</option>
                  <option value="completed">Submitted</option>
                  <option value="pending">Not Submitted</option>
                </select>

                {/* Courses Filter */}
                <select
                  value={coursesFilter}
                  onChange={(e) => setCoursesFilter(e.target.value)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    width: "150px",
                  }}
                >
                  <option value="">All Courses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Not Completed</option>
                </select>

                {/* Clear Filters Button */}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setProgressFilter("");
                    setAssignmentsFilter("");
                    setCoursesFilter("");
                  }}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "#64748b",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Clear Filters
                </button>
              </div>

              {/* Empty state */}
              {filteredStudents.length === 0 ? (
                <p style={{ color: "gray" }}>
                  No students found or API not returning data
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      background: "#fff",
                      borderRadius: "10px",
                      overflow: "hidden",
                      boxShadow: "0px 2px 10px rgba(0,0,0,0.08)",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f3f4f6" }}>
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Progress</th>
                        <th style={thStyle}>Courses</th>
                        <th style={thStyle}>Assignments</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr
                          key={student.applicantId}
                          style={{
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          <td style={tdStyle}>
                            <span
                              style={{
                                color: "#2563eb",
                                cursor: "pointer",
                                textDecoration: "underline",
                                fontWeight: "600",
                              }}
                              onClick={() => navigate(`/recruiter/topic-progress/${student.applicantId}`)}
                            >
                              {student.applicantId}
                            </span>
                          </td>

                          <td style={tdStyle}>
                            {student.applicantName ?? "No Name"}
                          </td>

                          <td style={tdStyle}>
                            {student.overallProgress != null
                              ? Number(student.overallProgress).toFixed(1) + "%"
                              : "0.0%"}
                          </td>

                          <td style={tdStyle}>
                            {student.coursesCompleted ?? 0}
                          </td>

                          <td style={tdStyle}>
                            {student.assignmentsSubmitted ?? 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecruiterLmsOverview;