import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { SkillBadgeCard } from './VerifiedBadges'; // re-use your card

const SkillBadgesGrid = () => {
  const { user } = useUserContext();
  const [data, setData] = useState({ skillsRequired: [], applicantSkillBadges: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const jwt = localStorage.getItem('jwtToken');
        const res = await axios.get(`${apiUrl}/skill-badges/${user.id}/skill-badges`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        setData(res.data || { skillsRequired: [], applicantSkillBadges: [] });
      } catch (e) {
        console.error('Failed to load skill badges', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user.id]);

  if (loading) return null;

  return (
    <div className="skill-badges-grid">
  {data.applicantSkillBadges
  .filter((b) => {
    const status = (b?.status || b?.flag || "").toLowerCase();
    return status === "passed" || status === "failed";
  })
  .map((b) => (
    <SkillBadgeCard
      key={`app-${b.id}`}
      skillName={b.skillBadge?.name}
      status={(b?.status || b?.flag || "").toLowerCase()}
      testFailedAt={b.test_taken}
    />
  ))}



    </div>
  );
};

export default SkillBadgesGrid;
