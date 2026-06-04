import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './assignment.css';
import { useUserContext } from "../../common/UserProvider";

const Assignment = () => {
    const { user } = useUserContext();
    const location = useLocation();
    const currentPath = location.pathname.toLowerCase();

    // Full set of HTML/CSS assignments
    const HTML_CSS_ASSIGNMENTS = [
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
        }
    ];
    // Full set of SQL assignments
    const SQL_ASSIGNMENTS = [
        {
            id: 501,
            topic: "Employee Table",
            subButton: "Create Employee Table",
            unlocked: true
        },
        {
            id: 502,
            topic: "Employee Data",
            subButton: "Insert Employee Data",
            unlocked: false
        },
        {
            id: 503,
            topic: "Employee & Sales",
            subButton: "Join Operations",
            unlocked: false
        },
        {
            id: 504,
            topic: "Customer Sales",
            subButton: "Customer Sales Query",
            unlocked: false
        },
        {
            id: 505,
            topic: "Student",
            subButton: "Student Details Query",
            unlocked: false
        },
        {
            id: 506,
            topic: "Customer Table",
            subButton: "Customer Table Creation",
            unlocked: false
        },
        {
            id: 507,
            topic: "Sales, Customers & Orders",
            subButton: "Complex Joins",
            unlocked: false
        },
        {
            id: 508,
            topic: "Customer Sub-queries",
            subButton: "Sub-query Exercise",
            unlocked: false
        },
        {
            id: 509,
            topic: "Banks",
            subButton: "Banks Query",
            unlocked: false
        }
    ];


    // Course-specific assignments - allow navigation but control assignment content
    const getCourseAssignments = () => {
        // Requirement 3: Use exact route matching with an array
        const htmlAllowedRoutes = [
            '/courses/html',
            '/courses/css',
            '/course/html', // Added to ensure compatibility with existing singular routes
            '/course/css',  // Added to ensure compatibility with existing singular routes
            '/assignment/first-html-page'
        ];
        // SQL routes
        const sqlAllowedRoutes = [
            '/courses/sql',
            '/course/sql'
        ];

         if (htmlAllowedRoutes.some(route => currentPath.startsWith(route))) {
            console.log("HTML/CSS course - showing full assignments");
            return [...HTML_CSS_ASSIGNMENTS];
        }
          if (sqlAllowedRoutes.some(route => currentPath.startsWith(route))) {
            return [...SQL_ASSIGNMENTS];
        }
        
        return [];
    };

    const [assignments, setAssignments] = useState([]);

    // Requirement 7: Update assignments dynamically whenever location.pathname changes
    useEffect(() => {
        const courseAssignments = getCourseAssignments();
        setAssignments(courseAssignments);

        // Requirement 6: Preserve progress tracking
        if (courseAssignments.length > 0) {
            loadAssignmentProgress();
        }
    }, [location.pathname]);

    // Load completion status from localStorage
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

            // Get completed assignments (criteria: any submission with Submitted status)
            const completedAssignments = submissions
                .filter(sub => sub.status === 'Submitted')
                .map(sub => sub.assignmentId);

            // Update unlocked status based on completed assignments
            setAssignments(prevAssignments => {
                if (prevAssignments.length === 0) return [];

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
        // Check if assignments are available for current course
        if (assignments.length === 0) {
            alert('No assignments available for this course yet.');
            return;
        }

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
            
            // SQL Map
            "employee table": "employee_table",
            "employee data": "employee_data",
            "employee & sales": "employee_sales",
            "customer sales": "customer_sales",
            "student": "student",
            "customer table": "customer_table",
            "sales, customers & orders": "sales_customers_orders",
            "customer sub-queries": "customer_sub_queries",
            "banks": "banks"
        };

        const type = typeMap[t] || '';
        const url = type ? `/assignment/first-html-page?type=${type}` : '/assignment/first-html-page';

        // Requirement 8: Ensure window.open() behavior continue working correctly
        window.open(url, '_blank', 'width=1000,height=800');
    };

    return (
        <div className="assignment-container">
            <div className="assignment-header">
                <h2>Assignments</h2>
            </div>

            <div className="assignment-sidebar">
                {assignments.length === 0 ? (
                    <div className="no-assignments-message">
                        <h3>No Assignments Available</h3>
                        <p>Assignments were not uploaded for this course.</p>
                    </div>
                ) : (
                    assignments.map((topic) => (
                        <div
                            key={topic.id}
                            className={`assignment-item ${isAssignmentLocked(topic) ? 'locked' : 'unlocked'}`}
                        >
                            <div className="assignment-content">
                                <div className="assignment-title-container">
                                    <span className="assignment-title">
                                        {topic.topic}
                                    </span>
                                    {isAssignmentLocked(topic) && (
                                        <span className="lock-indicator">🔒</span>
                                    )}
                                    {!isAssignmentLocked(topic) && (
                                        <span className="unlock-indicator">🔓</span>
                                    )}
                                </div>
                            </div>

                            <div className="assignment-actions">
                                <button
                                    className={`mark-done-btn ${isAssignmentLocked(topic) ? 'locked' : 'pending'}`}
                                    onClick={() => handleViewAssignment(topic.topic, topic)}
                                    disabled={isAssignmentLocked(topic)}
                                >
                                    {isAssignmentLocked(topic) ? '🔒 Locked' : 'View Assignment'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Assignment;
