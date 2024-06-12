import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';

const BasicDetailsEditPopup = ({ applicantDetails }) => {
  const [formValues, setFormValues] = useState({
    firstName: applicantDetails.firstName || '',
    lastName: applicantDetails.lastName || '',
    email: applicantDetails.email || '',
    alternatePhoneNumber: applicantDetails.alternatePhoneNumber || '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const user1 = useUserContext();
  const user = user1.user;

  const validateInput = (name, value) => {
    let error = '';
    if (!value) {
      var formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      if (name === 'alternatePhoneNumber') {
       formattedName = 'Mobile number';
    }
      error=`${formattedName} is required.`;
      // error = `${name} is required.`;
    } else {
      if (name === 'firstName' || name === 'lastName') {
        if (value.length < 3) {
          error = `${name === 'firstName' ? 'First' : 'Last'}name should be at least 3 characters.`;
        } else if (!/^[a-zA-Z]+$/.test(value)) {
          error = `${name === 'firstName' ? 'First' : 'Last'}name should contain only letters.`;
        }
      } else if (name === 'alternatePhoneNumber') {
        if (!/^[6789]\d{9}$/.test(value)) {
          error = 'Mobile number should be 10 digits, starting with 6, 7, 8, or 9.';
        }
      } else if (name === 'email') {
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
          error = 'Invalid email address.';
        }
      }
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    setErrors({ ...errors, [name]: validateInput(name, value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formValues).forEach((key) => {
      const error = validateInput(key, formValues[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.put(`${apiUrl}/applicantprofile/${user.id}/basic-details`, formValues, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (response.status === 200) {
          window.alert('Basic details updated successfully!');
          window.location.reload();
        } else {
          console.error('An error occurred:', response.status, response.statusText);
          window.alert("Failed to update basic details.");
        }
      } catch (error) {
        console.error('An error occurred:', error);
        window.alert("Failed to update basic details due to an error.");
      }
    }
  };

  return (
    <div className="basic-details-edit-popup">
       <div className='popup-heading'>Personal Details
      
      </div>
      <div className="input-container-basicdetails">
        <div className="input-wrapper">
       
          <input
            type="text"
            name="firstName"
            placeholder="*Firstname"
            value={formValues.firstName}
            onChange={handleInputChange}
            className="input-form"
            required
          />
          {errors.firstName && <div className="error-message">{errors.firstName}</div>}
        </div>

        <div className="input-wrapper">
          <input
            type="text"
            name="lastName"
            placeholder="*Lastname"
            value={formValues.lastName}
            onChange={handleInputChange}
            className="input-form"
            required
          />
          {errors.lastName && <div className="error-message">{errors.lastName}</div>}
        </div>

        <div className="input-wrapper">
          <input
            type="email"
            placeholder="*Email"
            value={formValues.email}
            // className="input-form"
           className="input-form disabled-input"
            disabled
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="input-wrapper">
          <input
            type="tel"
            name="alternatePhoneNumber"
            placeholder="*Mobilenumber"
            value={formValues.alternatePhoneNumber}
            onChange={handleInputChange}
            className="input-form"
            required
          />
          {errors.alternatePhoneNumber && <div className="error-message">{errors.alternatePhoneNumber}</div>}
        </div>
     <div >
        <button
        type="button"
        onClick={handleSubmit}
        className="btn-3"
        style={{
          backgroundColor: '#F97316',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '5px',
          textTransform:'capitalize',
          height: '48px',
          // marginLeft:'80%'
          
          
        }}
      >
        Save Changes
      </button>
      </div>
      
      </div>
    </div>
  );
};

export default BasicDetailsEditPopup;
