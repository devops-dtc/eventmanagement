import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormInput from '../../components/FormInput/FormInput';
import Button from '../../components/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Register.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    userType: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    console.group('Login Page Authentication Check');
    console.log('Authentication status:', isAuthenticated());
    console.log('Redirect URL:', location.state?.from?.pathname);

    if (isAuthenticated()) {
      const redirectUrl = location.state?.from?.pathname || '/';
      console.log('Redirecting to:', redirectUrl);
      navigate(redirectUrl, { replace: true });
    }
    console.groupEnd();
  }, [isAuthenticated, navigate, location]);

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
    console.group('Form Validation');
    const newErrors = {};
    
    if (!formData.userType) {
      newErrors.userType = 'User type is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Form is valid:', isValid);
    console.groupEnd();
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.group('Login Submission');
    console.log('Form data:', { ...formData, password: '****' });

    if (!validateForm()) {
      console.log('Form validation failed');
      console.groupEnd();
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
        role: formData.userType
      });

      console.log('Login response:', response);

      if (response.success) {
        toast.success('Login successful!');
        
        // Navigate to the intended page or home
        const redirectUrl = location.state?.from?.pathname || '/';
        console.log('Redirecting to:', redirectUrl);
        navigate(redirectUrl, { replace: true });
      } else {
        toast.error(response.error || 'Login failed');
        setErrors(prev => ({
          ...prev,
          submit: response.error || 'Login failed'
        }));
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      setErrors(prev => ({
        ...prev,
        submit: 'Login failed. Please try again.'
      }));
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  };

  // Prevent form submission while loading
  const handleFormSubmit = (e) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    handleSubmit(e);
  };

  return (
    <div className="register-container">
      <div className="logo">easyevent</div>
      <form className="form-container" onSubmit={handleFormSubmit}>
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
            className={`form-select ${errors.userType ? 'error' : ''}`}
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="" disabled>Select User Type</option>
            <option value="Admin">Admin</option>
            <option value="Organizer">Organizer</option>
            <option value="Attendee">Attendee</option>
          </select>
          {errors.userType && (
            <div className="error-message">{errors.userType}</div>
          )}
        </div>

        <FormInput
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={isLoading}
          required
        />

        <FormInput
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          disabled={isLoading}
          required
        />

        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}

        <Button
          type="submit"
          className="submit-button"
          disabled={isLoading}
          loading={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Log in'}
        </Button>
      </form>
    </div>
  );
};

export default Login;
