import React, { useState } from 'react';
import ProgressAPIService from "./ProgressAPIService.js";


const ContinueButton = ({ courseName, selectedTopicIndex, setSelectedTopicIndex, applicantId }) => {
  const [loading, setLoading] = useState(false);
  
  // Debug logging
  console.log('ContinueButton rendered with applicantId:', applicantId);

  const continueCourse = async () => {
    if (!applicantId) {
      alert("User not found. Please refresh the page.");
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔍 Getting progress for applicantId:', applicantId, 'courseName:', courseName);
      
      // Get all courses progress for this applicant from backend
      const applicantCourses = await ProgressAPIService.getApplicantProgress(applicantId);
      console.log('📊 Applicant courses:', applicantCourses);
      
      // Find the current course progress
      const currentCourse = applicantCourses.find(course => 
        course.courseName.toLowerCase() === courseName.toLowerCase()
      );
      
      if (currentCourse) {
        console.log('✅ Found current course:', currentCourse);
        
        // Get topics progress for this course from backend
        const topicsProgress = await ProgressAPIService.getCourseTopics(currentCourse.id);
        console.log('📚 Topics progress:', topicsProgress);
        
        // Find the last topic with progress (highest progress that's not 100%)
        let targetTopicIndex = 0;
        let maxProgress = 0;
        
        topicsProgress.forEach(topic => {
          console.log(`Topic ${topic.topicIndex}: ${topic.topicProgress}%`);
          if (topic.topicProgress > maxProgress && topic.topicProgress < 100) {
            maxProgress = topic.topicProgress;
            targetTopicIndex = topic.topicIndex;
          }
        });
        
        // If all topics are 100%, go to the last one
        if (maxProgress === 0) {
          const completedTopics = topicsProgress.filter(t => t.topicProgress === 100);
          if (completedTopics.length > 0) {
            targetTopicIndex = Math.max(...completedTopics.map(t => t.topicIndex));
            maxProgress = 100;
          }
        }
        
        console.log(`🎯 Target topic: ${targetTopicIndex}, Progress: ${maxProgress}%`);
        
        // Navigate to the target topic if different
        if (targetTopicIndex !== selectedTopicIndex) {
          console.log('🔄 Navigating to topic:', targetTopicIndex);
          setSelectedTopicIndex(targetTopicIndex);
        }
        
        // Wait for topic to load, then implement SCORM resume from backend progress
        setTimeout(async () => {
          try {
            console.log('⏰ Setting up SCORM resume...');
            
            // Get SCORM data from localStorage for the target topic
            const scormKey = `scorm_${courseName}_${targetTopicIndex}`;
            const scormData = JSON.parse(localStorage.getItem(scormKey) || "{}");
            console.log('📝 Current SCORM data:', scormData);
            
            // Get lesson location (slide position) from SCORM data
            const lessonLocation = scormData["cmi.core.lesson_location"];
            console.log('📍 Lesson location:', lessonLocation);
            
            // If we have backend progress but no SCORM data, estimate slide location
            if (!lessonLocation && maxProgress > 0) {
              // Estimate slide based on progress percentage
              const estimatedSlide = Math.ceil((maxProgress / 100) * 10); // Assume 10 slides per topic
              scormData["cmi.core.lesson_location"] = estimatedSlide.toString();
              scormData["cmi.core.lesson_status"] = "incomplete";
              scormData["cmi.core.progress_measure"] = (maxProgress / 100).toString();
              scormData["cmi.core.score.raw"] = maxProgress.toString();
              
              localStorage.setItem(scormKey, JSON.stringify(scormData));
              console.log('💾 Updated SCORM data with estimated location:', scormData);
            }
            
            // Reload iframe to trigger SCORM resume functionality
            const iframe = document.querySelector('.video-frame');
            if (iframe) {
              console.log('🔄 Reloading iframe for SCORM resume...');
              // Force iframe reload to trigger SCORM "Resume saved state" prompt
              const currentSrc = iframe.src;
              iframe.src = currentSrc;
              
              alert(`Resuming from topic ${targetTopicIndex + 1} with ${maxProgress}% progress...`);
            } else {
              console.error('❌ Iframe not found');
              alert(`Error: Could not find course player. Please refresh the page.`);
            }
            
          } catch (scormError) {
            console.error('❌ Error setting up SCORM resume:', scormError);
            alert(`Error setting up resume. Please try again.`);
          }
        }, 1500); // Longer wait to ensure topic loads completely
        
      } else {
        console.log('❌ No course progress found');
        alert("No saved progress found. Starting from the beginning...");
        setSelectedTopicIndex(0);
      }
      
    } catch (error) {
      console.error('❌ Error loading progress from backend:', error);
      alert("Error loading progress. Starting from the beginning...");
      setSelectedTopicIndex(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={continueCourse}
      disabled={loading}
      className="fullscreen-btn"
      style={{
        marginRight: "10px",
        backgroundColor: loading ? "#ccc" : "#e49723",
        color: "white",
        border: "2px solid #d6841f",
        padding: "8px 16px",
        borderRadius: "4px",
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        minWidth: "120px",
        zIndex: 1000
      }}
    >
      {loading ? "Loading..." : "Continue Course"}
    </button>
  );
};

export default ContinueButton;
