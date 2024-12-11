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

  if (!event) {
    navigate('/events');
    return null;
  }

  return (
    <div className="enrollment-container">
      <div className="enrollment-content">
        <div className="enrollment-details">
          <h1 className="enrollment-title">{event.title}</h1>
          <p className="enrollment-description">{event.description}</p>
          <div className="enrollment-datetime">
            <span>📅 Event Date: {event.date}</span>
            <span>⏰ Time: {event.time}</span>
          </div>
        </div>
        
        <div className="enrollment-image-section">
          <img 
            src={event.image}
            alt={event.title} 
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
          >
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetails;
