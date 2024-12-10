import React from 'react';
import Navbar from '../Navbar/Navbar';
import '../../../styles/Components.css';

const PageLayout = ({ title, children }) => {
  return (
    <div className="admin-container">
      <Navbar />
      <h1 className="page-heading">{title}</h1>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
