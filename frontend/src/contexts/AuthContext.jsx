// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { USER_ROLES } from '../utils/constants';

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
    // Check for stored user data on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(anonymousUser);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
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

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(anonymousUser);
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return user && user.role !== 'Anonymous';
  };

  const hasRole = (roles) => {
    if (!Array.isArray(roles)) {
      roles = [roles];
    }
    return isAuthenticated() && roles.includes(user.role);
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Mock user data for testing - you can comment this out in production
  useEffect(() => {
    if (user.role === 'Anonymous') {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        role: USER_ROLES.ATTENDEE, // or USER_ROLES.ORGANIZER for testing different roles
        email: 'john@example.com'
      };
      login(mockUser);
    }
  }, []);

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
    isAuthenticated,
    hasRole,
    updateUser,
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

// Add PropTypes validation if you're using prop-types
// AuthProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };

export default AuthContext;
