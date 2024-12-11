// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormInput from '../../components/FormInput/FormInput';
import Button from '../../components/Button/Button';
import { USER_ROLES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Register.css'; // Using the same CSS file

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

    // Backend login logic (commented for future implementation)
    /*
    try {
      const response = await loginUser(formData);
      login(response.user);
      toast.success('Login successful!');
      navigate(response.user.role === USER_ROLES.ATTENDEE ? '/events' : '/organizer-events');
    } catch (error) {
      toast.error(error.message);
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));
    }
    */

    // Dummy login logic
    try {
      const dummyUsers = {
        'attendee@test.com': { 
          id: '1', 
          name: 'Test Attendee', 
          role: USER_ROLES.ATTENDEE, 
          email: 'attendee@test.com' 
        },
        'organizer@test.com': { 
          id: '2', 
          name: 'Test Organizer', 
          role: USER_ROLES.ORGANIZER, 
          email: 'organizer@test.com' 
        },
        'admin@test.com': { 
          id: '3', 
          name: 'Test Admin', 
          role: USER_ROLES.SUPER_ADMIN, 
          email: 'admin@test.com' 
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = dummyUsers[formData.email];
      if (user && user.role === formData.userType) {
        login(user);
        toast.success('Login successful!');
        navigate(user.role === USER_ROLES.ATTENDEE ? '/attendee-events' : '/organizer-events');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast.error(error.message);
      setErrors(prev => ({
        ...prev,
        submit: error.message
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
