// src/components/Layout/Navbar/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { USER_ROLES } from '../../../utils/constants';
import '../../../styles/Components.css';
import styles from '../../../styles/Navbar.module.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isOrganizer = user?.role === USER_ROLES.ORGANIZER;
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const canManageEvents = isOrganizer || isAdmin;

  const renderNavItems = () => {
    // Common nav items for all users (including non-authenticated)
    const commonItems = [
      <Link key="home" to="/" className="nav-item">HOME</Link>,
      <Link key="about" to="/about" className="nav-item">ABOUT</Link>,
      <Link key="contact" to="/contact" className="nav-item">CONTACT US</Link>
    ];

    // If not authenticated, show only common items plus login/signup
    if (!isAuthenticated()) {
      return [
        ...commonItems,
        <Link key="login" to="/login" className="nav-item">LOGIN</Link>,
        <Link key="register" to="/register" className="nav-item">SIGNUP</Link>
      ];
    }

    // If authenticated, start with common items
    const authenticatedItems = [...commonItems];

    // Add event management for organizers and admins
    if (canManageEvents) {
      authenticatedItems.push(
        <Link key="event-management" to="/event-management" className="nav-item">
          EVENT MANAGEMENT
        </Link>
      );
    }

    // Add profile and logout at the end
    authenticatedItems.push(
      <Link key="profile" to="/profile" className="nav-item">PROFILE</Link>,
      <span 
        key="logout"
        className="nav-item" 
        onClick={handleLogout}
        style={{ cursor: 'pointer' }}
      >
        LOGOUT
      </span>
    );

    return authenticatedItems;
  };

  return (
    <header className="header">
      <div className="black-section">
        <div className="logo-section">
          <Link to="/" className="logo">easyevent</Link>
        </div>
      </div>
      
      <nav className="nav-menu">
        {renderNavItems()}
      </nav>

      {isAuthenticated() && (
        <div className="user-profile">
          <div className="user-info">
            <div>{user?.role || 'Guest'}</div>
            <div>{user?.name || 'Anonymous'}</div>
          </div>
          <div className="avatar"></div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
