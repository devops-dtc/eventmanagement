// Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { USER_ROLES } from '../../constants/userRoles';
import { validateEmail } from '../../utils/validation';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userType: '',
    fullname: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userType) newErrors.userType = 'User type is required';
    if (!formData.fullname) newErrors.fullname = 'Full name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        formData
      );

      if (response.data.success) {
        toast.success('Registration successful!');
        navigate('/login');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="logo">easyevent</div>
      <form className="form-container" onSubmit={handleSubmit}>
        <h1 className="heading">Cheers ahead!</h1>
        <p className="login-text">
          Already have an account?{' '}
          <a 
            href="/login" 
            className="login-link"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            Log in
          </a>
        </p>

        <div className="input-container">
          <select
            className="form-select"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
          >
            <option value="" disabled>User Type</option>
            <option value={USER_ROLES.SUPER_ADMIN}>Super Admin</option>
            <option value={USER_ROLES.ORGANIZER}>Organizer</option>
            <option value={USER_ROLES.ATTENDEE}>Attendee</option>
          </select>
          {errors.userType && <div className="error-message">{errors.userType}</div>}
        </div>

        <div className="input-container">
          <input
            className="form-input"
            type="text"
            name="fullname"
            placeholder="fullname"
            value={formData.fullname}
            onChange={handleChange}
          />
          {errors.fullname && <div className="error-message">{errors.fullname}</div>}
        </div>

        <div className="input-container">
          <input
            className="form-input"
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="input-container">
          <input
            className="form-input"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
        </div>

        {errors.submit && <div className="submit-error">{errors.submit}</div>}

        <button
          className="submit-button"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Signing up...' : 'sign up'}
        </button>
      </form>
    </div>
  );
};

export default Register;
