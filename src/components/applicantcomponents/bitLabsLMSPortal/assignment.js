import React, { useState } from 'react';
import './assignment.css';
import { useUserContext } from "../../common/UserProvider";

const Assignment = () => {
  const { user } = useUserContext();

  const [assignments] = useState([
    {
      id: 1,
      topic: "First Html Page",
      subButton: "What is a Web Application?"
    },
    {
      id: 2,
      topic: "Styling",
      subButton: "Basics of HTML Structure"
    },
    {
      id: 3,
      topic: "styling_Part-2",
      subButton: "Introduction to CSS Styling"
    },
    {
      id: 4,
      topic: "registration_forms",
      subButton: "Advanced CSS Concepts"
    },
    {
      id: 5,
      topic: "HTML Forms",
      subButton: "Creating Forms in HTML"
    }
  ]);

  const handleViewAssignment = (topic) => {
    const t = topic.trim().toLowerCase();
    if (t === "first html page") {
      window.open('/assignment/first-html-page', '_blank', 'width=1000,height=800');
    } else if (t === "styling") {
      window.open('/assignment/first-html-page?type=styling', '_blank', 'width=1000,height=800');
    } else if (t === "styling_part-2") {
      window.open('/assignment/first-html-page?type=styling2', '_blank', 'width=1000,height=800');
    } else if (t === "registration_forms") {
      window.open('/assignment/first-html-page?type=forms', '_blank', 'width=1000,height=800');
    } else {
      alert("Assignment content for '" + topic + "' is coming soon!");
    }
  };

  return (
    <div className="assignment-container">
      <div className="assignment-header">
        <h2>Assignments</h2>
      </div>

      <div className="assignment-sidebar">
        {assignments.map((topic) => (
          <div key={topic.id} className="topic-section">
            <div className="topic-header">
              <span className="topic-title">{topic.topic}</span>
            </div>

            <div className="sub-button-container">
              <div className="sub-button">
                <span className="sub-button-text">
                  {topic.subButton}
                </span>
              </div>
            </div>
          </div>
        ))}

        <div className="assignments-section">
          <h3>Assignments</h3>

          <div className="assignments-list">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="assignment-item"
              >
                <div className="assignment-content">
                  <span className="assignment-title">
                    {assignment.topic}
                  </span>
                </div>

                <div className="assignment-actions">
                  <button
                    className="mark-done-btn pending"
                    onClick={() => handleViewAssignment(assignment.topic)}
                  >
                    View Assignment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignment;
