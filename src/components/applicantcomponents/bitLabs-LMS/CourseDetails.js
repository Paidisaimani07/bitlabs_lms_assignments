import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./coursedetails.css";
import WorkingScormPlayer from "./WorkingScormPlayer";
import ProgressAPIService from "./ProgressAPIService";
import { useUserContext } from "../../common/UserProvider";
import FirstHtmlPage from "./FirstHtmlPage";
import AssignmentEditor from "./AssignmentEditor";
import { getAllAssignmentsByApplicant } from "./assignmentservice";


// ─── Static course data (outside component so it never re-creates) ───────────
// Course mapping to convert course names to actual course IDs
const getCourseId = (courseName) => {
  const courseMap = {
    "html & css": 1,
    "python": 2,
    "interview preparedness": 7,
    "sql": 4
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
    { topic: "Introduction to python", videos: [{ title: "What is a python?", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Introduction+to+Python_topic1/story.html" }] },
    { topic: "Python variables and data types", videos: [{ title: "Variables and Data Types", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Python+Variables+and+Data+Types_topic2/story.html" }] },
    { topic: "Python Operators", videos: [{ title: "Operators", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Python+Operators_topic3/story.html" }] },
    { topic: "Python conditional statements", videos: [{ title: "Conditional Statements", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Python+Conditional+Statements_topic4/story.html" }] },
    { topic: "Python Loops", videos: [{ title: "Loops", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Python+Loop+Control+Statements_topic5/story.html" }] },
    { topic: "Python Data Structures Part 1", videos: [{ title: "Data Structures Part 1", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Python+Data+Structures++Part+1_topic6/story.html" }] },
    { topic: "Python Data Structures Part 2", videos: [{ title: "Data Structures Part 2", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Python+Data+Structures++Part+2_topic7/story.html" }] },
    { topic: "Python Data Structures Part 3", videos: [{ title: "Data Structures Part 3", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Python+Data+Structures++Part+3_(Strings)_topic8/story.html" }] },
    { topic: "Python functions", videos: [{ title: "Functions", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Python+Functions_topic9/story.html" }] },
    { topic: "Python modules", videos: [{ title: "Modules", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Python+Modules_topic10/story.html" }] },
    { topic: "Python OOPS", videos: [{ title: "OOPS concepts", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Object+Oriented+Programming_topic11/story.html" }] },
    { topic: "Python Constructors", videos: [{ title: "Constructors", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Python+Constructors_topic12/story.html" }] },
    { topic: "Python Inheritance", videos: [{ title: "Inheritance", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Python+Inheritance_topic13/story.html" }] },
  ],
  java: [
    { topic: "Java Basics", videos: [{ title: "Java Course", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/How+to+Set+Goals_web+2/story.html" }] },
  ],
  "interview preparedness": [
    // ── Group 0: Understanding Yourself (3 subtopics) ──────────────────────
    { topic: "Understanding Yourself – Self Realization", groupName: "Understanding Yourself", groupIndex: 0, videos: [{ title: "Understanding Yourself – Self Realization", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Softskills+Foundation+-+Understanding+Yourself++Self+Realization/story.html" }] },
    { topic: "Confidence Building & Self-Motivation", groupName: "Understanding Yourself", groupIndex: 0, videos: [{ title: "Confidence Building & Self-Motivation", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Softskills+Foundation+-+Confidence+building+and+self-motivation/story.html" }] },
    { topic: "Overcoming Shyness, Fear & Anxiety", groupName: "Understanding Yourself", groupIndex: 0, videos: [{ title: "Overcoming Shyness, Fear & Anxiety", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Shyness%2C+Fear%2C+and+Anxiety+-+Ways+of+Control/story.html" }] },
    // ── Group 1: Introduction to Communication (4 subtopics) ───────────────
    { topic: "Components of Communication", groupName: "Introduction to Communication", groupIndex: 1, videos: [{ title: "Components of Communication", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Softskills+Foundation+-+Components+of+Communication/story.html" }] },
    { topic: "Communication Methods", groupName: "Introduction to Communication", groupIndex: 1, videos: [{ title: "Communication Methods", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Softskills+Foundation+-+Communication+Methods/story.html" }] },
    { topic: "Conveying Message Effectively – Part 1", groupName: "Introduction to Communication", groupIndex: 1, videos: [{ title: "Conveying Message Effectively – Part 1", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Conveying+Message+Effectively+-+Part+1/story.html" }] },
    { topic: "Conveying Message Effectively – Part 2", groupName: "Introduction to Communication", groupIndex: 1, videos: [{ title: "Conveying Message Effectively – Part 2", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Softskills+Foundation+-+Conveying+Message+Effectively+-+Part+2/story.html" }] },
    // ── Group 2: Self Introduction (3 subtopics) ──────────────────────────
    { topic: "Creating Self-Introduction", groupName: "Self Introduction", groupIndex: 2, videos: [{ title: "Creating Self-Introduction", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Softskills+Foundation+-+Creating+Self-introduction/story.html" }] },
    { topic: "Tips for Effective Introduction", groupName: "Self Introduction", groupIndex: 2, videos: [{ title: "Tips for Effective Introduction", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Softskills+Foundation+-+Tips+for+Effective+Introduction+in+Different+Scenarios/story.html" }] },
    { topic: "Creating Your First Impression", groupName: "Self Introduction", groupIndex: 2, videos: [{ title: "Creating Your First Impression", url: "https://bitlabs-app.s3.ap-south-1.amazonaws.com/Staging/ScromPackages/Softskills+Foundation+-+Creating+your+First+Impression/story.html" }] },
  ],
  sql: [
    { topic: "Introduction to Structured Query Language(SQL)", videos: [{ title: "Introduction to Structured Query Language(SQL)", url: "/sql/Introduction to Structured Query Language(SQL)/story.html" }] },
    { topic: "Data Definition Language (DDL)", videos: [{ title: "Data Definition Language (DDL)", url: "/sql/Data Definition Language (DDL)/story.html" }] },
    { topic: "Data Manipulation Language (DML)", videos: [{ title: "Data Manipulation Language (DML)", url: "/sql/Data Manipulation Language (DML)/story.html" }] },
    { topic: "Constraints", videos: [{ title: "Constraints", url: "/sql/Constraints_/story.html" }] },
    { topic: "Normalization", videos: [{ title: "Normalization", url: "/sql/Normalization/story.html" }] },
    { topic: "SQL Clauses", videos: [{ title: "SQL Clauses", url: "/sql/SQL Clauses/story.html" }] },
    { topic: "SQL Functions", videos: [{ title: "SQL Functions", url: "/sql/SQL Functions/story.html" }] },
    { topic: "SQL Joins and Views", videos: [{ title: "SQL Joins and Views", url: "/sql/SQL Joins and Views/story.html" }] },
    { topic: "SQL Operators", videos: [{ title: "SQL Operators", url: "/sql/SQL Operators/story.html" }] },
    { topic: "SQL Sub-queries", videos: [{ title: "SQL Sub-queries", url: "/sql/SQL Sub-queries/story.html" }] },
    { topic: "TCL and DCL Commands", videos: [{ title: "TCL and DCL Commands", url: "/sql/TCL and DCL Commands_/story.html" }] },
  ],
};

const CourseDetails = () => {
  const { courseName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUserContext();

  // Provide default value to prevent toLowerCase error
  const safeCourseName = courseName || '';

  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [topicProgress, setTopicProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [courseProgressId, setCourseProgressId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarView, setSidebarView] = useState("topics");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [viewingAssignment, setViewingAssignment] = useState(false);
  const [assignmentType, setAssignmentType] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: "", message: "", subMessage: "", type: "topic" });
  const [assignmentCompletion, setAssignmentCompletion] = useState({
    html: false,
    css1: false,
    css2: false,
    forms: false,
    python1: false, python2: false, python3: false, python4: false, python5: false, python6: false, python7: false, python8: false, python9: false, python10: false, python11: false,
    sql1: false, sql2: false, sql3: false, sql4: false, sql5: false, sql6: false, sql7: false, sql8: false, sql9: false
  });

  const currentPath = location.pathname.toLowerCase();

  const allowedRoutes = [
    '/courses/html',
    '/courses/css',
    '/course/html',
    '/course/css',
    '/course/python',
    '/courses/python',
    '/course/sql',
    '/courses/sql',
    '/assignment/first-html-page'
  ];

  const isAssignmentAllowed = allowedRoutes.some(route => currentPath.startsWith(route));
  const applicantId = user?.id;

  // ── Interview Preparedness flag ──────────────────────────────────────────
  const isInterviewPrep = safeCourseName.toLowerCase() === "interview preparedness";

  // Refs for state to avoid stale closures in setTimeout callbacks
  const topicProgressRef = useRef({});
  const assignmentCompletionRef = useRef({
    html: false, css1: false, css2: false, forms: false,
    python1: false, python2: false, python3: false, python4: false, python5: false, python6: false, python7: false, python8: false, python9: false, python10: false, python11: false,
    sql1: false, sql2: false, sql3: false, sql4: false, sql5: false, sql6: false, sql7: false, sql8: false, sql9: false
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
          course.courseName?.toLowerCase() === safeCourseName.toLowerCase()
        );

        if (currentCourse) {
          setCourseProgressId(currentCourse.id);

          // Get topics progress for this course
          const topicsProgress = await ProgressAPIService.getCourseTopics(currentCourse.id);
          const progressMap = {};
          topicsProgress.forEach(topic => {
            progressMap[topic.topicIndex] = topic.topicProgress;
          });
          topicProgressRef.current = progressMap;
          setTopicProgress(progressMap);

          if (safeCourseName.toLowerCase() === "interview preparedness") {
            // For interview preparedness, recalculate overall from topic data
            const totalProgress = Object.values(progressMap).reduce((a, b) => a + b, 0);
            const calculatedProgress = courseContent.length > 0 ? Math.round(totalProgress / courseContent.length) : 0;
            setOverallProgress(calculatedProgress);
          } else {
            setOverallProgress(currentCourse.overallProgress);
          }

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
          topicProgressRef.current = {};
          setTopicProgress({});
          setSelectedTopicIndex(0);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
        // Fallback to zero progress
        setOverallProgress(0);
        topicProgressRef.current = {};
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
    const numericP = Number(p);
    const idx = topicIndexRef.current;
    const currentProgress = topicProgressRef.current[idx] || 0;

    if (numericP <= currentProgress) return; // ✅ progress can only move forward

    try {
      // Update local state immediately for UI responsiveness
      const newTopicProgress = { ...topicProgressRef.current, [idx]: numericP };
      topicProgressRef.current = newTopicProgress;
      setTopicProgress(newTopicProgress);

      // Calculate new overall progress
      const totalProgress = Object.values(newTopicProgress).reduce((a, b) => a + b, 0);
      const newOverallProgress = Math.round(totalProgress / courseContent.length);
      setOverallProgress(newOverallProgress);

      // Save to backend — include overallProgress so the backend stores it
      await ProgressAPIService.saveProgress({
        applicantId,
        courseId: getCourseId(courseName),
        courseName,
        topicIndex: idx,
        topicName: courseContent[idx]?.topic || '',
        topicProgress: numericP,
        overallProgress: newOverallProgress
      });

      if (numericP === 100) {
        handleTopicComplete(idx);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      const rollbackProgress = { ...topicProgress, [idx]: currentProgress };
      topicProgressRef.current = rollbackProgress;
      setTopicProgress(rollbackProgress);
    }
  }, [applicantId, courseName, courseContent, topicProgress]);

  // ── 1. Utility Callbacks ──────────────────────────────────────────────────
  const getTopicLockedStatus = useCallback((index) => {
    if (index === 0) return false;
    const progress = topicProgressRef.current[index] || 0;
    if (progress > 0) return false; // Already started topics are never locked

    // Default rule: Previous topic must be 100%
    const prevProgress = topicProgressRef.current[index - 1] || 0;
    if (prevProgress < 100) return true;

    // Interview Preparedness has no assignment gates — unlock on topic progress only
    if (safeCourseName.toLowerCase() === "interview preparedness") return false;

    if (safeCourseName.toLowerCase() === "python") {
      const prevAssignmentMap = {
        2: 'python1', 3: 'python2', 4: 'python3', 6: 'python4', 7: 'python5',
        8: 'python6', 9: 'python7', 10: 'python8', 11: 'python9', 12: 'python10', 13: 'python11'
      };
      const prevAssignKey = prevAssignmentMap[index];
      if (prevAssignKey && !assignmentCompletionRef.current[prevAssignKey]) return true;
    } else if (safeCourseName.toLowerCase() === "sql") {
      const prevAssignmentMap = {
        2: 'sql1', 3: 'sql2', 4: 'sql3', 5: 'sql4', 6: 'sql5',
        7: 'sql6', 8: 'sql7', 9: 'sql8', 10: 'sql9'
      };
      const prevAssignKey = prevAssignmentMap[index];
      if (prevAssignKey && !assignmentCompletionRef.current[prevAssignKey]) return true;
    } else {
      // HTML/CSS logic
      if (index === 2 && !assignmentCompletionRef.current.html) return true;
      if (index === 3 && !assignmentCompletionRef.current.css1) return true;
      if (index === 4 && !assignmentCompletionRef.current.css2) return true;
    }
    return false;
  }, [safeCourseName]);

  const selectTopic = useCallback((index) => {
    setViewingAssignment(false);
    if (getTopicLockedStatus(index)) return;

    setSelectedTopicIndex(index);
    // Note: toggleFullscreen is not defined in this scope yet if moved up, 
    // but here it is defined later in the component.
  }, [getTopicLockedStatus]);

  // Function to toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!playerRef.current) return;
    const fsEl = document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;
    if (!fsEl) {
      const reqFS = playerRef.current.requestFullscreen ||
        playerRef.current.webkitRequestFullscreen ||
        playerRef.current.mozRequestFullScreen ||
        playerRef.current.msRequestFullscreen;
      if (reqFS) {
        reqFS.call(playerRef.current).catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
    } else {
      const exitFS = document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen;
      if (exitFS) {
        exitFS.call(document);
      }
    }
  }, []);

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

      // Interview Preparedness: no assignments — always advance to next topic
      if (safeCourseName.toLowerCase() === "interview preparedness") {
        const nextIdx = index + 1;
        if (nextIdx < courseContent.length) selectTopic(nextIdx);
        return;
      }

      let assignments = [];
      if (safeCourseName.toLowerCase() === "python") {
        assignments = [
          null,
          { type: 'python1' }, { type: 'python2' }, { type: 'python3' }, null,
          { type: 'python4' }, { type: 'python5' }, { type: 'python6' },
          { type: 'python7' }, { type: 'python8' }, { type: 'python9' },
          { type: 'python10' }, { type: 'python11' }
        ];
      } else {
        assignments = [
          null,
          { type: 'html' },
          { type: 'styling' },
          { type: 'styling2' },
          { type: 'forms' }
        ];
      }
      if (assignments[index]) {
        setSidebarView('assignments');
        setViewingAssignment(true);
        setAssignmentType(assignments[index].type);
      } else {
        // No assignment for this topic, move to next if available
        const nextIdx = index + 1;
        if (nextIdx < courseContent.length) {
          selectTopic(nextIdx);
        }
      }
    }, 3000);
  };

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
        forms: new Set(),
        python: new Set(),
        sql: new Set()
      };
      const totals = { html: 10, css1: 6, css2: 8, forms: 5, python: 11 };

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
          if (numId >= 401 && numId <= 411) completedIds.python.add(numId);
          if (numId >= 5011 && numId <= 5094) completedIds.sql.add(numId);
        }
      });

      const newCompletion = {
        html: completedIds.html.size >= totals.html || completedIds.html.has(10),
        css1: completedIds.css1.size >= totals.css1 || completedIds.css1.has(106),
        css2: completedIds.css2.size >= totals.css2 || completedIds.css2.has(208),
        forms: completedIds.forms.size >= totals.forms || completedIds.forms.has(305),
        python1: completedIds.python.has(401),
        python2: completedIds.python.has(402),
        python3: completedIds.python.has(403),
        python4: completedIds.python.has(404),
        python5: completedIds.python.has(405),
        python6: completedIds.python.has(406),
        python7: completedIds.python.has(407),
        python8: completedIds.python.has(408),
        python9: completedIds.python.has(409),
        python10: completedIds.python.has(410),
        python11: completedIds.python.has(411),
        sql1: completedIds.sql.has(5015),
        sql2: completedIds.sql.has(5025),
        sql3: completedIds.sql.has(5035),
        sql4: completedIds.sql.has(5046),
        sql5: completedIds.sql.has(5054),
        sql6: completedIds.sql.has(5065),
        sql7: completedIds.sql.has(5074),
        sql8: completedIds.sql.has(5084),
        sql9: completedIds.sql.has(5094)
      };
      assignmentCompletionRef.current = newCompletion;
      setAssignmentCompletion(newCompletion);
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
        const htmlCssKeys = { 10: 'html', 106: 'css1', 208: 'css2', 305: 'forms' };
        const compKey = htmlCssKeys[id];
        if (compKey) {
          setAssignmentCompletion(prev => {
            const next = { ...prev, [compKey]: true };
            assignmentCompletionRef.current = next;
            return next;
          });
        }
        handleModuleComplete(group.index);
      }

      // Handle Python individual assignment completion logic
      if (id >= 401 && id <= 411) {
        // Immediately update local state for better responsiveness
        const completionKey = `python${id - 400}`;
        setAssignmentCompletion(prev => {
          const next = { ...prev, [completionKey]: true };
          assignmentCompletionRef.current = next;
          return next;
        });

        syncAssignments().then(() => {
          // Auto-advance logic for Python topics
          const pythonNextTopicMap = {
            401: 2, // Convert Distance (Topic 1) -> Operators (Topic 2)
            402: 3, // Total Marks (Topic 2) -> Conditionals (Topic 3)
            403: 4, // Interest (Topic 3) -> Loops (Topic 4)
            404: 6, // Tuple (Topic 5) -> DS Part 2 (Topic 6)
            405: 7, // Remove Dups (Topic 6) -> DS Part 3 (Topic 7)
            406: 8, // Capitalize (Topic 7) -> Functions (Topic 8)
            407: 9, // Cond Capitalize (Topic 8) -> Modules (Topic 9)
            408: 10, // Hypotenuse (Topic 9) -> OOPS (Topic 10)
            409: 11, // Roster (Topic 10) -> Constructors (Topic 11)
            410: 12, // Animals (Topic 11) -> Inheritance (Topic 12)
            411: 13, // Shape (Topic 12) -> Inheritance (Topic 13)
          };

          const nextTopicIdx = pythonNextTopicMap[id];
          if (nextTopicIdx !== undefined) {
            // Small delay to ensure React has processed the state update for the lock
            setTimeout(() => selectTopic(nextTopicIdx), 400);
          }
        });
      }

      // Handle SQL individual assignment completion logic
      if (id >= 5011 && id <= 5094) {
        let completionKey = null;
        if (id === 5015) completionKey = 'sql1';
        else if (id === 5025) completionKey = 'sql2';
        else if (id === 5035) completionKey = 'sql3';
        else if (id === 5046) completionKey = 'sql4';
        else if (id === 5054) completionKey = 'sql5';
        else if (id === 5065) completionKey = 'sql6';
        else if (id === 5074) completionKey = 'sql7';
        else if (id === 5084) completionKey = 'sql8';
        else if (id === 5094) completionKey = 'sql9';

        if (completionKey) {
          setAssignmentCompletion(prev => {
            const next = { ...prev, [completionKey]: true };
            assignmentCompletionRef.current = next;
            return next;
          });

          syncAssignments().then(() => {
            const sqlNextTopicMap = {
              'sql1': 2,
              'sql2': 3,
              'sql3': 4,
              'sql4': 5,
              'sql5': 6,
              'sql6': 7,
              'sql7': 8,
              'sql8': 9,
              'sql9': 10
            };
            const nextTopicIdx = sqlNextTopicMap[completionKey];
            if (nextTopicIdx !== undefined) {
              setTimeout(() => selectTopic(nextTopicIdx), 400);
            }
          });
        }
      }
    };

    window.addEventListener('assignmentCompleted', handleAssignmentDone);
    return () => window.removeEventListener('assignmentCompleted', handleAssignmentDone);
  }, [syncAssignments, handleModuleComplete, selectTopic]);

  const handleAssignmentClick = (type, index) => {
    if (!isAssignmentAllowed) return;
    setAssignmentType(type);
    setViewingAssignment(true);
    if (index !== undefined) {
      setSelectedTopicIndex(index);
    }
  };

  const handleAssignmentNavigate = (newAssignmentId) => {
    const id = Number(newAssignmentId);
    if (safeCourseName.toLowerCase() === "python") {
      const pythonTopicMap = {
        401: 1, 402: 2, 403: 3, 404: 5, 405: 6, 406: 7, 407: 8, 408: 9, 409: 10, 410: 11, 411: 12
      };
      const topicIdx = pythonTopicMap[id];
      if (topicIdx !== undefined) {
        setSelectedTopicIndex(topicIdx);
      }
    }
  };

  const handleCloseAssignment = (goToPrevTopic = false) => {
    setViewingAssignment(false);
    if (goToPrevTopic && selectedTopicIndex > 0) {
      selectTopic(selectedTopicIndex - 1);
    }
  };

  const handleNextTopic = () => {
    const nextIdx = selectedTopicIndex + 1;

    if (nextIdx < courseContent.length) {
      selectTopic(nextIdx);
    } else {
      setViewingAssignment(false);
    }
  };

  const selectedVideo = courseContent[selectedTopicIndex]?.videos?.[0]?.url || "";

  // Listen for fullscreen change events (e.g. user pressing Esc)
  useEffect(() => {
    const handleFsChange = () => {
      const fsEl = document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(!!fsEl);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    document.addEventListener("mozfullscreenchange", handleFsChange);
    document.addEventListener("MSFullscreenChange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      document.removeEventListener("mozfullscreenchange", handleFsChange);
      document.removeEventListener("MSFullscreenChange", handleFsChange);
    };
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

  // Guard clause for undefined courseName (must be after all hooks)
  if (!courseName) {
    return <div>Course not found</div>;
  }

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

                      {/* ── Interview Preparedness: grouped collapsible sidebar ── */}
                      {isInterviewPrep && (() => {
                        const groups = [
                          { name: "Understanding Yourself" },
                          { name: "Introduction to Communication" },
                          { name: "Self Introduction" },
                        ];
                        return groups.map((group, gIdx) => {
                          const subtopics = courseContent
                            .map((t, i) => ({ ...t, flatIndex: i }))
                            .filter(t => t.groupIndex === gIdx);
                          const isGroupCollapsed = collapsedGroups[gIdx];
                          const groupDone = subtopics.every(t => (topicProgress[t.flatIndex] || 0) === 100);
                          const groupStarted = subtopics.some(t => (topicProgress[t.flatIndex] || 0) > 0);
                          return (
                            <div key={gIdx} className="ip-group-block">
                              <div
                                className={`ip-group-header ${groupDone ? 'group-done' : groupStarted ? 'group-started' : ''}`}
                                onClick={() => setCollapsedGroups(prev => ({ ...prev, [gIdx]: !prev[gIdx] }))}
                              >
                                <span className="ip-group-title">{group.name}</span>
                                <span className="ip-group-chevron">{isGroupCollapsed ? '▶' : '▼'}</span>
                              </div>
                              {!isGroupCollapsed && subtopics.map((t) => {
                                const progress = topicProgress[t.flatIndex] || 0;
                                const isLocked = getTopicLockedStatus(t.flatIndex);
                                const isActive = !viewingAssignment && selectedTopicIndex === t.flatIndex;
                                return (
                                  <div
                                    key={t.flatIndex}
                                    className={`ip-subtopic-block ${isLocked ? 'topic-locked' : ''} ${isActive ? 'topic-active' : ''}`}
                                    onClick={() => !isLocked && selectTopic(t.flatIndex)}
                                  >
                                    <div className="topic-info">
                                      <strong>
                                        {isLocked ? '🔒 ' : ''}
                                        {t.topic}
                                      </strong>
                                    </div>
                                    {!isLocked && (
                                      <div style={{ height: '6px', background: '#eee', borderRadius: '10px', overflow: 'hidden', margin: '4px 0 2px 0' }}>
                                        <div style={{ width: `${progress}%`, height: '100%', background: '#e49723ff', transition: 'width 0.4s ease' }} />
                                      </div>
                                    )}
                                    {t.videos.map((video, vi) => (
                                      <p key={vi} className={`video-link ${isActive ? 'active' : ''} ${isLocked ? 'disabled' : ''}`}>
                                        {video.title}
                                      </p>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        });
                      })()}

                      {/* ── Existing courses: flat sidebar (unchanged) ── */}
                      {!isInterviewPrep && courseContent.map((t, index) => {
                        const progress = topicProgress[index] || 0;
                        const isTopicLocked = getTopicLockedStatus(index);
                        const isActive = !viewingAssignment && selectedTopicIndex === index;

                        let assignments = [];
                        if (safeCourseName.toLowerCase() === "python") {
                          assignments = [
                            null, // Topic 0
                            { title: "Convert Distance", type: 'python1', completionKey: 'python1' },
                            { title: "Total & Average Marks", type: 'python2', completionKey: 'python2' },
                            { title: "Calculate Interest", type: 'python3', completionKey: 'python3' },
                            null, // Topic 4
                            { title: "Tuple", type: 'python4', completionKey: 'python4' },
                            { title: "Remove Dups", type: 'python5', completionKey: 'python5' },
                            { title: "Capitalize", type: 'python6', completionKey: 'python6' },
                            { title: "Conditional Capitalize", type: 'python7', completionKey: 'python7' },
                            { title: "Hypotenuse", type: 'python8', completionKey: 'python8' },
                            { title: "Student Roster", type: 'python9', completionKey: 'python9' },
                            { title: "Animal Counts", type: 'python10', completionKey: 'python10' },
                            { title: "Shape", type: 'python11', completionKey: 'python11' },
                          ];
                        } else if (safeCourseName.toLowerCase() === "sql") {
                          assignments = [
                            null, // Topic 0
                            { title: "Employee Table", type: 'employee_table', completionKey: 'sql1' },
                            { title: "Employee Data", type: 'employee_data', completionKey: 'sql2' },
                            { title: "Employee & Sales", type: 'employee_sales', completionKey: 'sql3' },
                            { title: "Customer Sales", type: 'customer_sales', completionKey: 'sql4' },
                            { title: "Student", type: 'student', completionKey: 'sql5' },
                            { title: "Customer Table", type: 'customer_table', completionKey: 'sql6' },
                            { title: "Sales, Customers & Orders", type: 'sales_customers_orders', completionKey: 'sql7' },
                            { title: "Customer Sub-queries", type: 'customer_sub_queries', completionKey: 'sql8' },
                            { title: "Banks", type: 'banks', completionKey: 'sql9' },
                            null, // Topic 10
                          ];
                        } else {
                          assignments = [
                            null, // Topic 0
                            { title: "First HTML Page", type: 'html', completionKey: 'html' },
                            { title: "CSS Part 1", type: 'styling', completionKey: 'css1' },
                            { title: "CSS Part 2", type: 'styling2', completionKey: 'css2' },
                            { title: "Registration Forms", type: 'forms', completionKey: 'forms' },
                          ];
                        }

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
                              <div style={{ height: "6px", background: "#eee", borderRadius: "10px", overflow: "hidden", margin: "6px 0" }}>
                                <div style={{ width: `${progress}%`, height: "100%", background: "#e49723ff", transition: "width 0.4s ease" }} />
                              </div>
                            )}
                            {t.videos.map((video, i) => (
                              <p
                                key={i}
                                className={`video-link ${isActive ? "active" : ""} ${isTopicLocked ? "disabled" : ""}`}
                              >
                                {video.title}
                              </p>
                            ))}

                            {topicAssignment && isAssignmentAllowed && (
                              safeCourseName.toLowerCase() !== "python" ||
                              true // Show all Python assignments in sidebar for clarity
                            ) && (
                                <div className="topic-assignment-section" onClick={(e) => e.stopPropagation()}>
                                  <div
                                    className={`assignment-action-card ${!isAssignmentUnlocked ? 'locked' : ''} ${isAssignmentCompleted ? 'completed' : ''} ${viewingAssignment && assignmentType === topicAssignment.type ? 'active' : ''}`}
                                    onClick={() => (isAssignmentUnlocked || isAssignmentCompleted) && handleAssignmentClick(topicAssignment.type, index)}
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

                <div
                  className="course-player"
                  ref={playerRef}
                  style={isFullscreen ? { display: "flex", flexDirection: "column", width: "100vw", height: "100vh", background: "#000", borderRadius: 0, padding: 0, margin: 0 } : {}}
                >
                  {!isFullscreen && (
                    <p
                      onClick={() => navigate("/applicant-lmscourses-list")}
                      style={{
                        color: "#f97316",
                        cursor: "pointer",
                        fontWeight: "600",
                        marginBottom: "12px",
                        fontSize: "16px",
                        transition: "color 0.2s ease, text-decoration 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = "#ea580c";
                        e.target.style.textDecoration = "underline";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = "#f97316";
                        e.target.style.textDecoration = "none";
                      }}
                    >
                      ← Back
                    </p>
                  )}
                  {viewingAssignment && isAssignmentAllowed ? (
                    <div className="assignment-inline-view">
                      <AssignmentEditor
                        type={assignmentType}
                        onClose={handleCloseAssignment}
                        applicantId={applicantId}
                        assignmentType={assignmentType}
                        onNavigate={handleAssignmentNavigate}
                        onNextTopic={handleNextTopic}
                      />
                    </div>
                  ) : (
                    <div className="video-player-wrapper">
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
                        style={isFullscreen ? { width: "100%", height: "100%", border: "none", flex: 1 } : {}}
                      />
                      <button
                        onClick={toggleFullscreen}
                        className="fullscreen-btn"
                      >
                        {isFullscreen ? "✕ Exit Fullscreen" : "⛶ Fullscreen"}
                      </button>
                    </div>
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