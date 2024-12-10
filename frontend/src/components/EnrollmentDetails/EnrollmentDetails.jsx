import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Enrollment.css';

const EnrollmentDetails = ({ event }) => {
  const navigate = useNavigate();

  const handleEnroll = () => {
    // Add enrollment logic here
    alert('Successfully enrolled!');
    navigate('/events');
  };

  return (
    <div className="enrollment-container">
      <div className="enrollment-content">
        <div className="enrollment-details">
          <h1 className="enrollment-title">
            {event?.title || "MICROSOFT WEBINAR"}
          </h1>
          <p className="enrollment-description">
            {event?.description || "An engaging webinar from Microsoft where top industry experts will share insights and strategies on leveraging Microsoft Teams for effective collaboration and communications."}
          </p>
          <div className="enrollment-datetime">
            <span>📅 Event Date: {event?.date || "18th December"}</span>
            <span>⏰ Time: {event?.time || "8:00 PM"}</span>
          </div>
        </div>
        
        <div className="enrollment-image-section">
          <img 
            src={event?.image || "https://picsum.photos/343/314"}
            alt={event?.title || "Webinar"} 
            className="enrollment-image"
          />
        </div>

        <div className="enrollment-button-container">
          <button 
            className="enrollment-submit-button"
            onClick={handleEnroll}
            disabled={event?.enrolled >= event?.capacity}
          >
            {event?.enrolled >= event?.capacity ? 'Event Full' : 'Enroll Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetails;
