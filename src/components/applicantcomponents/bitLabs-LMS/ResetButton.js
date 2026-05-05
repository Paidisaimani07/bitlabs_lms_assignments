import React, { useState } from 'react';
import ProgressAPIService from "./ProgressAPIService";

// Helper function to get course ID from course name
const getCourseId = (courseName) => {
  const courseMap = {
    "html & css": 1,
    "python": 2,
    "java": 3,
    "sql": 4,
    "react": 5,
    "spring boot": 6
  };
  return courseMap[courseName.toLowerCase()] || 0;
};

const ResetButton = ({ courseName, selectedTopicIndex, setSelectedTopicIndex, applicantId, courseContent, onResetComplete }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Debug logging
  console.log('ResetButton rendered with applicantId:', applicantId);

  const resetCourse = async () => {
    if (!applicantId) {
      alert("User not found. Please refresh the page.");
      return;
    }

    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setLoading(true);
    
    try {
      const courseId = getCourseId(courseName);
      
      // Reset backend progress using existing API endpoints
      try {
        // Get current course progress to update it to 0%
        const applicantCourses = await ProgressAPIService.getApplicantProgress(applicantId);
        const currentCourse = applicantCourses.find(course => 
          course.courseName.toLowerCase() === courseName.toLowerCase()
        );
        
        if (currentCourse) {
          // Update course progress to 0%
          await ProgressAPIService.saveProgress({
            applicantId: applicantId,
            courseId: courseId,
            courseName: courseName,
            topicIndex: 0,
            topicName: courseContent?.[0]?.topic || 'Introduction',
            topicProgress: 0
          });
          
          // Reset all topics to 0% progress
          const topicsProgress = await ProgressAPIService.getCourseTopics(currentCourse.id);
          for (const topic of topicsProgress) {
            await ProgressAPIService.saveProgress({
              applicantId: applicantId,
              courseId: courseId,
              courseName: courseName,
              topicIndex: topic.topicIndex,
              topicName: topic.topicName,
              topicProgress: 0
            });
          }
        }
        console.log("Backend reset successful");
      } catch (backendError) {
        console.log("Backend reset failed, using frontend reset only:", backendError);
        // Backend API might not exist, continue with frontend reset
      }
      
      // Clear localStorage SCORM data for this course
      for (let i = 0; i < 20; i++) {
        const key = `scorm_${courseName}_${i}`;
        localStorage.removeItem(key);
      }
      
      // Clear localStorage progress data for all topics
      for (let i = 0; i < 20; i++) {
        const progressKey = `articulate_course_${courseName}_${i}_progress`;
        localStorage.removeItem(progressKey);
      }
      
      // Clear any other course-related localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes(courseName.toLowerCase()) || key.includes(`course_${courseId}`)) {
          localStorage.removeItem(key);
        }
      });
      
      // Reset to first topic
      setSelectedTopicIndex(0);
      
      // Reload iframe to start fresh
      const iframe = document.querySelector('.video-frame');
      if (iframe) {
        const currentSrc = iframe.src;
        iframe.src = currentSrc;
      }
      
      alert(`Course "${courseName}" has been reset to 0% progress. Starting from the beginning...`);
      
      // Call parent callback if provided
      if (onResetComplete) {
        onResetComplete();
      }
      
    } catch (error) {
      console.error('Error resetting course progress:', error);
      alert("Error resetting course progress. Please try again.");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const cancelReset = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <button 
        onClick={resetCourse}
        disabled={loading}
        className="fullscreen-btn"
        style={{
          marginRight: "10px",
          backgroundColor: showConfirm ? "#dc3545" : (loading ? "#ccc" : "#6c757d"),
          color: "white",
          border: "2px solid #5a6268",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "14px",
          fontWeight: "bold",
          minWidth: "120px",
          zIndex: 1000
        }}
      >
        {loading ? "Resetting..." : (showConfirm ? "Confirm Reset" : "Reset Course")}
      </button>
      
      {showConfirm && (
        <button 
          onClick={cancelReset}
          disabled={loading}
          className="fullscreen-btn"
          style={{
            marginRight: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "2px solid #1e7e34",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            minWidth: "80px",
            zIndex: 1000
          }}
        >
          Cancel
        </button>
      )}
    </>
  );
};

export default ResetButton;
