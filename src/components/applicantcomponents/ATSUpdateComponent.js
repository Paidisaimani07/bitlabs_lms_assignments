import React from "react";
import { useUserContext } from "../common/UserProvider";
import ApplicantHeaderComponent from "./ApplicantHeaderComponent";
import ResumeSummaryCard from "./ResumeSummaryCard";
import PersonalDetailsCard from "./PersonalDetailsCard";
import EducationDetailsCard from "./EducationDetailsCard";
import ProjectDetailsCard from "./ProjectDetailsCard";
import KeySkillsCard from "./KeySkillsCard";
import SkillBadgesGrid from "./SkillBadgesGrid";
import "./ATSUpdateComponent.css";


const ATSUpdateComponent = () => { 
    const { user } = useUserContext();
    const applicantId = user?.id;

  return (
        <div className="ats-update-container">
            <div className="ats-update-header">
                <h2 className="ats-update-title">Update your resume</h2>
            </div>
            <div className="ats-update-content">
                <ResumeSummaryCard applicantId={applicantId} />
                <PersonalDetailsCard applicantId={applicantId} />
                <EducationDetailsCard applicantId={applicantId} />
                <ProjectDetailsCard applicantId={applicantId} />
                <KeySkillsCard applicantId={applicantId} />
                <SkillBadgesGrid applicantId={applicantId} />
            </div>
        </div>
    );
};

export default ATSUpdateComponent;
