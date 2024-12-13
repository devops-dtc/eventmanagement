// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { USER_ROLES } from '../utils/constants';
import api from '../services/api';

const AuthContext = createContext(null);

const anonymousUser = {
  id: 'anonymous',
  name: 'Guest User',
  role: 'Anonymous',
  email: null
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(anonymousUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and user data on component mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Validate token with backend
      validateToken();
    } else {
      setUser(anonymousUser);
    }
    setLoading(false);
  }, []);

  const validateToken = async () => {
    try {
      const response = await api.get('/auth/validate-token');
      setUser(response.data.user);
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user: userData } = response.data;

      // Validate user role
      if (!userData.role || !Object.values(USER_ROLES).includes(userData.role)) {
        throw new Error('Invalid user role');
      }

      // Ensure all required fields are present
      const requiredFields = ['id', 'name', 'role', 'email'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user: newUser } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);

      return newUser;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(anonymousUser);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Optional: Call backend logout endpoint
    api.post('/auth/logout').catch(console.error);
  };

  const isAuthenticated = () => {
    return user && user.role !== 'Anonymous' && localStorage.getItem('token');
  };

  const hasRole = (roles) => {
    if (!Array.isArray(roles)) {
      roles = [roles];
    }
    return isAuthenticated() && roles.includes(user.role);
  };

  const updateUser = async (updates) => {
    try {
      const response = await api.put('/users/profile', updates);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      const { token } = response.data;
      localStorage.setItem('token', token);
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const contextValue = {
    user,
    login,
    logout,
    register,
    isAuthenticated,
    hasRole,
    updateUser,
    refreshToken,
    loading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
