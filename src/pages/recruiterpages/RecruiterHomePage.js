import React from 'react';
import { BrowserRouter as Router, Route, Routes,Outlet } from 'react-router-dom';
import { Link, useLocation,useParams } from 'react-router-dom';
import RecruiterNavBar from '../../components/recruitercomponents/RecruiterNavBar';
import { useState } from 'react';
import RecruiterDashboard from '../../components/recruitercomponents/RecruiterDashboard';
import ApplicantFooter from '../../components/applicantcomponents/ApplicantFooter';
import RecruiterMyOrganization from '../../components/recruitercomponents/RecruiterMyOrganization';
import RecruiterPostJob from '../../components/recruitercomponents/RecruiterPostJob';
import RecruiterJobOpenings from '../../components/recruitercomponents/RecruiterJobOpenings';
import RecruiterAllApplicants from '../../components/recruitercomponents/RecruiterAllApplicants';
import RecruiterAppliedApplicants from '../../components/recruitercomponents/RecruiterAppliedApplicants';
import RecruiterApplicantInterviews from '../../components/recruitercomponents/RecruiterApplicantInterviews';
import RecruiterChangePassword from '../../components/recruitercomponents/RecruiterChangePassword';
import TeamMember from '../../components/recruitercomponents/TeamMember';
import RecruiterEditJob from '../../components/recruitercomponents/RecruiterEditJob';
import JobApplicantAlerts from '../../components/recruitercomponents/JobApplicantAlerts';
import Recruiterviewapplicant from '../../components/recruitercomponents/Recruiterviewapplicant';
import AppliedApplicantsBasedOnJobs from '../../components/recruitercomponents/AppliedApplicantsBasedOnJobs';
import ViewApplicantResume from '../../components/recruitercomponents/ViewApplicantResume';
import RecruiterViewJob from '../../components/recruitercomponents/RecruiterViewJob';
import RecruiterRepostJob from '../../components/recruitercomponents/RecruiterRepostJob';

function RecruiterHomePage() {
  const [activeRoute, setActiveRoute] = useState('');
  const location = useLocation();
  const [selectedJobId, setSelectedJobId] = useState('');
  const { id } = useParams();
  const updateActiveRoute = () => {
    const pathname = location.pathname;
    
    console.log(pathname);
    switch (pathname) {
      case '/recruiterhome':
        setActiveRoute('dashboard');
        break;
        case '/recruiter-my-organization':
          setActiveRoute('organization');
          break;
          case '/recruiter-postjob':
            setActiveRoute('postjob');
            break;
            case '/recruiter-jobopenings':
              setActiveRoute('jobopenings');
              break;
              case '/recruiter-appliedapplicants':
                setActiveRoute('appliedapplicants');
                break;
                case '/recruiter-allapplicants':
                setActiveRoute('allapplicants');
                break;
                case '/recruiter-applicantinterviews':
                  setActiveRoute('applicantinterviews');
                  break;
                  case '/recruiter-change-password':
                  setActiveRoute('changepassword');
                  break;
                  case '/recruiter-team-member':
                    setActiveRoute('teammember');
                    break;
                  case `/recruiter-edit-job/${id}`:
                    setActiveRoute(`RecruiterEditJob-${id}`);
                    break;
                    case '/job-applicant-alerts':
                      setActiveRoute('alerts');
                      break;
                      case `/viewapplicant/${id}`:
                       setActiveRoute(`viewapplicant-${id}`);
                     break;
                     case `/appliedapplicantsbasedonjob/${id}`:
                       setActiveRoute(`appliedapplicantsbasedonjob-${id}`);
                     break;
                     case `/view-resume/${id}`:
                       setActiveRoute(`view-resume-${id}`);
                     break;
                     case '/recruiter-view-job':
                    setActiveRoute('recviewjob');
                    break;
                    case `/recruiter-repost-job/${id}`:
                    setActiveRoute(`RecruiterRepostJob-${id}`);
                    break;

      default:
        setActiveRoute('');
        break;
    }
  };
  React.useEffect(() => {
    updateActiveRoute();
  }, [location.pathname]);
  return (
    <div  class="dashboard show ">
    <RecruiterNavBar />
     {activeRoute === 'dashboard' && <RecruiterDashboard />}
     {activeRoute === 'organization' && <RecruiterMyOrganization />}
     {activeRoute === 'postjob' && <RecruiterPostJob />}
     {activeRoute === 'jobopenings' && <RecruiterJobOpenings setSelectedJobId={setSelectedJobId} />}
     {activeRoute === 'appliedapplicants' && <RecruiterAppliedApplicants selectedJobId={selectedJobId} />}
     {activeRoute === 'allapplicants' && <RecruiterAllApplicants />}
     {activeRoute === 'applicantinterviews' && <RecruiterApplicantInterviews />}
     {activeRoute === 'changepassword' && <RecruiterChangePassword />}
     {activeRoute === 'teammember' && <TeamMember />}
     {activeRoute === 'recviewjob' && <RecruiterViewJob selectedJobId={selectedJobId} />}
    {activeRoute.startsWith('RecruiterEditJob-') && id && <RecruiterEditJob selectedJobId={id}/>}
    {activeRoute.startsWith('RecruiterRepostJob-') && id && <RecruiterRepostJob selectedJobId={id}/>}
    {activeRoute === 'alerts' && <JobApplicantAlerts />}
    {activeRoute.startsWith('viewapplicant-')  && id && <Recruiterviewapplicant id={id} />}
    {activeRoute.startsWith('appliedapplicantsbasedonjob-')  && id && <AppliedApplicantsBasedOnJobs id={id} />}
    {activeRoute.startsWith('view-resume-')  && id && <ViewApplicantResume id={id} />}
    </div>
  )
}

export default RecruiterHomePage;