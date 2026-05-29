import React, { useEffect, useState } from "react";
import RecruiterNavBar from "./RecruiterNavBar";

function RecruiterLmsOverview() {
  const [imageSrc, setImageSrc] = useState(null);
  const [showStudentsOverview, setShowStudentsOverview] = useState(false);

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("STATUS:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ API ERROR RESPONSE:", errorText);
          setStudents([]);
          return;
        }

        const data = await res.json();
        console.log("API RESPONSE:", data);

        const list = Array.isArray(data)
          ? data
          : data?.data || data?.content || [];

        console.log("FINAL STUDENT LIST:", list);

        setStudents(list);
      } catch (err) {
        console.error("❌ FETCH ERROR:", err);
        setStudents([]);
      }
    };

    fetchData();
  }, [API]);

  // ✅ Safe filter
  const filteredStudents = (students || []).filter((s) =>
    (s?.applicantName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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
              
              {/* Search */}
              <input
                type="text"
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "10px",
                  width: "100%",
                  maxWidth: "300px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  marginBottom: "20px",
                }}
              />

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
                            {student.applicantId}
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