import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ClearStorageAndRoute = ({ to }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear local storage
    localStorage.clear();
    // Navigate to the desired route
    navigate(to, { replace: true });
  }, [navigate, to]);

  return null;
};

export default ClearStorageAndRoute;
