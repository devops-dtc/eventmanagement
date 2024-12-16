// src/pages/ContactUs/ContactUs.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar/Navbar';
import { USER_ROLES } from '../../utils/constants';
import { FaGithub } from 'react-icons/fa';
import contactImage from '../../assets/screenshot.png'; 
import '../../styles/Enrollment.css';
import styles from '../../styles/ContactAbout.module.css';

const ContactUs = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const isAdminOrOrganizer = user?.role === USER_ROLES.ADMIN || 
                            user?.role === USER_ROLES.ORGANIZER;

  return (
    <div className="admin-container">
      <Navbar />
      <h1 className="page-heading">Contact Us</h1>
      <main className="main-content">
        <div className="enrollment-container">
          <div className="enrollment-content">
            <div className={styles.contentSection}>
              <div className={styles.contactInfo}>
                <h2 className={styles.mainTitle}>Get in Touch</h2>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Email:</span>
                  <span className={styles.value}>support@eventhub.com</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Phone:</span>
                  <span className={styles.value}>+1 (555) 123-4567</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Address:</span>
                  <span className={styles.value}>123 Event Street, City, Country</span>
                </div>
              </div>

              <div className={styles.githubSection}>
                <h2 className={styles.sectionTitle}>Project Repository</h2>
                <a 
                  href="https://github.com/devops-dtc/eventmanagement" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.githubLink}
                >
                  <FaGithub className={styles.githubIcon} />
                  <span>View on GitHub</span>
                </a>
              </div>
            </div>
            <div className={styles.imageSection}>
              <div className={styles.imageContainer}>
                <img 
                  src={contactImage} 
                  alt="Contact Us" 
                  className={styles.contactImage}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;
