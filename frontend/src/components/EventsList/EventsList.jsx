// src/components/EventsList/EventsList.jsx
import React, { useState, useEffect } from 'react';
import { getEvents, enrollInEvent } from '../../services/event.service';

const EventsList = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents(activeTab);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (eventId) => {
    try {
      await enrollInEvent(eventId);
      alert('Successfully enrolled in event!');
      fetchEvents();
    } catch (error) {
      alert('Failed to enroll in event');
    }
  };

  //TO DO Give new Loading Animations
  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="events-container">
      <div className="tab-container">
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Events
          </button>
          <button 
            className={`tab-button ${activeTab === 'enrolled' ? 'active' : ''}`}
            onClick={() => setActiveTab('enrolled')}
          >
            Enrolled Events
          </button>
        </div>
      </div>

      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <img 
              src={event.image} 
              alt={event.title} 
              className="event-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300';
              }}
            />
            <div className="event-content">
              <h2 className="event-title">{event.title}</h2>
              <p className="event-description">{event.description}</p>
              <div className="event-footer">
                <div className="event-timing">
                  <div className="event-details">
                    <span>📍 {event.location}</span>
                    <div>
                      <span>📅 {event.date}</span>
                      <span style={{marginLeft: '15px'}}>⏰ {event.time}</span>
                    </div>
                    <span>👥 {event.enrolled}/{event.capacity} enrolled</span>
                  </div>
                </div>
                <button 
                  className="enroll-button"
                  onClick={() => handleEnroll(event.id)}
                  disabled={event.enrolled >= event.capacity}
                >
                  {event.enrolled >= event.capacity ? 'Full' : 'Enroll now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsList;
