// src/pages/Auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormInput from '../../components/FormInput/FormInput';
import Button from '../../components/Button/Button';
import { USER_ROLES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Register.css';
import { registerUser } from "../../services/auth.service";


const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
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
      const response = await registerUser(formData);
      const newUser = response;
      login(newUser);
      toast.success('Registration successful!');
      navigate(newUser.role === USER_ROLES.ATTENDEE ? '/events' : '/organizer-events');
    } catch (error) {
      toast.error(error.message);
      setErrors((prev) => ({
        ...prev,
        submit: error.message,
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

        <FormInput
          type="text"
          name="fullname"
          placeholder="Full name"
          value={formData.fullname}
          onChange={handleChange}
          error={errors.fullname}
        />

        <FormInput
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <FormInput
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        {errors.submit && <div className="submit-error">{errors.submit}</div>}

        <Button
          type="submit"
          loading={isLoading}
        >
          sign up
        </Button>
      </form>
    </div>
  );
};

export default Register;
