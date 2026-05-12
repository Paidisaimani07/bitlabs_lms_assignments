/**
 * AssignmentEditor.js
 * 
 * Modern LMS assignment workflow component.
 * Manages coding exercises with real-time preview and validation.
 */

import React, { useState, useEffect, useCallback } from 'react';
import AssignmentValidator from './AssignmentValidator';
import { submitAssignment, getAssignmentByApplicantAndAssignmentNumber } from './assignmentservice';
import './AssignmentEditor.css';

const ASSIGNMENTS = [
  // ─── HTML BASICS (1.1 - 1.10) ─────────────────────────────────────────────
  {
    id: 1,
    title: "Exercise 1.1: Using six heading tags display names of fruits",
    question: "Create h1 to h6 tags to display fruit names. Logic: bigger fruit → bigger heading",
    expectedOutput: `<h1>Apple</h1><h2>Banana</h2><h3>Orange</h3><h4>Grape</h4><h5>Mango</h5><h6>Cherry</h6>`,
    testCases: [
      { selector: 'h1', marks: 2, message: '✓ H1 tag found' },
      { selector: 'h2', marks: 2, message: '✓ H2 tag found' },
      { selector: 'h3', marks: 2, message: '✓ H3 tag found' },
      { selector: 'h4', marks: 2, message: '✓ H4 tag found' },
      { selector: 'h5', marks: 2, message: '✓ H5 tag found' },
      { selector: 'h6', marks: 2, message: '✓ H6 tag found' }
    ],
    topic: 'HTML Basics'
  },
  {
    id: 2,
    title: "Exercise 1.2: Describe about your family",
    question: "Each family member's name as heading followed by 3-4 lines of description paragraph",
    expectedOutput: `<h1>My Family</h1><h2>Father</h2><p>Description...</p><h2>Mother</h2><p>Description...</p>`,
    testCases: [
      { selector: 'h1', marks: 2, message: '✓ Main heading found' },
      { selector: 'h2', marks: 4, message: '✓ Family member headings' },
      { selector: 'p', marks: 4, message: '✓ Description paragraphs' }
    ],
    topic: 'HTML Basics'
  },
  {
    id: 3,
    title: "Exercise 1.3: Display ordered list of Phone brands",
    question: "Create an ordered list of phone brands.",
    expectedOutput: `<ol><li>Apple</li><li>Samsung</li><li>Pixel</li></ol>`,
    testCases: [
      { selector: 'ol', marks: 4, message: '✓ Ordered list found' },
      { selector: 'li', marks: 6, message: '✓ List items found' }
    ],
    topic: 'HTML Lists'
  },
  {
    id: 4,
    title: "Exercise 1.4: Display unordered list of cars",
    question: "Create an unordered list of car models.",
    expectedOutput: `<ul><li>Tesla</li><li>BMW</li><li>Audi</li></ul>`,
    testCases: [
      { selector: 'ul', marks: 4, message: '✓ Unordered list found' },
      { selector: 'li', marks: 6, message: '✓ List items found' }
    ],
    topic: 'HTML Lists'
  },
  {
    id: 5,
    title: "Exercise 1.5: Describe soft drinks using dl, dt, dd",
    question: "Use definition list tags to describe 5 soft drink brands.",
    expectedOutput: `<dl><dt>Coke</dt><dd>Cola</dd><dt>Pepsi</dt><dd>Cola</dd></dl>`,
    testCases: [
      { selector: 'dl', marks: 3, message: '✓ DL found' },
      { selector: 'dt', marks: 4, message: '✓ DT found' },
      { selector: 'dd', marks: 3, message: '✓ DD found' }
    ],
    topic: 'HTML Lists'
  },
  {
    id: 6,
    title: "Exercise 1.6: Display Car Image",
    question: "Add an image of a car with alt text.",
    expectedOutput: `<img src="car.jpg" alt="A sports car" />`,
    testCases: [
      { selector: 'img', marks: 5, message: '✓ Image found' },
      { selector: 'img[alt]', marks: 5, message: '✓ Alt text found' }
    ],
    topic: 'HTML Media'
  },
  {
    id: 7,
    title: "Exercise 1.7: Five people's names, age, city in table",
    question: "Create a table with 5 rows showing Name, Age, and City.",
    expectedOutput: `<table><tr><th>Name</th><th>Age</th><th>City</th></tr><tr><td>John</td><td>25</td><td>NYC</td></tr></table>`,
    testCases: [
      { selector: 'table', marks: 3, message: '✓ Table found' },
      { selector: 'tr', marks: 4, message: '✓ Rows found' },
      { selector: 'td', marks: 3, message: '✓ Cells found' }
    ],
    topic: 'HTML Tables'
  },
  {
    id: 8,
    title: "Exercise 1.8: Create links to YouTube and bitLabs",
    question: "Create two links with appropriate href attributes.",
    expectedOutput: `<a href="https://youtube.com">YouTube</a><a href="https://bitlabs.in">BitLabs</a>`,
    testCases: [
      { selector: 'a[href*="youtube"]', marks: 5, message: '✓ YouTube link found' },
      { selector: 'a[href*="bitlabs"]', marks: 5, message: '✓ BitLabs link found' }
    ],
    topic: 'HTML Navigation'
  },
  {
    id: 9,
    title: "Exercise 1.9: Describe smartphone with image and features",
    question: "Heading, Image, and list of features.",
    expectedOutput: `<h1>iPhone</h1><img src="ip.jpg" alt="ip" /><ul><li>5G</li></ul>`,
    testCases: [
      { selector: 'h1', marks: 3, message: '✓ Heading found' },
      { selector: 'img', marks: 3, message: '✓ Image found' },
      { selector: 'ul', marks: 4, message: '✓ Features found' }
    ],
    topic: 'HTML Media'
  },
  {
    id: 10,
    title: "Exercise 1.10: Create a sample bill in table format",
    question: "Table with Item, Qty, Price, Total.",
    expectedOutput: `<table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr><tr><td>Pen</td><td>2</td><td>$5</td><td>$10</td></tr></table>`,
    testCases: [
      { selector: 'table', marks: 10, message: '✓ Bill table found' }
    ],
    topic: 'HTML Tables'
  },

  // ─── CSS PART 1 (101 - 106) ───────────────────────────────────────────────
  {
    id: 101,
    title: "Exercise 2.1: Inline Style Red Body",
    question: "Red colour with inline style for the body element.",
    expectedOutput: `<body style="color: red;">Hello BitLabs!</body>`,
    testCases: [
      { selector: 'body', attribute: { name: 'style' }, text: 'color: red', marks: 10, message: '✓ Body has inline red style' }
    ],
    topic: 'CSS Basics'
  },
  {
    id: 102,
    title: "Exercise 2.2: Red Text using Internal Style",
    question: "Red coloured text in paragraph using Internal style.",
    expectedOutput: `<style>p { color: red; }</style><p>Internal CSS</p>`,
    testCases: [
      { selector: 'style', text: 'color: red', marks: 10, message: '✓ Style tag with red color' }
    ],
    topic: 'CSS Basics'
  },
  {
    id: 103,
    title: "Exercise 2.3: Heading and Paragraph with External CSS",
    question: "Heading and paragraph in different color and font size.",
    expectedOutput: `<style>h1 { color: blue; font-size: 30px; } p { color: green; font-size: 18px; }</style><h1>Title</h1><p>Text</p>`,
    testCases: [
      { selector: 'h1', marks: 5, message: '✓ Styled heading found' },
      { selector: 'p', marks: 5, message: '✓ Styled paragraph found' }
    ],
    topic: 'CSS Basics'
  },
  {
    id: 104,
    title: "Exercise 2.4: ID and Class Selectors",
    question: "Use ID for main heading and Class for paragraphs.",
    expectedOutput: `<style>#main { color: red; } .desc { font-size: 12px; }</style><h1 id="main">H</h1><p class="desc">P</p>`,
    testCases: [
      { selector: '#main', marks: 5, message: '✓ ID selector' },
      { selector: '.desc', marks: 5, message: '✓ Class selector' }
    ],
    topic: 'CSS Basics'
  },
  {
    id: 105,
    title: "Exercise 2.5: Descendant Selector",
    question: "Change background color to yellow using descendant selectors.",
    expectedOutput: `<style>ol li { background: yellow; }</style><ol><li>Item</li></ol>`,
    testCases: [
      { selector: 'ol li', marks: 10, message: '✓ Descendant selector' }
    ],
    topic: 'CSS Basics'
  },
  {
    id: 106,
    title: "Exercise 2.6: Pseudo-Selectors",
    question: "Change link colors for hover, active, visited.",
    expectedOutput: `<style>a:hover { color: orange; }</style><a href="#">Link</a>`,
    testCases: [
      { selector: 'style', text: ':hover', marks: 10, message: '✓ Pseudo-selector found' }
    ],
    topic: 'CSS Basics'
  },

  // ─── CSS PART 2 (201 - 208) ───────────────────────────────────────────────
  {
    id: 201,
    title: "Exercise 3.1: Fruit Colors",
    question: "Six heading tags with colors for fruit names.",
    expectedOutput: `<style>.apple { color: red; }</style><h1 class="apple">Apple</h1>`,
    testCases: [
      { selector: 'h1', marks: 10, message: '✓ Heading found' }
    ],
    topic: 'CSS Advanced'
  },
  {
    id: 202,
    title: "Exercise 3.2: Font Size and Weight",
    question: "Change font size and font-weight for heading and para.",
    expectedOutput: `<style>h1 { font-size: 30px; font-weight: bold; }</style><h1>Text</h1>`,
    testCases: [
      { selector: 'h1', marks: 10, message: '✓ Styled heading' }
    ],
    topic: 'CSS Advanced'
  },
  {
    id: 203,
    title: "Exercise 3.3: Class Attribute",
    question: "Display text using class attribute.",
    expectedOutput: `<style>.txt { color: blue; }</style><p class="txt">T</p>`,
    testCases: [
      { selector: '.txt', marks: 10, message: '✓ Class attribute' }
    ],
    topic: 'CSS Advanced'
  },
  {
    id: 204,
    title: "Exercise 3.4: Class and ID",
    question: "Apply CSS using Class and ID.",
    expectedOutput: `<style>#id1 { color: red; } .cls1 { color: blue; }</style>`,
    testCases: [
      { selector: 'style', marks: 10, message: '✓ CSS found' }
    ],
    topic: 'CSS Advanced'
  },
  {
    id: 205,
    title: "Exercise 3.5: Paragraph Margin",
    question: "Apply margin (top, bottom, left, right) using ID.",
    expectedOutput: `<style>#p1 { margin: 10px; }</style><p id="p1">P</p>`,
    testCases: [
      { selector: '#p1', marks: 10, message: '✓ Margin applied' }
    ],
    topic: 'CSS Advanced'
  },
  {
    id: 206,
    title: "Exercise 3.6: Red Text Color",
    question: "Change text color to red using ID or Class.",
    expectedOutput: `<style>.red { color: red; }</style><p class="red">P</p>`,
    testCases: [
      { selector: '.red', marks: 10, message: '✓ Red color' }
    ],
    topic: 'CSS Advanced'
  },
  {
    id: 207,
    title: "Exercise 3.7: Text Alignment",
    question: "Align text Center, Right, Left.",
    expectedOutput: `<style>.c { text-align: center; }</style><p class="c">C</p>`,
    testCases: [
      { selector: '.c', marks: 10, message: '✓ Text alignment' }
    ],
    topic: 'CSS Advanced'
  },
  {
    id: 208,
    title: "Exercise 3.8: Styled Google Link",
    question: "Link with light gray background to Google.",
    expectedOutput: `<style>a { background: lightgray; }</style><a href="https://google.com">G</a>`,
    testCases: [
      { selector: 'a', marks: 10, message: '✓ Styled link' }
    ],
    topic: 'CSS Advanced'
  },

  // ─── HTML FORMS (301 - 305) ───────────────────────────────────────────────
  {
    id: 301,
    title: "Exercise 4.1: Registration Form",
    question: "Create a registration form.",
    expectedOutput: `<form><input type="text" /><button>Reg</button></form>`,
    testCases: [
      { selector: 'form', marks: 10, message: '✓ Form found' }
    ],
    topic: 'HTML Forms'
  },
  {
    id: 302,
    title: "Exercise 4.2: Login Form",
    question: "Create a login form.",
    expectedOutput: `<form><input type="password" /></form>`,
    testCases: [
      { selector: 'form', marks: 10, message: '✓ Form found' }
    ],
    topic: 'HTML Forms'
  },
  {
    id: 303,
    title: "Exercise 4.3: Feedback Form",
    question: "Create a feedback form with textarea.",
    expectedOutput: `<form><textarea></textarea></form>`,
    testCases: [
      { selector: 'textarea', marks: 10, message: '✓ Textarea found' }
    ],
    topic: 'HTML Forms'
  },
  {
    id: 304,
    title: "Exercise 4.4: Survey Form",
    question: "Create a survey form with radio buttons.",
    expectedOutput: `<form><input type="radio" /></form>`,
    testCases: [
      { selector: 'input[type="radio"]', marks: 10, message: '✓ Radio found' }
    ],
    topic: 'HTML Forms'
  },
  {
    id: 305,
    title: "Exercise 4.5: Contact Form",
    question: "Create a contact form with dropdown.",
    expectedOutput: `<form><select><option>O</option></select></form>`,
    testCases: [
      { selector: 'select', marks: 10, message: '✓ Select found' }
    ],
    topic: 'HTML Forms'
  }
];

