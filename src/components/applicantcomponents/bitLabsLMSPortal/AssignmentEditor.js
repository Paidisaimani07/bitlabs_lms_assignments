/**
 * AssignmentEditor.js
 * 
 * Modern LMS assignment workflow component.
 * Manages coding exercises with real-time preview and validation.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AssignmentValidator from './AssignmentValidator';
import { submitAssignment, getAssignmentByApplicantAndAssignmentNumber, getAllAssignmentsByApplicant } from './assignmentservice';
import './AssignmentEditor.css';

const ASSIGNMENTS = [
  // ─── HTML BASICS (Module 1: 1.1 - 1.10) ───────────────────────────────────
  { id: 1, title: "Exercise 1.1: Names of fruits", question: "Create h1 to h6 tags to display fruit names.", expectedOutput: `<h1>Apple</h1><h2>Banana</h2><h3>Orange</h3><h4>Grape</h4><h5>Mango</h5><h6>Cherry</h6>`, testCases: [{ selector: 'h1', marks: 2 }, { selector: 'h2', marks: 2 }, { selector: 'h3', marks: 2 }, { selector: 'h4', marks: 2 }, { selector: 'h5', marks: 2 }, { selector: 'h6', marks: 2 }], topic: 'HTML Basics' },
  { id: 2, title: "Exercise 1.2: Describe family", question: "Family member names as headings with description paragraphs.", expectedOutput: `<h1>My Family</h1><h2>Father</h2><p>Description...</p>`, testCases: [{ selector: 'h1' }, { selector: 'h2' }, { selector: 'p' }], topic: 'HTML Basics' },
  { id: 3, title: "Exercise 1.3: Phone brands", question: "Ordered list of phone brands.", expectedOutput: `<ol><li>Apple</li><li>Samsung</li></ol>`, testCases: [{ selector: 'ol' }, { selector: 'li' }], topic: 'HTML Basics' },
  { id: 4, title: "Exercise 1.4: Unordered list of cars", question: "Unordered list of car models.", expectedOutput: `<ul><li>Tesla</li><li>BMW</li></ul>`, testCases: [{ selector: 'ul' }, { selector: 'li' }], topic: 'HTML Basics' },
  { id: 5, title: "Exercise 1.5: Soft drinks", question: "Definition list (dl, dt, dd) for soft drinks.", expectedOutput: `<dl><dt>Coke</dt><dd>Cola</dd></dl>`, testCases: [{ selector: 'dl' }, { selector: 'dt' }, { selector: 'dd' }], topic: 'HTML Basics' },
  { id: 6, title: "Exercise 1.6: Car Image", question: "Add an image of a car.", expectedOutput: `<img src="car.jpg" alt="car" />`, testCases: [{ selector: 'img' }], topic: 'HTML Basics' },
  { id: 7, title: "Exercise 1.7: Table of people", question: "Table with Name, Age, City.", expectedOutput: `<table><tr><th>Name</th></tr><tr><td>John</td></tr></table>`, testCases: [{ selector: 'table' }, { selector: 'tr' }, { selector: 'td' }], topic: 'HTML Basics' },
  { id: 8, title: "Exercise 1.8: Links", question: "Links to YouTube and bitLabs.", expectedOutput: `<a href="https://youtube.com">YT</a>`, testCases: [{ selector: 'a' }], topic: 'HTML Basics' },
  { id: 9, title: "Exercise 1.9: Smartphone", question: "Heading, Image, and list of features.", expectedOutput: `<h1>IP</h1><img src="ip.jpg" /><ul><li>5G</li></ul>`, testCases: [{ selector: 'h1' }, { selector: 'img' }, { selector: 'ul' }], topic: 'HTML Basics' },
  { id: 10, title: "Exercise 1.10: Sample Bill", question: "Table format for a sample bill.", expectedOutput: `<table><tr><td>Item</td><td>Price</td></tr></table>`, testCases: [{ selector: 'table' }], topic: 'HTML Basics' },

  // ─── CSS BASICS (Module 2: 2.1 - 2.6) ─────────────────────────────────────
  { id: 101, title: "Exercise 2.1: Inline Red Body", question: "Body with inline red color.", expectedOutput: `<body style="color: red;">Hello</body>`, testCases: [{ selector: 'body' }], topic: 'CSS Basics' },
  { id: 102, title: "Exercise 2.2: Internal Red Text", question: "Paragraph with red color using internal style.", expectedOutput: `<style>p{color:red;}</style><p>Text</p>`, testCases: [{ selector: 'style' }], topic: 'CSS Basics' },
  { id: 103, title: "Exercise 2.3: External Styles", question: "Styled heading and paragraph.", expectedOutput: `<style>h1{color:blue;}</style><h1>T</h1>`, testCases: [{ selector: 'h1' }], topic: 'CSS Basics' },
  { id: 104, title: "Exercise 2.4: ID and Class", question: "Use ID and Class selectors.", expectedOutput: `<style>#id1{color:red;}</style><h1 id="id1">H</h1>`, testCases: [{ selector: '#id1' }], topic: 'CSS Basics' },
  { id: 105, title: "Exercise 2.5: Descendant Selector", question: "Background color using descendant selector.", expectedOutput: `<style>ol li{background:yellow;}</style><ol><li>I</li></ol>`, testCases: [{ selector: 'ol li' }], topic: 'CSS Basics' },
  { id: 106, title: "Exercise 2.6: Pseudo-Selectors", question: "Hover effects on links.", expectedOutput: `<style>a:hover{color:orange;}</style>`, testCases: [{ selector: 'style' }], topic: 'CSS Basics' },

  // ─── CSS ADVANCED (Module 3: 3.1 - 3.8) ───────────────────────────────────
  { id: 201, title: "Exercise 3.1: Fruit Colors", question: "Color headings for fruits.", expectedOutput: `<style>.apple{color:red;}</style>`, testCases: [{ selector: 'style' }], topic: 'CSS Advanced' },
  { id: 202, title: "Exercise 3.2: Font Weight", question: "Heading font weight and size.", expectedOutput: `<style>h1{font-weight:bold;}</style>`, testCases: [{ selector: 'h1' }], topic: 'CSS Advanced' },
  { id: 203, title: "Exercise 3.3: Class Attribute", question: "Apply style using class.", expectedOutput: `<p class="txt">T</p>`, testCases: [{ selector: '.txt' }], topic: 'CSS Advanced' },
  { id: 204, title: "Exercise 3.4: ID Attribute", question: "Apply style using ID.", expectedOutput: `<h1 id="id1">H</h1>`, testCases: [{ selector: '#id1' }], topic: 'CSS Advanced' },
  { id: 205, title: "Exercise 3.5: Margin", question: "Apply margins using ID.", expectedOutput: `<style>#p1{margin:10px;}</style>`, testCases: [{ selector: '#p1' }], topic: 'CSS Advanced' },
  { id: 206, title: "Exercise 3.6: Color with ID", question: "Change text color using ID.", expectedOutput: `<style>#p1{color:red;}</style>`, testCases: [{ selector: '#p1' }], topic: 'CSS Advanced' },
  { id: 207, title: "Exercise 3.7: Alignment", question: "Center and Right align text.", expectedOutput: `<style>.c{text-align:center;}</style>`, testCases: [{ selector: '.c' }], topic: 'CSS Advanced' },
  { id: 208, title: "Exercise 3.8: Styled Link", question: "Gray background for Google link.", expectedOutput: `<style>a{background:gray;}</style>`, testCases: [{ selector: 'a' }], topic: 'CSS Advanced' },

  // ─── HTML FORMS (Module 4: 4.1 - 4.5) ─────────────────────────────────────
  { id: 301, title: "Exercise 4.1: Registration", question: "Registration form.", expectedOutput: `<form><input type="text" /></form>`, testCases: [{ selector: 'form' }], topic: 'HTML Forms' },
  { id: 302, title: "Exercise 4.2: Login", question: "Login form.", expectedOutput: `<form><input type="password" /></form>`, testCases: [{ selector: 'form' }], topic: 'HTML Forms' },
  { id: 303, title: "Exercise 4.3: Feedback", question: "Feedback form with textarea.", expectedOutput: `<form><textarea></textarea></form>`, testCases: [{ selector: 'textarea' }], topic: 'HTML Forms' },
  { id: 304, title: "Exercise 4.4: Survey", question: "Survey form with radio buttons.", expectedOutput: `<form><input type="radio" /></form>`, testCases: [{ selector: 'input[type="radio"]' }], topic: 'HTML Forms' },
  { id: 305, title: "Exercise 4.5: Contact", question: "Contact form with select dropdown.", expectedOutput: `<form><select><option>O</option></select></form>`, testCases: [{ selector: 'select' }], topic: 'HTML Forms' }
];

const ErrorModal = ({ errors, onClose }) => (
  <div className="ae-error-modal-overlay">
    <div className="ae-error-modal">
      <div className="ae-error-header"><h3>Submission Error</h3><button className="ae-error-close" onClick={onClose}>×</button></div>
      <div className="ae-error-content"><span className="ae-error-warning-icon">⚠️</span><p className="ae-error-main-msg">“Your code is not correct.”</p><div className="ae-error-details-box">{errors.map((err, idx) => (<div key={idx} className="ae-error-item"><div>{err.message}</div></div>))}</div></div>
      <div className="ae-error-footer"><button className="ae-error-btn-ok" onClick={onClose}>Understood</button></div>
    </div>
  </div>
);

const AssignmentEditor = ({ assignmentType, onClose, applicantId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState('');
  const [liveOutput, setLiveOutput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [submissionErrors, setSubmissionErrors] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeAssignmentIdRef = useRef(null);
  const isNavigatingRef = useRef(false);

  const currentAssignment = useMemo(() => ASSIGNMENTS[currentIndex], [currentIndex]);

  const fetchSavedCodeFromBackend = useCallback(async (index) => {
    if (!applicantId) return;
    const target = ASSIGNMENTS[index];
    if (!target) return;
    const assignmentId = target.id;

    setCode('');
    setLiveOutput('');
    setValidationResult(null);
    setLoading(true);

    try {
      const data = await getAssignmentByApplicantAndAssignmentNumber(applicantId, assignmentId);

      // Robust Parsing Logic: Find the best submission record
      let bestSubmission = null;
      if (Array.isArray(data)) {
        // Sort by ID to get latest first
        const sorted = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
        bestSubmission = sorted[0];
      } else {
        bestSubmission = data;
      }

      const backendCode = bestSubmission?.assignmentCode || bestSubmission?.assignment_code || bestSubmission?.code;

      if (activeAssignmentIdRef.current === assignmentId) {
        if (backendCode) {
          const finalCode = String(backendCode);
          setCode(finalCode);
          setLiveOutput(finalCode);
          setValidationResult({ isValid: true, details: ['✓ Loaded from Table'] });
        } else {
          const template = `<!DOCTYPE html>\n<html>\n<head>\n    <title>${target.title}</title>\n</head>\n<body>\n\n    <!-- Write code for ${target.title} here -->\n\n</body>\n</html>`;
          setCode(template);
          setLiveOutput(template);
        }
      }
    } catch (e) {
      console.error('[AssignmentEditor] Fetch Error:', e);
      // Ensure we still show a template if the fetch fails
      const template = `<!DOCTYPE html>\n<html>\n<body>\n    <!-- Template Fallback -->\n</body>\n</html>`;
      setCode(template);
    } finally {
      setLoading(false);
      setIsSubmitted(false);
      isNavigatingRef.current = false;
    }
  }, [applicantId]);

  const performNavigation = useCallback((newIndex) => {
    isNavigatingRef.current = true;
    activeAssignmentIdRef.current = ASSIGNMENTS[newIndex].id;
    setCurrentIndex(newIndex);
  }, []);

  const handleNextAssignment = useCallback(() => {
    if (currentIndex < ASSIGNMENTS.length - 1) performNavigation(currentIndex + 1);
  }, [currentIndex, performNavigation]);

  const handlePrevAssignment = useCallback(() => {
    if (currentIndex > 0) performNavigation(currentIndex - 1);
  }, [currentIndex, performNavigation]);

  const handleBack = () => {
    const topic = currentAssignment.topic;
    const firstIdx = ASSIGNMENTS.findIndex(a => a.topic === topic);
    if (firstIdx !== -1 && currentIndex !== firstIdx) performNavigation(firstIdx);
    else if (onClose) onClose();
  };

  const handleCodeChange = (newCode) => {
    if (isNavigatingRef.current) return;
    setCode(newCode);
  };

  useEffect(() => {
    const init = async () => {
      if (!applicantId) return;
      setLoading(true);
      try {
        let targetIdx = 0;
        if (assignmentType) {
          const map = { 'html-1.1': 0, 'css1-2.1': 10, 'css2-3.1': 16, 'forms-4.1': 24 };
          targetIdx = map[assignmentType] ?? 0;
        } else {
          const allSubmissions = await getAllAssignmentsByApplicant(applicantId);
          if (allSubmissions && allSubmissions.length > 0) {
            const highest = allSubmissions.reduce((p, c) => (p.assignmentNumber > c.assignmentNumber) ? p : c);
            const resumeIndex = ASSIGNMENTS.findIndex(a => a.id === highest.assignmentNumber);
            if (resumeIndex !== -1) targetIdx = resumeIndex;
          }
        }
        activeAssignmentIdRef.current = ASSIGNMENTS[targetIdx].id;
        setCurrentIndex(targetIdx);
      } catch (e) { } finally { setLoading(false); }
    };
    init();
  }, [applicantId, assignmentType]);

  useEffect(() => { fetchSavedCodeFromBackend(currentIndex); }, [currentIndex, fetchSavedCodeFromBackend]);

  const handleRun = () => { setLiveOutput(code); setIsSubmitted(false); };

  const handleSubmit = async () => {
    const result = AssignmentValidator.validate(code, currentAssignment.testCases);
    setValidationResult(result);
    setIsSubmitted(true);
    if (!result.isValid) { setSubmissionErrors(result.errors || []); setShowErrorModal(true); return; }

    try {
      await submitAssignment({ applicantId: applicantId || 101, assignmentNumber: currentAssignment.id, assignmentCode: code, status: 'COMPLETED' });
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3500);
      window.dispatchEvent(new CustomEvent('assignmentCompleted', { detail: { assignmentId: currentAssignment.id } }));
    } catch (e) {
      setSubmissionErrors([{ message: e.message || 'Submit Failed' }]);
      setShowErrorModal(true);
    }
  };

  return (
    <div className="assignment-editor">
      <div className="ae-header">
        <button className="ae-back-btn" onClick={handleBack}>← Back</button>
        <div className="ae-title-section"><h2>{currentAssignment.title}</h2><span className="ae-badge">{currentAssignment.topic}</span></div>
        <div className="ae-progress"><span className="ae-progress-text">{currentIndex + 1} / {ASSIGNMENTS.length}</span><div className="ae-progress-bar"><div className="ae-progress-fill" style={{ width: `${((currentIndex + 1) / ASSIGNMENTS.length) * 100}%` }} /></div></div>
      </div>
      <div className="ae-content">
        <div className="ae-left-panel">
          <div className="ae-question"><h3>Question</h3><p>{currentAssignment.question}</p></div>
          <div className="ae-editor-section"><label className="ae-label">HTML Code:</label><textarea className="ae-textarea" value={code} onChange={(e) => handleCodeChange(e.target.value)} placeholder="Type here..." spellCheck="false" disabled={loading} /></div>
          <div className="ae-button-group">
            {currentIndex > 0 && <button className="ae-btn ae-btn-prev" onClick={handlePrevAssignment}>← Previous</button>}
            <button className="ae-btn ae-btn-primary" onClick={handleRun}>▶ Run</button>
            <button className="ae-btn ae-btn-success" onClick={handleSubmit} disabled={!code.trim() || loading}>✓ Submit</button>
            {isSubmitted && validationResult?.isValid && currentIndex < ASSIGNMENTS.length - 1 && <button className="ae-btn ae-btn-next" onClick={handleNextAssignment}>Next Assignment →</button>}
          </div>
          {isSubmitted && validationResult && <div className={`ae-submission-status ${validationResult.isValid ? 'ae-passed' : 'ae-failed'}`}><h4>{validationResult.isValid ? '✓ Passed!' : '⚠ Failed'}</h4>{validationResult.details.map((d, i) => <p key={i} className="ae-detail">{d}</p>)}</div>}
        </div>
        <div className="ae-right-panel">
          <div className="ae-output-section"><h3>Your Output {loading && "..."}</h3><div className="ae-iframe-container"><iframe className="ae-preview-iframe" srcDoc={liveOutput} title="User Output" /></div></div>
          <div className="ae-output-section ae-expected"><h3>Expected Output</h3><div className="ae-iframe-container"><iframe className="ae-preview-iframe ae-expected-iframe" srcDoc={currentAssignment.expectedOutput} title="Expected Output" /></div></div>
        </div>
      </div>
      {showSuccessModal && <div className="ae-success-modal-overlay"><div className="ae-success-modal"><h3>Success!</h3><p>Problem solved!</p><button className="ae-success-btn" onClick={() => setShowSuccessModal(false)}>Continue</button></div></div>}
      {showErrorModal && <ErrorModal errors={submissionErrors} onClose={() => setShowErrorModal(false)} />}
    </div>
  );
};

export default AssignmentEditor;
