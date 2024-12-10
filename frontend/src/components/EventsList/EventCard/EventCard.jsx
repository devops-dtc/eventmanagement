import React from 'react';
import '../../../styles/Components.css';
const EventCard = ({ event, onEnroll, isOrganizer }) => {
  return (
    <div className="event-card">
      <img src={event.image} alt={event.title} className="event-image"/>
      <div className="event-content">
        <h2 className="event-title">{event.title}</h2>
        <p className="event-description">{event.description}</p>
        <div className="event-footer">
          <div className="event-timing">
            <span className="event-date">{event.date}</span>
            <span className="event-time">{event.time}</span>
          </div>
          {!isOrganizer && (
            <button 
              className="enroll-button"
              onClick={() => onEnroll(event.id)}
            >
              Enroll now
            </button>
          )}
          {isOrganizer && (
            <button 
              className="edit-button"
              onClick={() => onEdit(event.id)}
            >
              Edit Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
