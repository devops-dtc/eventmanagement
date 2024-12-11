// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

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
      setUser(anonymousUser); // Set anonymous user if no stored user
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(anonymousUser); // Set to anonymous instead of null
    localStorage.removeItem('user');
  };

  // For testing purposes - modify to only set mock user if not anonymous
  useEffect(() => {
    if (user.role === 'Anonymous') {
      // Uncomment the below code for testing with a mock user
      const mockUser = {
        id: '1',
        name: 'John Doe',
        role: 'Attendee',
        email: 'john@example.com'
      };
      login(mockUser);
    }
  }, []);

  const isAuthenticated = () => {
    return user && user.role !== 'Anonymous';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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
