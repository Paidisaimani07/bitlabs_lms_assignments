import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import './RecruiterHackathonViewRegistrations.css';
const formatDateFromArray = (dateArray) => {
  if (!dateArray || !Array.isArray(dateArray)) return '';
  const [year, month = 1, day = 1] = dateArray;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function RecruiterHackathonViewRegistrations({ hackathonId }) {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [hackathon, setHackathon] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [declaringWinner, setDeclaringWinner] = useState(null);

  useEffect(() => {
    if (!hackathonId) return;
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;

    const fetchData = async () => {
      try {
        setLoading(true);
        const regsResp = await axios.get(`${apiUrl}/hackathons/${hackathonId}/getAllHackathonRegistrations`);
        setRegistrations(regsResp.data || []);

        const candidateOrRecruiterId = user?.id || 0;
        const detailsResp = await axios.get(`${apiUrl}/api/hackathons/getHackathonDetails/${hackathonId}/${candidateOrRecruiterId}`);
        setHackathon(detailsResp.data || null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching hackathon details/registrations', err);
        setError('Failed to load hackathon data');
        setLoading(false);
      }
    };

    fetchData();
  }, [hackathonId, user?.id]);

  if (!hackathonId) {
    return (
      <div className="rh-view-registrations">
        <p>No hackathon selected.</p>
        <button onClick={() => navigate('/recruiter-hackathons')}>Back</button>
      </div>
    );
  }


  const handleViewSubmissions = (registration) => {
    console.log('View submissions for:', registration);
  };

  const formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return '';
    const [year, month = 1, day = 1] = dateArray;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDeclareWinner = async (registration) => {
    if (!window.confirm(`Are you sure you want to declare ${registration.name} as the winner?`)) {
      return;
    }

    try {
      setDeclaringWinner(registration.id);
      const jwtToken = localStorage.getItem('jwtToken');
      await axios.post(
        `${apiUrl}/api/hackathons/${hackathonId}/declare-winner/${registration.userId}`,
        {},
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      const candidateOrRecruiterId = user?.id || 0;
      const detailsResp = await axios.get(`${apiUrl}/api/hackathons/getHackathonDetails/${hackathonId}/${candidateOrRecruiterId}`);
      setHackathon(detailsResp.data || null);
      alert(`${registration.name} has been declared as the winner!`);
    } catch (err) {
      console.error('Error declaring winner:', err);
      alert('Failed to declare winner. Please try again.');
    } finally {
      setDeclaringWinner(null);
    }
  };

  if (loading) return <div className="rh-view-registrations">Loading...</div>;
  if (error) return <div className="rh-view-registrations">{error}</div>;

  return (
    <div className="dashboard__content rh-view-registrations">
      <div className="hackathon-details-wrapper rh-hackathon-details-wrapper">
        <div className="hackathon-top-section rh-hackathon-top-section">
          <h1 className="hackathon-title rh-hackathon-title">{hackathon.title}</h1>
        </div>

        <div className="hackathon-body rh-hackathon-body">
          <div className="hackathon-left-column rh-hackathon-left-column">
            <section>
              <h3>About the Hackathon</h3>
              <p>{hackathon.description}</p>
            </section>

            <section>
              <h3>Instructions</h3>
              <div dangerouslySetInnerHTML={{ 
                __html: hackathon.instructions?.replace(/\n/g, '<br />') || 'No instructions provided.' 
              }} />
            </section>
          </div>

          <div className="hackathon-right-column rh-hackathon-right-column">
            <div className="hackathon-banner-wrapper rh-hackathon-banner-wrapper">
              <img 
                src={hackathon.bannerUrl} 
                alt={hackathon.title} 
                className="hackathon-banner rh-hackathon-banner"
                onError={(e) => (e.target.src = "https://via.placeholder.com/900x300?text=No+Image")}
              />
              <span className={`hackathon-status-badge rh-hackathon-status-badge ${hackathon.status.toLowerCase()}`}>
                {hackathon.status}
              </span>
            </div>

            <div className="hackathon-info-box rh-hackathon-info-box">
              <div>
                <h3>Organized By</h3>
                <p>{hackathon.company}</p>
              </div>
              <div>
                <h3>Start Date</h3>
                <p>{formatDate(hackathon.startAt)}</p>
              </div>
              <div>
                <h3>End Date</h3>
                <p>{formatDate(hackathon.endAt)}</p>
              </div>
              {hackathon.winner && (
                <div>
                  <h3>Winner</h3>
                  <p>{hackathon.winner}</p>
                </div>
              )}
              <div className="hackathon-stats rh-hackathon-stats">
                <div className="stat-item rh-stat-item">
                  <div className="stat-value rh-stat-value">{hackathon.registrationCount || 0}</div>
                  <div className="stat-label rh-stat-label">Registrations</div>
                </div>
                <div className="stat-item rh-stat-item">
                  <div className="stat-value rh-stat-value">{hackathon.submissionCount || 0}</div>
                  <div className="stat-label rh-stat-label">Submissions</div>
                </div>
                <div className="hackathon-tech-tag rh-hackathon-tech-tag">
                  {hackathon.allowedTechnologies || 'Any Tech'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="registrations-section">
        <h2>Registrations</h2>
        {registrations.length === 0 ? (
          <p className="no-registrations">No registrations yet.</p>
        ) : (
          <div className="registrations-table-container">
            <table className="registrations-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Registered At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration, index) => (
                  <tr key={registration.id}>
                    <td>{index + 1}</td>
                    <td>{registration.name || `User ${registration.userId}`}</td>
                    <td>
                      {registration.registeredAt 
                        ? formatDateTime(registration.registeredAt)
                        : 'N/A'}
                    </td>
                    <td>
                      <span className={`registrations-table ${registration.submitStatus ? 'submitted' : 'not-submitted'}`}>
                        {registration.submitStatus ? 'Submitted' : 'Not Submitted'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {registration.submitStatus && (
                        <button 
                          className="registrations-table view-submissions-btn"
                          onClick={() => handleViewSubmissions(registration)}
                        >
                          View Submission
                        </button>
                      )}
                      {hackathon.status === 'ACTIVE' && !hackathon.winner && (
                        <button 
                          className={`registrations-table declare-winner-btn ${declaringWinner === registration.id ? 'loading' : ''}`}
                          onClick={() => handleDeclareWinner(registration)}
                          disabled={declaringWinner === registration.id}
                        >
                          {declaringWinner === registration.id ? 'Declaring...' : 'Declare Winner'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="actions-section">
        <button 
          className="back-button"
          onClick={() => navigate('/recruiter-hackathons')}
        >
          Back to Hackathons
        </button>
      </div>
    </div>
  );
}

export default RecruiterHackathonViewRegistrations;
