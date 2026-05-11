/**
 * AssignmentEditor.js
 * 
 * Modern LMS assignment workflow component.
 * Manages coding exercises with real-time preview and validation.
 * 
 * Flow:
 * 1. Display assignment question
 * 2. Student writes code in textarea
 * 3. Click "Run" to preview live output
 * 4. Click "Submit" to validate and generate marks
 * 5. View marks and results in side-by-side comparison
 * 6. Move to next assignment after submission
 * 7. All data saved to localStorage
 */

import React, { useState, useEffect, useCallback } from 'react';
import AssignmentValidator from './AssignmentValidator';
import './AssignmentEditor.css';

// ═══════════════════════════════════════════════════════════════════
// ASSIGNMENT CONFIGURATION ARRAY
// Each assignment has: id, title, question, expectedOutput, validationType
// This allows dynamic loading of all assignments
// ═══════════════════════════════════════════════════════════════════
const ASSIGNMENTS = [
  {
    id: 1,
    title: "Exercise 1.1: Using six heading tags display names of fruits",
    question: "Create h1 to h6 tags to display fruit names. Logic: bigger fruit → bigger heading",
    expectedOutput: `<!DOCTYPE html>
<html>
<body>
  <h1>Apple</h1>
  <h2>Banana</h2>
  <h3>Orange</h3>
  <h4>Grape</h4>
  <h5>Mango</h5>
  <h6>Cherry</h6>
</body>
</html>`,
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
    expectedOutput: `<!DOCTYPE html>
<html>
<body>
  <h1>My Family</h1>
  <h2>Father</h2>
  <p>Description about father...</p>
  <h2>Mother</h2>
  <p>Description about mother...</p>
  <h2>Sister</h2>
  <p>Description about sister...</p>
</body>
</html>`,
    testCases: [
      { selector: 'h1', text: 'family', marks: 2, message: '✓ Main family heading found' },
      { selector: 'h2', marks: 3, message: '✓ Family member headings found' },
      { selector: 'p', marks: 5, message: '✓ Description paragraphs found' }
    ],
    topic: 'HTML Basics'
  },
  {
    id: 3,
    title: "Exercise 2.1: CSS Part 1 - Basic Styling",
    question: "Apply CSS styles to HTML elements. Use inline styles or internal CSS to style headings and paragraphs.",
    expectedOutput: `<!DOCTYPE html>
<html>
<head>
  <style>
    h1 { color: blue; font-size: 24px; }
    p { color: green; font-family: Arial; }
  </style>
</head>
<body>
  <h1>Styled Heading</h1>
  <p>Styled paragraph with CSS.</p>
</body>
</html>`,
    testCases: [
      { selector: 'h1', attribute: { name: 'style' }, marks: 3, message: '✓ H1 has styling' },
      { selector: 'p', attribute: { name: 'style' }, marks: 3, message: '✓ Paragraph has styling' },
      { selector: 'style', marks: 4, message: '✓ CSS styles found' }
    ],
    topic: 'CSS Basics'
  },
  {
    id: 4,
    title: "Exercise 2.2: CSS Part 2 - Advanced Styling",
    question: "Apply advanced CSS styling including backgrounds, borders, margins, and padding to create a styled layout.",
    expectedOutput: `<!DOCTYPE html>
<html>
<head>
  <style>
    .container { 
      background: #f0f0f0; 
      border: 2px solid #333; 
      padding: 20px; 
      margin: 10px; 
    }
    .box { 
      background: #ff6b35; 
      color: white; 
      padding: 15px; 
      border-radius: 5px; 
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Advanced CSS</h1>
    <div class="box">Styled box with CSS</div>
  </div>
</body>
</html>`,
    testCases: [
      { selector: '.container', marks: 3, message: '✓ Container class found' },
      { selector: '.box', marks: 3, message: '✓ Box class found' },
      { selector: 'style', marks: 4, message: '✓ CSS styles found' }
    ],
    topic: 'CSS Advanced'
  },
  {
    id: 5,
    title: "Exercise 1.3: Display ordered list of Phone brands",
    question: "Create an ordered list of phone brands. Logic: order by your preference",
    expectedOutput: `<!DOCTYPE html>
<html>
<body>
  <h1>My Favorite Phone Brands</h1>
  <ol>
    <li>Apple iPhone</li>
    <li>Samsung Galaxy</li>
    <li>Google Pixel</li>
  </ol>
</body>
</html>`,
    testCases: [
      { selector: 'ol', marks: 3, message: '✓ Ordered list found' },
      { selector: 'ol > li', marks: 7, message: '✓ List items found' }
    ],
    topic: 'HTML Lists'
  },
  {
    id: 6,
    title: "Exercise 1.4: Display unordered list of cars",
    question: "Create an unordered list of your preferred car models",
    expectedOutput: `<!DOCTYPE html>
<html>
<body>
  <h1>My Preferred Cars</h1>
  <ul>
    <li>Tesla Model 3</li>
    <li>BMW 3 Series</li>
    <li>Mercedes C-Class</li>
  </ul>
</body>
</html>`,
    testCases: [
      { selector: 'ul', marks: 3, message: '✓ Unordered list found' },
      { selector: 'ul > li', marks: 7, message: '✓ List items found' }
    ],
    topic: 'HTML Lists'
  },
  {
    id: 7,
    title: "Exercise 1.5: Display soft drink brands using dl, dt, dd tags",
    question: "Use definition list tags (dl, dt, dd) to describe at least 5 soft drink brands",
    expectedOutput: `<!DOCTYPE html>
<html>
<body>
  <h1>Favorite Soft Drinks</h1>
  <dl>
    <dt>Coca-Cola</dt>
    <dd>Classic carbonated soft drink</dd>
    <dt>Pepsi</dt>
    <dd>Popular cola competitor</dd>
    <dt>Sprite</dt>
    <dd>Lemon-lime soft drink</dd>
    <dt>Fanta</dt>
    <dd>Orange-flavored drink</dd>
    <dt>Mountain Dew</dt>
    <dd>Citrus-flavored soft drink</dd>
  </dl>
</body>
</html>`,
    testCases: [
      { selector: 'dl', marks: 2, message: '✓ Definition list found' },
      { selector: 'dl > dt', marks: 4, message: '✓ Definition terms found' },
      { selector: 'dl > dd', marks: 4, message: '✓ Definition descriptions found' }
    ],
    topic: 'HTML Lists'
  },
  {
    id: 8,
    title: "Exercise 1.6: Display Car Image",
    question: "Add an image with appropriate alt text for accessibility",
    expectedOutput: `<!DOCTYPE html>
<html>
<body>
  <h1>My Dream Car</h1>
  <img src="image-url" alt="A beautiful red sports car" />
</body>
</html>`,
    testCases: [
      { selector: 'img', marks: 3, message: '✓ Image found' },
      { selector: 'img', attribute: { name: 'alt' }, marks: 7, message: '✓ Image with alt text found' }
    ],
    topic: 'HTML Media'
  },
  {
    id: 9,
    title: "Exercise 1.7: Display people's names with age and city in table",
    question: "Create a table showing people's information (Name, Age, City) with at least 3 rows",
    expectedOutput: `<!DOCTYPE html>
<html>
<body>
  <h1>People Information</h1>
  <table border="1">
    <tr><th>Name</th><th>Age</th><th>City</th></tr>
    <tr><td>John</td><td>25</td><td>NYC</td></tr>
    <tr><td>Jane</td><td>30</td><td>LA</td></tr>
    <tr><td>Bob</td><td>28</td><td>Chicago</td></tr>
  </table>
</body>
</html>`,
    testCases: [
      { selector: 'table', marks: 2, message: '✓ Table found' },
      { selector: 'table tr', marks: 4, message: '✓ Table rows found' },
      { selector: 'table td, table th', marks: 4, message: '✓ Table cells found' }
    ],
    topic: 'HTML Tables'
  },
  {
    id: 10,
    title: "Exercise 1.8: Create HTML links",
    question: "Create at least 2 links to navigate to different websites (YouTube, BitLabs, etc)",
    expectedOutput: `<!DOCTYPE html>
<html>
<body>
  <h1>Useful Websites</h1>
  <a href="https://www.youtube.com">YouTube</a>
  <a href="https://www.bitlabs.in">BitLabs</a>
</body>
</html>`,
    testCases: [
      { selector: 'a', marks: 5, message: '✓ Links found' },
      { selector: 'a', attribute: { name: 'href' }, marks: 5, message: '✓ Links with href found' }
    ],
    topic: 'HTML Navigation'
  },
  {
    id: 11,
    title: "Exercise 1.9: Describe a smartphone with image and features",
    question: "Display smartphone name as heading, add image, and list key features",
    expectedOutput: `<!DOCTYPE html>
<html>
<body>
  <h1>iPhone 14 Pro</h1>
  <img src="image-url" alt="iPhone 14 Pro" />
  <h2>Features:</h2>
  <ul>
    <li>6.1-inch display</li>
    <li>A16 Bionic chip</li>
    <li>48MP camera system</li>
    <li>All-day battery life</li>
  </ul>
</body>
</html>`,
    testCases: [
      { selector: 'h1', marks: 2, message: '✓ Product heading found' },
      { selector: 'img', marks: 2, message: '✓ Product image found' },
      { selector: 'ul, ol', marks: 6, message: '✓ Features list found' }
    ],
    topic: 'HTML Media'
  },
  {
    id: 12,
    title: "Exercise 1.10: Create sample bill in table format",
    question: "Create a professional bill table with Item, Quantity, Price, Total columns",
    expectedOutput: `<!DOCTYPE html>
<html>
<body>
  <h1>Sample Bill</h1>
  <table border="1">
    <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
    <tr><td>Notebook</td><td>2</td><td>$5</td><td>$10</td></tr>
    <tr><td>Pen</td><td>3</td><td>$2</td><td>$6</td></tr>
    <tr><td>Eraser</td><td>1</td><td>$1</td><td>$1</td></tr>
    <tr><th colspan="3">Grand Total</th><th>$17</th></tr>
  </table>
</body>
</html>`,
    testCases: [
      { selector: 'table', marks: 3, message: '✓ Bill table found' },
      { selector: 'table tr', marks: 4, message: '✓ Bill rows found' },
      { selector: 'table td, table th', marks: 3, message: '✓ Bill cells found' }
    ],
    topic: 'HTML Tables'
  },
  {
    id: 13,
    title: "Exercise 3.1: Registration Forms - Basic Form",
    question: "Create a registration form with input fields for name, email, and password. Include proper labels and a submit button.",
    expectedOutput: `<!DOCTYPE html>
<html>
<body>
  <h1>User Registration</h1>
  <form>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
    
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
    
    <label for="password">Password:</label>
    <input type="password" id="password" name="password" required>
    
    <button type="submit">Register</button>
  </form>
</body>
</html>`,
    testCases: [
      { selector: 'form', marks: 2, message: '✓ Form found' },
      { selector: 'input[type="text"], input[type="email"], input[type="password"]', marks: 4, message: '✓ Input fields found' },
      { selector: 'label', marks: 2, message: '✓ Labels found' },
      { selector: 'button[type="submit"], input[type="submit"]', marks: 2, message: '✓ Submit button found' }
    ],
    topic: 'HTML Forms'
  },
  {
    id: 14,
    title: "Exercise 3.2: Registration Forms - Advanced Form",
    question: "Create an advanced registration form with checkboxes, radio buttons, textarea, and select dropdown.",
    expectedOutput: `<!DOCTYPE html>
<html>
<body>
  <h1>Advanced Registration</h1>
  <form>
    <label for="fullname">Full Name:</label>
    <input type="text" id="fullname" name="fullname" required>
    
    <label>Gender:</label>
    <input type="radio" name="gender" value="male" id="male">
    <label for="male">Male</label>
    <input type="radio" name="gender" value="female" id="female">
    <label for="female">Female</label>
    
    <label for="interests">Interests:</label>
    <input type="checkbox" name="interests" value="sports" id="sports">
    <label for="sports">Sports</label>
    <input type="checkbox" name="interests" value="music" id="music">
    <label for="music">Music</label>
    
    <label for="country">Country:</label>
    <select id="country" name="country">
      <option value="">Select Country</option>
      <option value="us">United States</option>
      <option value="uk">United Kingdom</option>
    </select>
    
    <label for="comments">Comments:</label>
    <textarea id="comments" name="comments" rows="4"></textarea>
    
    <button type="submit">Submit</button>
  </form>
</body>
</html>`,
    testCases: [
      { selector: 'form', marks: 2, message: '✓ Form found' },
      { selector: 'input[type="radio"]', marks: 2, message: '✓ Radio buttons found' },
      { selector: 'input[type="checkbox"]', marks: 2, message: '✓ Checkboxes found' },
      { selector: 'select', marks: 2, message: '✓ Select dropdown found' },
      { selector: 'textarea', marks: 2, message: '✓ Textarea found' }
    ],
    topic: 'HTML Forms'
  }
];

