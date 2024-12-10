// src/pages/Enrollment/Enrollment.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar/Navbar';
import EnrollmentDetails from '../../components/EnrollmentDetails/EnrollmentDetails';
import '../../styles/Enrollment.css';

const Enrollment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const eventDetails = location.state?.eventDetails;

//   if (!user) {
//     return <Navigate to="/" />;
//   }

//   if (!eventDetails) {
//     return <Navigate to="/events" />;
//   }

  return (
    <div className="admin-container">
      <Navbar />
      <h1 className="page-heading">Event Details</h1>
      <main className="main-content">
        <EnrollmentDetails event={eventDetails} />
      </main>
    </div>
  );
};

export default Enrollment;
