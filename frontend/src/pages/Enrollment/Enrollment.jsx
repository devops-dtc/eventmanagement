// src/pages/Enrollment/Enrollment.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar/Navbar';
import { USER_ROLES } from '../../utils/constants';
import { toast } from 'react-toastify';
import '../../styles/Enrollment.css';

const Enrollment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const eventDetails = location.state?.eventDetails;
  const [isEnrolling, setIsEnrolling] = useState(false);

  const isAdminOrOrganizer = user?.role === USER_ROLES.ADMIN || 
                            user?.role === USER_ROLES.ORGANIZER;

    if (!user) {
      return <Navigate to="/" />;
    }

    if (!eventDetails) {
      return <Navigate to="/events" />;
    }

  const handleEnroll = async () => {
    setIsEnrolling(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Successfully enrolled in event!');
      
      // Navigate based on user role
      if (isAdminOrOrganizer) {
        navigate('/home');
      } else {
        navigate('/home');
      }
    } catch (error) {
      toast.error('Failed to enroll in event');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (!eventDetails) {
    navigate('/events');
    return null;
  }

  return (
    <div className="admin-container">
      <Navbar />
      <h1 className="page-heading">Event Details</h1>
      <main className="main-content">
        <div className="enrollment-container">
          <div className="enrollment-content">
            <div className="enrollment-details">
              <h1 className="enrollment-title">{eventDetails.title}</h1>
              <p className="enrollment-description">{eventDetails.description}</p>
              <div className="enrollment-datetime">
                <span>📅 Event Date: {eventDetails.date}</span>
                <span>⏰ Time: {eventDetails.time}</span>
                <span>👥 {eventDetails.attendees}/{eventDetails.maxAttendees} enrolled</span>
              </div>
            </div>
            
            <div className="enrollment-image-section">
              <img 
                src={eventDetails.image}
                alt={eventDetails.title} 
                className="enrollment-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/343x314';
                }}
              />
            </div>

            <div className="enrollment-button-container">
              <button 
                className="enrollment-submit-button"
                onClick={handleEnroll}
                disabled={isEnrolling}
              >
                {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Enrollment;