const AssignmentEditor = ({ assignmentType, onClose }) => {
  // ═══════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════
  
  // Current assignment index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Map assignmentType to assignment index
  useEffect(() => {
    if (assignmentType) {
      const typeToIndexMap = {
        'family': 1,
        'styling': 2,
        'styling2': 3,
        'ordered-list': 4,
        'unordered-list': 5,
        'definition-list': 6,
        'image': 7,
        'table': 8,
        'links': 9,
        'smartphone': 10,
        'bill': 11,
        'forms': 12,
        'advanced-forms': 13
      };
      
      const mappedIndex = typeToIndexMap[assignmentType] || 0;
      setCurrentIndex(mappedIndex);
    }
  }, [assignmentType]);
  
  // Student's code input
  const [code, setCode] = useState('');
  
  // Live preview output (iframe srcDoc)
  const [liveOutput, setLiveOutput] = useState('');
  
  // Validation results
  const [validationResult, setValidationResult] = useState(null);
  
  // Submission status
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Mark score
  const [marks, setMarks] = useState(0);
  
  // Show preview or assignment
  const [showPreview, setShowPreview] = useState(false);
  
  // Clear all function
  const handleClearAll = useCallback(() => {
    setLiveOutput('');
    setValidationResult(null);
    setIsSubmitted(false);
    setMarks(0);
    saveSubmissionToStorage(code, 0, 'Draft', null);
  }, [code]);

  // ═══════════════════════════════════════════════════════════════════
  // LIFECYCLE: Load submission data from localStorage on component mount
  // ═══════════════════════════════════════════════════════════════════
  useEffect(() => {
    loadSubmissionFromStorage();
  }, [currentIndex]);

  // ═══════════════════════════════════════════════════════════════════
  // localStorage FLOW: Load saved submission data
  // Checks localStorage for existing assignment submission
  // If found, restore code, marks, and submission status
  // ═══════════════════════════════════════════════════════════════════
  const loadSubmissionFromStorage = () => {
    try {
      const stored = localStorage.getItem('lms_assignments');
      const submissions = stored ? JSON.parse(stored) : [];
      
      const currentSubmission = submissions.find(
        sub => sub.assignmentId === ASSIGNMENTS[currentIndex].id
      );

      if (currentSubmission) {
        setCode(currentSubmission.code);
        setMarks(currentSubmission.marks);
        setIsSubmitted(currentSubmission.status === 'Submitted');
        
        // Restore validation result
        if (currentSubmission.validationResult) {
          setValidationResult(currentSubmission.validationResult);
        }
      } else {
        setCode('');
        setMarks(0);
        setIsSubmitted(false);
        setValidationResult(null);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // localStorage FLOW: Save submission data
  // Stores code, marks, status, and validation results
  // Allows resume from where student left off
  // ═══════════════════════════════════════════════════════════════════
  const saveSubmissionToStorage = (updatedCode, updatedMarks, updatedStatus, validation) => {
    try {
      const stored = localStorage.getItem('lms_assignments');
      let submissions = stored ? JSON.parse(stored) : [];

      // Remove existing entry if present
      submissions = submissions.filter(
        sub => sub.assignmentId !== ASSIGNMENTS[currentIndex].id
      );

      // Add new/updated entry
      submissions.push({
        assignmentId: ASSIGNMENTS[currentIndex].id,
        code: updatedCode,
        marks: updatedMarks,
        status: updatedStatus,
        validationResult: validation,
        submittedAt: new Date().toISOString()
      });

      localStorage.setItem('lms_assignments', JSON.stringify(submissions));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // PREVIEW FLOW: Display live preview of student code
  // Called when "Run" button is clicked
  // Updates iframe with student's HTML code in real-time
  // ═══════════════════════════════════════════════════════════════════
  const handleRun = useCallback(() => {
    // Set iframe srcDoc to display student code output
    setLiveOutput(code);
    
    // Update localStorage (auto-save while writing)
    saveSubmissionToStorage(code, marks, 'Draft', null);
  }, [code, marks]);

  // ═══════════════════════════════════════════════════════════════════
  // VALIDATION FLOW: Validate submitted code
  // 1. Call dynamic validator with test cases
  // 2. Calculate marks based on validation results
  // 3. Save to localStorage
  // 4. Mark as submitted
  // ═══════════════════════════════════════════════════════════════════
  const handleSubmit = useCallback(() => {
    // Call the dynamic validator with test cases
    const result = AssignmentValidator.validate(
      code,
      ASSIGNMENTS[currentIndex].testCases
    );

    // Convert to legacy format for compatibility
    const legacyResult = {
      isValid: result.passed,
      score: result.score,
      maxScore: result.maxScore,
      details: result.results.map(r => r.message),
      message: result.passed ? 'All tests passed!' : 'Some tests failed'
    };

    // Update validation result state
    setValidationResult(legacyResult);
    
    // Use the validator's score directly
    const finalMarks = result.score;
    setMarks(finalMarks);
    
    // Mark as submitted
    setIsSubmitted(true);
    
    // Save to localStorage with all submission data
    saveSubmissionToStorage(code, finalMarks, 'Submitted', legacyResult);
    
    // Notify sidebar of assignment completion
    // More lenient completion criteria: any submission with marks >= 50% or any marks > 0
    const completionThreshold = Math.max(1, Math.floor(result.maxScore * 0.5));
    if (finalMarks >= completionThreshold) {
      // Dispatch custom event to notify sidebar
      window.dispatchEvent(new CustomEvent('assignmentCompleted', {
        detail: {
          assignmentId: ASSIGNMENTS[currentIndex].id,
          score: finalMarks,
          maxScore: result.maxScore
        }
      }));
    }
  }, [code, currentIndex]);

  // ═══════════════════════════════════════════════════════════════════
  // NAVIGATION FLOW: Move to next assignment
  // Only enabled after successful submission
  // Updates currentIndex to load next assignment
  // ═══════════════════════════════════════════════════════════════════
  const handleNextAssignment = useCallback(() => {
    if (currentIndex < ASSIGNMENTS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowPreview(false);
    }
  }, [currentIndex]);

  const handleBack = () => {
    if (onClose) {
      onClose();
    }
  };

  // Get current assignment
  const currentAssignment = ASSIGNMENTS[currentIndex];
  const isLastAssignment = currentIndex === ASSIGNMENTS.length - 1;
  const canSubmitNext = isSubmitted;

  return (
    <div className="assignment-editor">
      {/* Header Section */}
      <div className="ae-header">
        <button className="ae-back-btn" onClick={handleBack}>
          ← Back
        </button>
        <div className="ae-title-section">
          <h2>{currentAssignment.title}</h2>
          <span className="ae-badge">{currentAssignment.topic}</span>
        </div>
        <div className="ae-progress">
          <span className="ae-progress-text">
            Assignment {currentIndex + 1} / {ASSIGNMENTS.length}
          </span>
          <div className="ae-progress-bar">
            <div 
              className="ae-progress-fill"
              style={{ width: `${((currentIndex + 1) / ASSIGNMENTS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ae-content">
        {/* Left Panel - Question & Editor */}
        <div className="ae-left-panel">
          <div className="ae-question">
            <h3>Question</h3>
            <p>{currentAssignment.question}</p>
          </div>

          {/* Code Editor */}
          <div className="ae-editor-section">
            <label className="ae-label">Write your HTML code here:</label>
            <textarea
              className="ae-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="<!DOCTYPE html>&#10;<html>&#10;<body>&#10;  <!-- Write your code here -->&#10;</body>&#10;</html>"
              spellCheck="false"
            />
          </div>

          {/* Control Buttons */}
          <div className="ae-button-group">
            <button 
              className="ae-btn ae-btn-primary"
              onClick={handleRun}
            >
              ▶ Run
            </button>
            <button 
              className="ae-btn ae-btn-success"
              onClick={handleSubmit}
              disabled={!code.trim()}
            >
              ✓ Submit
            </button>
            {canSubmitNext && !isLastAssignment && (
              <button 
                className="ae-btn ae-btn-next"
                onClick={handleNextAssignment}
              >
                Next Assignment →
              </button>
            )}
            {isLastAssignment && canSubmitNext && (
              <button 
                className="ae-btn ae-btn-complete"
                disabled
              >
                ✓ All Complete
              </button>
            )}
          </div>

          {/* Submission Status */}
          {isSubmitted && validationResult && (
            <div className={`ae-submission-status ${validationResult.isValid ? 'ae-passed' : 'ae-failed'}`}>
              <h4>
                {validationResult.isValid ? '✓ Passed' : '✗ Needs Improvement'}
              </h4>
              <p className="ae-marks">Marks: {marks} / {validationResult.maxScore}</p>
              <div className="ae-validation-details">
                {validationResult.details.map((detail, idx) => (
                  <p key={idx} className="ae-detail">{detail}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Output Comparison */}
        <div className="ae-right-panel">
          {/* User Output */}
          <div className="ae-output-section">
            <div className="ae-output-header">
              <h3>Your Output</h3>
              <button 
                className="ae-btn ae-btn-clear"
                onClick={handleClearAll}
              >
                🗑️ Clear All
              </button>
            </div>
            <div className="ae-iframe-container">
              <iframe
                className="ae-preview-iframe"
                srcDoc={liveOutput}
                title="User Output"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>

          {/* Expected Output */}
          <div className="ae-output-section ae-expected">
            <h3>Expected Output</h3>
            <div className="ae-iframe-container">
              <iframe
                className="ae-preview-iframe ae-expected-iframe"
                srcDoc={currentAssignment.expectedOutput}
                title="Expected Output"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentEditor;