const ErrorModal = ({ errors, onClose }) => (
  <div className="ae-error-modal-overlay">
    <div className="ae-error-modal">
      <div className="ae-error-header">
        <h3>Submission Error</h3>
        <button className="ae-error-close" onClick={onClose}>×</button>
      </div>
      <div className="ae-error-content">
        <span className="ae-error-warning-icon">⚠️</span>
        <p className="ae-error-main-msg">
          “Your code is not correct and you are still trying to submit the code.”
        </p>
        <div className="ae-error-details-box">
          {errors.map((err, idx) => (
            <div key={idx} className="ae-error-item">
              <div><span className="ae-error-label">Error:</span> {err.message}</div>
              <div><span className="ae-error-label">Type:</span> {err.type}</div>
              <div><span className="ae-error-label">Line:</span> {err.line}</div>
            </div>
          ))}
          {errors.length === 0 && (
            <div className="ae-error-item">
              <span className="ae-error-label">Status:</span> Some requirements are missing in your implementation.
            </div>
          )}
        </div>
      </div>
      <div className="ae-error-footer">
        <button className="ae-error-btn-ok" onClick={onClose}>Understood</button>
      </div>
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

  // Fetch saved code from backend
  const fetchSavedCode = useCallback(async (index) => {
    if (!applicantId) return;
    
    setLoading(true);
    try {
      const assignmentNumber = ASSIGNMENTS[index].id;
      const savedData = await getAssignmentByApplicantAndAssignmentNumber(applicantId, assignmentNumber);
      
      if (savedData && savedData.assignmentCode) {
        console.log('Preloading saved code from backend:', savedData.assignmentCode);
        setCode(savedData.assignmentCode);
        setLiveOutput(savedData.assignmentCode);
      } else {
        console.log('No saved code found for this assignment. Using default.');
        setCode('');
        setLiveOutput('');
      }
    } catch (error) {
      console.error('Failed to fetch saved code:', error);
      // Fallback to empty if error
      setCode('');
      setLiveOutput('');
    } finally {
      setLoading(false);
    }
  }, [applicantId]);

  useEffect(() => {
    if (assignmentType) {
      const typeToIndexMap = {
        'html-1.1': 0, 'html-1.2': 1, 'html-1.3': 2, 'html-1.4': 3, 'html-1.5': 4,
        'html-1.6': 5, 'html-1.7': 6, 'html-1.8': 7, 'html-1.9': 8, 'html-1.10': 9,
        'css1-1.1': 10, 'css1-1.2': 11, 'css1-1.3': 12, 'css1-1.4': 13, 'css1-1.5': 14, 'css1-1.6': 15,
        'css2-2.1': 16, 'css2-2.2': 17, 'css2-2.3': 18, 'css2-2.4': 19, 'css2-2.5': 20, 'css2-2.6': 21, 'css2-2.7': 22, 'css2-2.8': 23,
        'forms-3.1': 24, 'forms-3.2': 25, 'forms-3.3': 26, 'forms-3.4': 27, 'forms-3.5': 28
      };
      const mappedIndex = typeToIndexMap[assignmentType] || 0;
      setCurrentIndex(mappedIndex);
      fetchSavedCode(mappedIndex);
    }
  }, [assignmentType, fetchSavedCode]);

  // Handle index change for Next/Prev
  useEffect(() => {
    fetchSavedCode(currentIndex);
  }, [currentIndex, fetchSavedCode]);

  const handleRun = () => {
    setLiveOutput(code);
    setIsSubmitted(false);
  };

  const handleSubmit = async () => {
    const current = ASSIGNMENTS[currentIndex];
    const result = AssignmentValidator.validate(code, current.testCases);
    
    setValidationResult(result);
    setIsSubmitted(true);

    if (!result.isValid) {
      setSubmissionErrors(result.errors || []);
      setShowErrorModal(true);
      // Requirement: even if fails, we might still want to save or just stop. 
      // The prompt says: "Show red popup if submission fails. Display backend error message."
      // I'll try to submit anyway if requested, or just show the validator error.
      // Usually, we only submit valid code, but let's follow the "submit" button logic.
    }

    try {
      const payload = {
        applicantId: applicantId || 101,
        assignmentNumber: current.id,
        assignmentCode: code,
        status: result.isValid ? 'COMPLETED' : 'SUBMITTED'
      };

      await submitAssignment(payload);
      
      if (result.isValid) {
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3500);
      }
      
      // Trigger existing progression logic
      window.dispatchEvent(new CustomEvent('assignmentCompleted', {
        detail: { assignmentId: current.id }
      }));

    } catch (error) {
      console.error('Submission failed:', error);
      // Requirement 10: Show red popup if submission fails.
      setSubmissionErrors([{ message: error.response?.data?.message || 'Network failure or server error', type: 'API', line: 'N/A' }]);
      setShowErrorModal(true);
    }
  };

  const handleNextAssignment = useCallback(() => {
    if (currentIndex < ASSIGNMENTS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // fetchSavedCode will be triggered by useEffect
      setLiveOutput('');
      setIsSubmitted(false);
      setValidationResult(null);
      
      window.dispatchEvent(new CustomEvent('assignmentChanged', {
        detail: { assignmentId: ASSIGNMENTS[currentIndex + 1].id }
      }));
    }
  }, [currentIndex]);

  const handlePrevAssignment = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      // fetchSavedCode will be triggered by useEffect
      setLiveOutput('');
      setIsSubmitted(false);
      setValidationResult(null);
    }
  }, [currentIndex]);

  const handleBack = () => {
    if (onClose) onClose();
  };

  const currentAssignment = ASSIGNMENTS[currentIndex];
  const isLastAssignment = currentIndex === ASSIGNMENTS.length - 1;

  return (
    <div className="assignment-editor">
      <div className="ae-header">
        <button className="ae-back-btn" onClick={handleBack}>← Back</button>
        <div className="ae-title-section">
          <h2>{currentAssignment.title}</h2>
          <span className="ae-badge">{currentAssignment.topic}</span>
        </div>
        <div className="ae-progress">
          <span className="ae-progress-text">Exercise {currentIndex + 1} / {ASSIGNMENTS.length}</span>
          <div className="ae-progress-bar">
            <div className="ae-progress-fill" style={{ width: `${((currentIndex + 1) / ASSIGNMENTS.length) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="ae-content">
        <div className="ae-left-panel">
          <div className="ae-question">
            <h3>Question</h3>
            <p>{currentAssignment.question}</p>
          </div>
          <div className="ae-editor-section">
            <label className="ae-label">Write your HTML code here:</label>
            <textarea
              className="ae-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="<!DOCTYPE html><html><body><!-- Write here --></body></html>"
              spellCheck="false"
            />
          </div>
          <div className="ae-button-group">
            {currentIndex > 0 && (
              <button className="ae-btn ae-btn-prev" onClick={handlePrevAssignment}>← Previous</button>
            )}
            <button className="ae-btn ae-btn-primary" onClick={handleRun}>▶ Run</button>
            <button className="ae-btn ae-btn-success" onClick={handleSubmit} disabled={!code.trim()}>✓ Submit</button>
            {isSubmitted && validationResult && validationResult.isValid && !isLastAssignment && (
              <button className="ae-btn ae-btn-next" onClick={handleNextAssignment}>Next Assignment →</button>
            )}
          </div>
          {isSubmitted && validationResult && (
            <div className={`ae-submission-status ${validationResult.isValid ? 'ae-passed' : 'ae-failed'}`}>
              <h4>{validationResult.isValid ? '✓ Submission Completed Successfully!' : '⚠ Review Your Code'}</h4>
              <div className="ae-validation-details">
                {validationResult.details.map((detail, idx) => (
                  <p key={idx} className="ae-detail">{detail}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ae-right-panel">
          <div className="ae-output-section">
            <h3>Your Output</h3>
            <div className="ae-iframe-container">
              <iframe className="ae-preview-iframe" srcDoc={liveOutput} title="User Output" sandbox="allow-same-origin allow-scripts" />
            </div>
          </div>
          <div className="ae-output-section ae-expected">
            <h3>Expected Output</h3>
            <div className="ae-iframe-container">
              <iframe className="ae-preview-iframe ae-expected-iframe" srcDoc={currentAssignment.expectedOutput} title="Expected Output" sandbox="allow-same-origin allow-scripts" />
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="ae-success-modal-overlay">
          <div className="ae-success-modal">
            <div className="ae-success-icon-wrapper">
              <span className="ae-success-icon">🎉</span>
            </div>
            <h3 className="ae-success-title">Congratulations!</h3>
            <p className="ae-success-msg">You have solved the problem successfully!</p>
            <div className="ae-success-confetti">✨🏆✨</div>
            <button className="ae-success-btn" onClick={() => setShowSuccessModal(false)}>Continue</button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <ErrorModal 
          errors={submissionErrors} 
          onClose={() => setShowErrorModal(false)} 
        />
      )}
    </div>
  );
};

export default AssignmentEditor;
