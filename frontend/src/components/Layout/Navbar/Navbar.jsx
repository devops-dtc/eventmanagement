// src/components/Layout/Navbar/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import '../../../styles/Components.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="black-section">
        <div className="logo-section">
          <Link to="/" className="logo">easyevent</Link>
        </div>
      </div>
      
      <nav className="nav-menu">
        <Link to="/home" className="nav-item">HOME</Link>
        <Link to="/profile" className="nav-item">PROFILE</Link>
        <Link to="/about" className="nav-item">ABOUT</Link>
        <Link to="/contact" className="nav-item">CONTACT US</Link>
      </nav>

      <div className="user-profile">
        <div className="user-info">
          <div>{user?.role || 'Guest'}</div>
          <div>{user?.name || 'Anonymous'}</div>
        </div>
        <div className="avatar" onClick={handleLogout}></div>
      </div>
    </header>
  );
};

export default Navbar;
