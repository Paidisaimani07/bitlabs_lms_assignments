import React, { useState, useEffect } from 'react';
import './assignment.css';
import { useUserContext } from "../../common/UserProvider";

const Assignment = () => {
  const { user } = useUserContext();

  const [assignments, setAssignments] = useState([
    {
      id: 1,
      topic: "First Html Page",
      subButton: "Heading Tags Exercise",
      unlocked: true
    },
    {
      id: 2,
      topic: "Family Description",
      subButton: "Family Members Exercise",
      unlocked: false
    },
    {
      id: 3,
      topic: "CSS Part 1",
      subButton: "Basic CSS Styling",
      unlocked: false
    },
    {
      id: 4,
      topic: "CSS Part 2",
      subButton: "Advanced CSS Styling",
      unlocked: false
    },
    {
      id: 5,
      topic: "Ordered Lists",
      subButton: "Phone Brands List",
      unlocked: false
    },
    {
      id: 6,
      topic: "Unordered Lists",
      subButton: "Car Models List",
      unlocked: false
    },
    {
      id: 7,
      topic: "Definition Lists",
      subButton: "Soft Drink Brands",
      unlocked: false
    },
    {
      id: 8,
      topic: "HTML Images",
      subButton: "Car Image Exercise",
      unlocked: false
    },
    {
      id: 9,
      topic: "HTML Tables",
      subButton: "People Information Table",
      unlocked: false
    },
    {
      id: 10,
      topic: "HTML Links",
      subButton: "Website Navigation",
      unlocked: false
    },
    {
      id: 11,
      topic: "Smartphone Description",
      subButton: "Product Description",
      unlocked: false
    },
    {
      id: 12,
      topic: "Bill Table",
      subButton: "Sample Bill Creation",
      unlocked: false
    },
    {
      id: 13,
      topic: "Registration Forms",
      subButton: "Basic Form Creation",
      unlocked: false
    },
    {
      id: 14,
      topic: "Advanced Forms",
      subButton: "Complex Form Elements",
      unlocked: false
    }
  ]);

  // Load completion status from localStorage on mount
  useEffect(() => {
    loadAssignmentProgress();
    
    // Listen for assignment completion events
    const handleAssignmentCompleted = (event) => {
      console.log('Assignment completed:', event.detail);
      // Reload progress to update unlock status
      loadAssignmentProgress();
    };
    
    window.addEventListener('assignmentCompleted', handleAssignmentCompleted);
    
    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('assignmentCompleted', handleAssignmentCompleted);
    };
  }, []);

  const loadAssignmentProgress = () => {
    try {
      const stored = localStorage.getItem('lms_assignments');
      const submissions = stored ? JSON.parse(stored) : [];
      
      // Get completed assignments (more lenient criteria: any submission with marks)
      const completedAssignments = submissions
        .filter(sub => sub.status === 'Submitted' && sub.marks > 0)
        .map(sub => sub.assignmentId);
      
      // Update unlocked status based on completed assignments
      setAssignments(prevAssignments => {
        return prevAssignments.map((assignment, index) => {
          if (index === 0) {
            // First assignment is always unlocked
            return { ...assignment, unlocked: true };
          }
          
          // Check if previous assignment is completed
          const previousAssignment = prevAssignments[index - 1];
          const isPreviousCompleted = completedAssignments.includes(previousAssignment.id);
          
          return {
            ...assignment,
            unlocked: isPreviousCompleted
          };
        });
      });
    } catch (error) {
      console.error('Error loading assignment progress:', error);
    }
  };

  const isAssignmentLocked = (assignment) => {
    return !assignment.unlocked;
  };

  const handleViewAssignment = (topic, assignment) => {
    // Check if assignment is locked
    if (isAssignmentLocked(assignment)) {
      alert(`Please complete the previous assignment first: "${assignments[assignment.id - 2]?.topic || 'Previous assignment'}"`);
      return;
    }

    const t = topic.trim().toLowerCase();
    const typeMap = {
      "first html page": '',
      "family description": 'family',
      "css part 1": 'styling',
      "css part 2": 'styling2',
      "ordered lists": 'ordered-list',
      "unordered lists": 'unordered-list',
      "definition lists": 'definition-list',
      "html images": 'image',
      "html tables": 'table',
      "html links": 'links',
      "smartphone description": 'smartphone',
      "bill table": 'bill',
      "registration forms": 'forms',
      "advanced forms": 'advanced-forms'
    };
    
    const type = typeMap[t] || '';
    const url = type ? `/assignment/first-html-page?type=${type}` : '/assignment/first-html-page';
    
    window.open(url, '_blank', 'width=1000,height=800');
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
                className={`assignment-item ${isAssignmentLocked(assignment) ? 'locked' : 'unlocked'}`}
              >
                <div className="assignment-content">
                  <div className="assignment-title-container">
                    <span className="assignment-title">
                      {assignment.topic}
                    </span>
                    {isAssignmentLocked(assignment) && (
                      <span className="lock-indicator">🔒</span>
                    )}
                    {!isAssignmentLocked(assignment) && (
                      <span className="unlock-indicator">🔓</span>
                    )}
                  </div>
                </div>

                <div className="assignment-actions">
                  <button
                    className={`mark-done-btn ${isAssignmentLocked(assignment) ? 'locked' : 'pending'}`}
                    onClick={() => handleViewAssignment(assignment.topic, assignment)}
                    disabled={isAssignmentLocked(assignment)}
                  >
                    {isAssignmentLocked(assignment) ? '🔒 Locked' : 'View Assignment'}
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
