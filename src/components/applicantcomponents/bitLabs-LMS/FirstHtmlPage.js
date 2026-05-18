import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AssignmentEditor from './AssignmentEditor';
import './FirstHtmlPage.css';

/**
 * FirstHtmlPage.js
 * 
 * Component for displaying HTML/CSS/Forms assignment exercises
 * Uses new modern AssignmentEditor component for interactive learning
 * 
 * Features:
 * - Modern code editor with real-time preview
 * - Automated validation and scoring
 * - localStorage persistence
 * - Side-by-side output comparison
 * - Sequential assignment navigation
 */

const FirstHtmlPage = ({ type: propType, onClose, applicantId }) => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const type = propType || queryParams.get('type');

    // Use prop if available, otherwise try to get from global or default
    const effectiveApplicantId = applicantId || 101;

    const handleBack = () => {
        if (onClose) {
            onClose();
        } else if (window.opener) {
            window.close();
        } else {
            window.parent.postMessage({ action: 'closeModal' }, '*');
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // Use Modern Assignment Editor for all assignments
    // This replaces the old static preview system with an interactive
    // coding workflow including validation and scoring
    // ═══════════════════════════════════════════════════════════════════
    return (
        <div className="first-html-page">
            <AssignmentEditor
                assignmentType={type}
                onClose={handleBack}
                applicantId={effectiveApplicantId}
            />
        </div>
    );
};

export default FirstHtmlPage;
