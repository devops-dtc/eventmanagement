// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormInput from '../../components/FormInput/FormInput';
import Button from '../../components/Button/Button';
import { USER_ROLES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api'; // Add this import
import '../../styles/Register.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    userType: '',
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
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Call your backend API
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
        userType: formData.userType
      });

      // Format the user data to match your frontend structure
      const userData = {
        id: response.data.user.UserID,
        name: response.data.user.UserFullname,
        role: response.data.user.UserType,
        email: response.data.user.UserEmail
      };

      // Store the token
      localStorage.setItem('token', response.data.token);

      // Login using context
      login(userData);
      
      toast.success('Login successful!');

      // Redirect based on user role
      switch (userData.role) {
        case USER_ROLES.SUPER_ADMIN:
          navigate('/admin-dashboard');
          break;
        case USER_ROLES.ORGANIZER:
          navigate('/organizer-dashboard');
          break;
        case USER_ROLES.ATTENDEE:
          navigate('/home');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Invalid credentials');
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.message || 'Login failed'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="logo">easyevent</div>
      <form className="form-container" onSubmit={handleSubmit}>
        <h1 className="heading">Welcome back!</h1>
        <p className="login-text">
          Don't have an account?{' '}
          <a 
            href="/register" 
            className="login-link"
            onClick={(e) => {
              e.preventDefault();
              navigate('/register');
            }}
          >
            Sign up
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
          log in
        </Button>
      </form>
    </div>
  );
};

export default Login;
