// src/pages/AboutUs/AboutUs.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar/Navbar';
import { USER_ROLES } from '../../utils/constants';
import '../../styles/Enrollment.css';
import styles from '../../styles/ContactAbout.module.css';

const AboutUs = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const isAdminOrOrganizer = user?.role === USER_ROLES.ADMIN || 
                            user?.role === USER_ROLES.ORGANIZER;

  return (
    <div className="admin-container">
     <Navbar /> 
      <h1 className="page-heading">About Us</h1>
      <main className="main-content">
        <div className="enrollment-container">
          <div className="enrollment-content">
            <div className={styles.contentSection}>
              <div className={styles.introSection}>
              <h2 className={styles.sectionTitle}>Welcome to EasyEvent</h2>
                <p className={styles.introText}>
                  At easyevent, we specialize in opensource streamlining event planning and execution. 
                  Our comprehensive platform empowers individuals and organizations to create, 
                  manage, and host unforgettable events with ease. Whether you're planning a 
                  corporate conference, a virtual webinar, or a personal celebration, we provide 
                  tools that simplify every step. With features designed to enhance collaboration, 
                  engagement, and efficiency, our mission is to make event management hassle-free, 
                  innovative, and impactful. Let us help you bring your vision to life effortlessly!
                </p>
              </div>

              <div className={styles.missionVisionSection}>
                <h2 className={styles.sectionTitle}>Our Mission & Vision</h2>
                <p className={styles.sectionText}>
                Our mission is to enhance the open-source ecosystem by providing tools for seamless event management, 
                benefiting both organizers and attendees.
                We aim to lead in open-source event platforms, fostering community connections and creating impactful experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutUs;
