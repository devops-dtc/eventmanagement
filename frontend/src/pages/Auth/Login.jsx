import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormInput from '../../components/FormInput/FormInput';
import Button from '../../components/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Register.css';  // Keeping your original CSS import

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

  // Add redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.userType
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update auth context
        await login(data.user);
        
        toast.success(data.message || 'Login successful!');
        
        // Navigate to the intended page or home
        const redirectTo = location.state?.from?.pathname || '/';
        navigate(redirectTo, { replace: true });
      } else {
        toast.error(data.message || 'Login failed');
        setErrors(prev => ({
          ...prev,
          submit: data.message || 'Login failed'
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
    }
  };

  return (
    <div className="register-container">  {/* Keeping your original className */}
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
            <option value="Admin">Admin</option>
            <option value="Organizer">Organizer</option>
            <option value="Attendee">Attendee</option>
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
          {isLoading ? 'Signing in...' : 'Log in'}
        </Button>
      </form>
    </div>
  );
};

export default Login;
