import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RecruiterNavBar from "./RecruiterNavBar";

function TopicProgressPage() {
  const { applicantId } = useParams();
  const navigate = useNavigate();
  const [topicProgress, setTopicProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchTopicProgress = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("jwtToken");

        const response = await fetch(
          `${API}/api/progress/applicant/${applicantId}/topics`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        const data = await response.json();
        console.log("Topic Progress Data:", data);
        setTopicProgress(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching topic progress:", error);
        setError("Failed to load topic progress");
      } finally {
        setLoading(false);
      }
    };

    fetchTopicProgress();
  }, [applicantId, API]);

  // Styles
  const dashboardContainer = {
    minHeight: "100vh",
  };

  const contentStyle = {
    marginLeft: window.innerWidth > 1024 ? "260px" : "0px",
    padding: "45px",
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0px 2px 12px rgba(0,0,0,0.08)",
  };

  const titleStyle = {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "15px",
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

  const buttonStyle = {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#64748b",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  };

  return (
    <div style={dashboardContainer}>
      <RecruiterNavBar imageSrc={imageSrc} setImageSrc={setImageSrc} />

      <div style={contentStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>
            Topic Progress - Applicant {applicantId}
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : topicProgress.length === 0 ? (
            <p>No topic progress found</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "15px",
                background: "#fff",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0px 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={thStyle}>Course</th>
                  <th style={thStyle}>Topic</th>
                  <th style={thStyle}>Progress</th>
                </tr>
              </thead>

              <tbody>
                {topicProgress.map((topic, index) => (
                  <tr
                    key={index}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td style={tdStyle}>{topic.courseName}</td>
                    <td style={tdStyle}>{topic.topicName}</td>
                    <td style={tdStyle}>{topic.topicProgress}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <button
            onClick={() => navigate("/recruiter/lms-overview")}
            style={buttonStyle}
          >
            Back to LMS Overview
          </button>
        </div>
      </div>
    </div>
  );
}

export default TopicProgressPage;
