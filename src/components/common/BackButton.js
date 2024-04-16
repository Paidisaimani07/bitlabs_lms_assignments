import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import leftArrow from '../../images/arrow-left.png';
 
const BackButton = () => {
  const navigate = useNavigate();
 
  const handleClick = () => {
    navigate(-1); // Navigate back to the previous page
  };
 
  return (
    <div className="back-to-previous pb-4">
      <Link to="#" className="back-link" onClick={handleClick}>
        <img src={leftArrow} alt="Back" /> BACK
      </Link>
    </div>
  );
};
 
export default BackButton;