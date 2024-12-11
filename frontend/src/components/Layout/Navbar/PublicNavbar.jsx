import React from 'react';
import { Link } from 'react-router-dom';
import '../../../styles/Components.css';

const PublicNavbar = () => {
  return (
    <header className="header">
      <div className="black-section">
        <Link to="/" className="logo">easyevent</Link>
      </div>
      <nav className="nav-menu">
        <Link to="/" className="nav-item">HOME</Link>
        <Link to="/about" className="nav-item">ABOUT</Link>
        <Link to="/events" className="nav-item">EVENTS</Link>
        <Link to="/login" className="nav-item">LOGIN</Link>
        <Link to="/register" className="nav-item">SIGNUP</Link>
      </nav>
    </header>
  );
};

export default PublicNavbar;
