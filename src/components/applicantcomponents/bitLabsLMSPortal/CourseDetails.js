import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./coursedetails.css";
import WorkingScormPlayer from "./WorkingScormPlayer";
import ProgressAPIService from "../../../services/ProgressAPIService.js";
import { useUserContext } from "../../common/UserProvider";
import FirstHtmlPage from "./FirstHtmlPage";
import { getAllAssignmentsByApplicant } from "./assignmentservice";


// ─── Static course data (outside component so it never re-creates) ───────────
// Course mapping to convert course names to actual course IDs
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

const COURSE_DATA = {
  "html & css": [
    { topic: "Introduction to Web App", videos: [{ title: "What is a Web Application?", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/introductiontowebapp_topic1/story.html" }] },
    { topic: "HTML for Beginners", videos: [{ title: "Basics of HTML Structure", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/htmlforbegginers_topic2/story.html" }] },
    { topic: "CSS Part 1", videos: [{ title: "Introduction to CSS Styling", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/csspart1_topic3/story.html" }] },
    { topic: "CSS Part 2", videos: [{ title: "Advanced CSS Concepts", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/csspart2_topic4/story.html" }] },
    { topic: "HTML Forms", videos: [{ title: "Creating Forms in HTML", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/HTML%20FORMS_topic5/story.html" }] },
  ],
  "python": [
    { topic: "Introduction to python", videos: [{ title: "What is a python?", url: "/python for beginners/Introduction to Python_topic1/index_lms.html" }] },
    { topic: "Python variables and data types", videos: [{ title: "Variables and Data Types", url: "/python for beginners/python variables and data types_topic2/index_lms.html" }] },
    { topic: "Python Operators", videos: [{ title: "Operators", url: "/python for beginners/Python Operators_topic3/index_lms.html" }] },
    { topic: "Python conditional statements", videos: [{ title: "Conditional Statements", url: "/python for beginners/Python conditional statements_topic4/index_lms.html" }] },
    { topic: "Python Loops", videos: [{ title: "Loops", url: "/python for beginners/Python Loops_topic5/index_lms.html" }] },
    { topic: "Python Data Structures Part 1", videos: [{ title: "Data Structures Part 1", url: "/python for beginners/Python Data Structures Part 1_topic6/index_lms.html" }] },
    { topic: "Python Data Structures Part 2", videos: [{ title: "Data Structures Part 2", url: "/python for beginners/Python Data Structures Part 2_topic7/index_lms.html" }] },
    { topic: "Python Data Structures Part 3", videos: [{ title: "Data Structures Part 3", url: "/python for beginners/Python Data Structures Part 3_topic8/index_lms.html" }] },
    { topic: "Python functions", videos: [{ title: "Functions", url: "/python for beginners/python functions_topic9/index_lms.html" }] },
    { topic: "Python modules", videos: [{ title: "Modules", url: "/python for beginners/python modules_topic10/index_lms.html" }] },
    { topic: "Python OOPS", videos: [{ title: "OOPS concepts", url: "/python for beginners/Python OOPS_topic11/index_lms.html" }] },
    { topic: "Python Constructors", videos: [{ title: "Constructors", url: "/python for beginners/Python Constructors_topic12/index_lms.html" }] },
    { topic: "Python Inheritence", videos: [{ title: "Inheritence", url: "/python for beginners/Python Inheritence_topic13/index_lms.html" }] },
  ],
  java: [
    { topic: "Java Basics", videos: [{ title: "Java Course", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/How+to+Set+Goals_web+2/story.html" }] },
  ],
};

const CourseDetails = () => {
  const { courseName } = useParams();
  const location = useLocation();
  const { user } = useUserContext();
  const currentPath = location.pathname.toLowerCase();

  const allowedRoutes = [
    '/courses/html',
    '/courses/css',
    '/course/html',
    '/course/css',
    '/assignment/first-html-page'
  ];

  const isAssignmentAllowed = allowedRoutes.some(route => currentPath.startsWith(route));
  const applicantId = user?.id;

  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [topicProgress, setTopicProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [courseProgressId, setCourseProgressId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarView, setSidebarView] = useState("topics");
  const [viewingAssignment, setViewingAssignment] = useState(false);
  const [assignmentType, setAssignmentType] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: "", message: "", subMessage: "", type: "topic" });
  const [assignmentCompletion, setAssignmentCompletion] = useState({
    html: false,
    css1: false,
    css2: false,
    forms: false
  });

  // Ref keeps the current topic index reachable inside async callbacks/effects
  const playerRef = useRef(null);
  const topicIndexRef = useRef(0);
  topicIndexRef.current = selectedTopicIndex;

  const courseContent = COURSE_DATA[courseName] || [];

  // ── 1. SCORM 1.2 API shim ─────────────────────────────────────────────────
  // Installed/refreshed whenever the course changes.
  // Articulate's scormdriver.js (loaded by index_lms.html) walks up the frame
  // chain looking for window.API.  We sit in window (parent of the iframe) so
  // it finds us first.  All SCORM state is kept per-topic in localStorage so
  // it survives navigation away and back.
  useEffect(() => {
    const storeKey = () => `scorm_${courseName}_${topicIndexRef.current}`;

    const readStore = () => { try { return JSON.parse(localStorage.getItem(storeKey()) || "{}"); } catch { return {}; } };
    const writeStore = (obj) => { localStorage.setItem(storeKey(), JSON.stringify(obj)); };

    window.API = {
      LMSInitialize: (_) => { console.log("[SCORM] Init  topic", topicIndexRef.current); return "true"; },
      LMSFinish: (_) => { console.log("[SCORM] Finish topic", topicIndexRef.current); return "true"; },
      LMSGetValue: (key) => {
        const val = readStore()[key];
        const out = val !== undefined ? String(val) : "";
        console.log("[SCORM] Get", key, "→", out);
        return out;
      },
      LMSSetValue: (key, val) => {
        console.log("[SCORM] Set", key, "=", val);
        const store = readStore();
        store[key] = val;
        writeStore(store);
        return "true";
      },
      LMSCommit: (_) => "true",
      LMSGetLastError: () => "0",
      LMSGetErrorString: (_) => "",
      LMSGetDiagnostic: (_) => "",
    };

    return () => { delete window.API; };
  }, [courseName]); // re-install only when course changes; topic index is read via ref

  // ── 2. Load saved progress from backend + restore last visited topic ───────────────────
  useEffect(() => {
    const loadProgress = async () => {
      if (!applicantId) return;
      try {
        setLoading(true);
        // Get all courses progress for this applicant
        const applicantCourses = await ProgressAPIService.getApplicantProgress(applicantId);

        // Find the current course progress
        const currentCourse = applicantCourses.find(course =>
          course.courseName.toLowerCase() === courseName.toLowerCase()
        );

        if (currentCourse) {
          setCourseProgressId(currentCourse.id);
          setOverallProgress(currentCourse.overallProgress);

          // Get topics progress for this course
          const topicsProgress = await ProgressAPIService.getCourseTopics(currentCourse.id);
          const progressMap = {};
          topicsProgress.forEach(topic => {
            progressMap[topic.topicIndex] = topic.topicProgress;
          });
          setTopicProgress(progressMap);

          // Find the last accessed topic (highest progress that's not 100%)
          const lastTopicIndex = topicsProgress.reduce((lastIdx, topic) => {
            return topic.topicProgress < 100 && topic.topicIndex > lastIdx ? topic.topicIndex : lastIdx;
          }, 0);
          // Find the first incomplete topic (progress < 100)
          const firstIncompleteTopic = topicsProgress.reduce((firstIdx, topic) => {
            return topic.topicProgress < 100 && topic.topicIndex < firstIdx ? topic.topicIndex : firstIdx;
          }, topicsProgress.length);
          // If there are incomplete topics, go to the first one; otherwise go to last completed
          const targetTopicIndex = firstIncompleteTopic !== topicsProgress.length ? firstIncompleteTopic : lastTopicIndex;
          setSelectedTopicIndex(targetTopicIndex);
        } else {
          // Initialize with zero progress if no course progress exists
          setOverallProgress(0);
          setTopicProgress({});
          setSelectedTopicIndex(0);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
        // Fallback to zero progress
        setOverallProgress(0);
        setTopicProgress({});
        setSelectedTopicIndex(0);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [courseName, applicantId]);

  // ── 3. Progress update — save to backend ────────────────────────────────────
  const handleProgressUpdate = useCallback(async (p) => {
    if (!applicantId) return;
    const idx = topicIndexRef.current;
    const currentProgress = topicProgress[idx] || 0;

    if (p <= currentProgress) return; // ✅ progress can only move forward

    try {
      // Update local state immediately for UI responsiveness
      setTopicProgress(prev => ({ ...prev, [idx]: p }));

      // Calculate new overall progress
      const newTopicProgress = { ...topicProgress, [idx]: p };
      const totalProgress = Object.values(newTopicProgress).reduce((a, b) => a + b, 0);
      const newOverallProgress = Math.round(totalProgress / courseContent.length);
      setOverallProgress(newOverallProgress);

      // Save to backend
      await ProgressAPIService.saveProgress({
        applicantId,
        courseId: getCourseId(courseName),
        courseName,
        topicIndex: idx,
        topicName: courseContent[idx]?.topic || '',
        topicProgress: p
      });

      if (p === 100) {
        handleTopicComplete(idx);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      setTopicProgress(prev => ({ ...prev, [idx]: currentProgress }));
    }
  }, [applicantId, courseName, courseContent, topicProgress]);

  // ── 1. Utility Callbacks ──────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const selectTopic = useCallback((index) => {
    setViewingAssignment(false);
    let isLocked = false;
    if (index === 1) isLocked = (topicProgress[0] || 0) < 100;
    if (index === 2) isLocked = !assignmentCompletion.html;
    if (index === 3) isLocked = !assignmentCompletion.css1;
    if (index === 4) isLocked = !assignmentCompletion.css2;
    if (topicProgress[index] > 0) isLocked = false;
    if (isLocked) return;
    setSelectedTopicIndex(index);
    if (!document.fullscreenElement) toggleFullscreen();
  }, [topicProgress, assignmentCompletion, toggleFullscreen]);

  const handleModuleComplete = useCallback((index) => {
    const nextIdx = index + 1;
    const isLastModule = nextIdx >= courseContent.length;

    if (isLastModule) {
      setPopupContent({
        title: "🏆 Congratulations!",
        message: `You have successfully completed the ${courseName} course.`,
        subMessage: "Your certificate is now ready for download.",
        type: "course"
      });
    } else {
      setPopupContent({
        title: "🎉 Great Job!",
        message: `You completed all ${courseContent[index].topic} assignments.`,
        subMessage: `${courseContent[nextIdx].topic} is now unlocked.`,
        type: "module"
      });
    }
    setShowSuccessPopup(true);

    setTimeout(() => {
      setShowSuccessPopup(false);
      if (!isLastModule) selectTopic(nextIdx);
    }, 3000);
  }, [courseContent, courseName, selectTopic]);

  const handleTopicComplete = (index) => {
    const topic = courseContent[index];
    if (!topic) return;

    setPopupContent({
      title: "🎉 Congratulations!",
      message: `You successfully completed ${topic.topic}.`,
      subMessage: "Your next assignment is now unlocked.",
      type: "topic"
    });
    setShowSuccessPopup(true);

    setTimeout(() => {
      setShowSuccessPopup(false);
      const assignments = [
        null,
        { type: 'html' },
        { type: 'styling' },
        { type: 'styling2' },
        { type: 'forms' }
      ];
      if (assignments[index]) {
        setSidebarView('assignments');
        setViewingAssignment(true);
        setAssignmentType(assignments[index].type);
      }
    }, 3000);
  };

  // ── 4. Topic selection — saves last topic to backend ────────────────────────────────


  // Sync assignment completion state from backend on mount
  // Sync assignment completion state from backend
  const syncAssignments = useCallback(async () => {
    if (!applicantId) return;
    try {
      const res = await getAllAssignmentsByApplicant(applicantId);
      const assignments = Array.isArray(res) ? res : (res ? [res] : []);
      
      const completedIds = {
        html: new Set(),
        css1: new Set(),
        css2: new Set(),
        forms: new Set()
      };
      const totals = { html: 10, css1: 6, css2: 8, forms: 5 };

      assignments.forEach(item => {
        let id = item.assignmentNumber ?? item.assignment_number ?? item.assignmentId ?? item.assignment_id ?? item.id;
        const numId = Number(id);
        const status = (item.status || item.assignmentStatus || item.assignment_status || "").toUpperCase();
        const hasCode = !!(item.assignmentCode || item.assignment_code || item.code || item.submittedCode);
        const isDone = status === 'COMPLETED' || status === 'SUBMITTED' || hasCode;

        if (isDone && !isNaN(numId)) {
          if (numId >= 1 && numId <= 10) completedIds.html.add(numId);
          if (numId >= 101 && numId <= 106) completedIds.css1.add(numId);
          if (numId >= 201 && numId <= 208) completedIds.css2.add(numId);
          if (numId >= 301 && numId <= 305) completedIds.forms.add(numId);
        }
      });

      setAssignmentCompletion({
        html: completedIds.html.size >= totals.html,
        css1: completedIds.css1.size >= totals.css1,
        css2: completedIds.css2.size >= totals.css2,
        forms: completedIds.forms.size >= totals.forms
      });
    } catch (error) {
      console.error('[CourseDetails] Sync Error:', error);
    }
  }, [applicantId]);

  useEffect(() => {
    syncAssignments();
  }, [syncAssignments]);

  useEffect(() => {
    const handleAssignmentDone = (e) => {
      syncAssignments();
      const { assignmentId } = e.detail;
      const id = Number(assignmentId);
      
      const groups = [
        { id: 10, index: 1 },
        { id: 106, index: 2 },
        { id: 208, index: 3 },
        { id: 305, index: 4 }
      ];

      const group = groups.find(g => g.id === id);
      if (group) {
        handleModuleComplete(group.index);
      }
    };

    window.addEventListener('assignmentCompleted', handleAssignmentDone);
    return () => window.removeEventListener('assignmentCompleted', handleAssignmentDone);
  }, [syncAssignments, handleModuleComplete]);

  // ── 4. Topic selection ────────────────────────────────


  const handleAssignmentClick = (type) => {
    if (!isAssignmentAllowed) return;
    setAssignmentType(type);
    setViewingAssignment(true);
  };

  const handleCloseAssignment = () => {
    setViewingAssignment(false);
  };


  // ── 5. Overall progress from backend ───────────────────────────────────────────
  // overallProgress is used directly from state

  const selectedVideo = courseContent[selectedTopicIndex]?.videos?.[0]?.url || "";

  // Listen for fullscreen change events (e.g. user pressing Esc)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);


  const SuccessPopup = () => (
    <div className={`success-popup-overlay ${showSuccessPopup ? 'active' : ''}`}>
      <div className="success-popup-content">
        <div className="success-icon-wrapper">
          <div className="success-icon">✔</div>
        </div>
        <h2>{popupContent.title}</h2>
        <p className="success-message">{popupContent.message}</p>
        <p className="success-submessage">{popupContent.subMessage}</p>
        <div className="success-loader"></div>
      </div>
    </div>
  );

  return (
    <div className="border-style">
      <div className="blur-border-style"></div>
      <div className="dashboard__content">
        <div className="row extraSpace">
          <div className="col-lg-12 col-md-12">
            <div className="course-container">
              <div className="course-layout">
                <div className="course-sidebar">
                  <div className="cd-sidebar-header">
                    <h3 className="cd-title">{courseName}</h3>
                    <div className="cd-progress-labels">
                      <span>Overall Progress</span>

                    </div>
                    <div className="cd-progress-track">
                      <div className="cd-progress-fill" style={{ width: `${overallProgress}%` }} />
                    </div>
                  </div>




                  <div className="sidebar-scrollable">
                    <div className="topics-list">
                      {courseContent.map((t, index) => {
                        const progress = topicProgress[index] || 0;

                        let isTopicLocked = false;
                        if (index === 1) isTopicLocked = (topicProgress[0] || 0) < 100;
                        if (index === 2) isTopicLocked = !assignmentCompletion.html;
                        if (index === 3) isTopicLocked = !assignmentCompletion.css1;
                        if (index === 4) isTopicLocked = !assignmentCompletion.css2;

                        // IMPORTANT: If a topic already has progress, it should NEVER be locked
                        if (progress > 0) isTopicLocked = false;

                        const isActive = !viewingAssignment && selectedTopicIndex === index;

                        // Integrated Assignment Data
                        const assignments = [
                          null, // Topic 0
                          { title: "First HTML Page", type: 'html', completionKey: 'html' }, // Topic 1
                          { title: "CSS Part 1", type: 'styling', completionKey: 'css1' }, // Topic 2
                          { title: "CSS Part 2", type: 'styling2', completionKey: 'css2' }, // Topic 3
                          { title: "Registration Forms", type: 'forms', completionKey: 'forms' }, // Topic 4
                        ];
                        const topicAssignment = assignments[index];
                        const isAssignmentCompleted = topicAssignment ? assignmentCompletion[topicAssignment.completionKey] : false;
                        const isAssignmentUnlocked = (progress === 100 || isAssignmentCompleted) && !isTopicLocked;

                        return (
                          <div
                            key={index}
                            className={`topic-block ${isTopicLocked ? "topic-locked" : ""} ${isActive ? "topic-active" : ""}`}
                            onClick={() => !isTopicLocked && selectTopic(index)}
                          >
                            <div className="topic-info">
                              <strong>
                                {isTopicLocked ? "🔒 " : (progress === 100 ? <span style={{ color: "#D26B15" }}>✔ </span> : "▶ ")}
                                {t.topic}
                              </strong>
                            </div>
                            {!isTopicLocked && (
                              <>
                                <div style={{ height: "6px", background: "#eee", borderRadius: "10px", overflow: "hidden", margin: "6px 0" }}>
                                  <div style={{ width: `${progress}%`, height: "100%", background: "#e49723ff", transition: "width 0.4s ease" }} />
                                </div>

                              </>
                            )}
                            {t.videos.map((video, i) => (
                              <p
                                key={i}
                                className={`video-link ${isActive ? "active" : ""} ${isTopicLocked ? "disabled" : ""}`}
                              >
                                {video.title}
                              </p>
                            ))}

                            {/* Integrated Assignment Section */}
                            {topicAssignment && isAssignmentAllowed && (
                              <div className="topic-assignment-section" onClick={(e) => e.stopPropagation()}>
                                <div
                                  className={`assignment-action-card ${!isAssignmentUnlocked ? 'locked' : ''} ${isAssignmentCompleted ? 'completed' : ''} ${viewingAssignment && assignmentType === topicAssignment.type ? 'active' : ''}`}
                                  onClick={() => (isAssignmentUnlocked || isAssignmentCompleted) && handleAssignmentClick(topicAssignment.type)}
                                >
                                  <div className="assignment-icon">
                                    {isAssignmentCompleted ? "✔" : "📝"}
                                  </div>
                                  <div className="assignment-info">
                                    <h4>{topicAssignment.title}</h4>
                                    <span className={`assignment-status ${isAssignmentCompleted ? 'completed' : ''}`}>
                                      {isAssignmentCompleted ? "Completed" : (!isAssignmentUnlocked ? "Locked (Complete topic first)" : "Try Assignment")}
                                    </span>
                                  </div>
                                  {isAssignmentUnlocked && !isAssignmentCompleted && (
                                    <div className="assignment-arrow">→</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="course-player" ref={playerRef}>
                  {viewingAssignment && isAssignmentAllowed ? (
                    <div className="assignment-inline-view">
                      <FirstHtmlPage
                        type={assignmentType}
                        onClose={handleCloseAssignment}
                        applicantId={applicantId}
                      />
                    </div>
                  ) : (
                    <>
                      {!isFullscreen && (
                        <div className="immersive-overlay" onClick={toggleFullscreen}>
                          <div className="overlay-msg">
                            <span>⛶ Click anywhere to start Fullscreen Learning</span>
                          </div>
                        </div>
                      )}
                      <WorkingScormPlayer
                        courseId={`${courseName}_${selectedTopicIndex}`}
                        onProgressUpdate={handleProgressUpdate}
                      />
                      <iframe
                        key={`${courseName}_${selectedTopicIndex}`}
                        src={selectedVideo}
                        className="video-frame"
                        title="Course Player"
                        allowFullScreen
                      />
                      <button
                        onClick={toggleFullscreen}
                        className="fullscreen-btn"
                      >
                        {isFullscreen ? "✕ Exit Fullscreen" : "⛶ Fullscreen"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SuccessPopup />
    </div>
  );
};

export default CourseDetails;