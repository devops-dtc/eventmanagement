// src/pages/OrganizerEvents/OrganizerEvents.jsx
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { eventsData } from '../Auth/EventsData'; 
import Navbar from '../../components/Layout/Navbar/Navbar';
import TabButtons from '../../components/TabButtons/TabButtons';
import '../../styles/OrganizerEvents.css';

const OrganizerEvents = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();
  const { user } = useAuth();

  const tabs = [
    { value: 'upcoming', label: 'Upcoming Events' },
    { value: 'enrolled', label: 'Enrolled Events' },
    { value: 'created', label: 'Created Events' }
  ];

  // Filter events based on active tab
  const getFilteredEvents = () => {
    switch(activeTab) {
      case 'enrolled':
        return eventsData.enrolled;
      case 'created':
        return eventsData.upcoming.slice(0, 2);
      case 'upcoming':
      default:
        return eventsData.upcoming;
    }
  };

  const handleNavigateToEnrollment = (event) => {
    navigate('/enrollment', { 
      state: { eventDetails: event }
    });
  };

  return (
    <div className="admin-container">
      <Navbar />
      <h1 className="page-heading">Events</h1>
      <main className="main-content">
        <div className="events-container">
          <div className="events-header">
            <TabButtons 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={tabs}
            />
            <button 
              className="create-event-button"
              onClick={() => navigate('/create-event')}
            >
              Create Event
            </button>
          </div>

          <div className="events-list">
            {getFilteredEvents().length === 0 ? (
              <div className="no-events-message">
                {activeTab === 'created' 
                  ? "You haven't created any events yet."
                  : activeTab === 'enrolled'
                  ? "You haven't enrolled in any events yet."
                  : "No upcoming events available."}
              </div>
            ) : (
              getFilteredEvents().map((event) => (
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
                        </div>
                      </div>
                      {activeTab === 'created' ? (
                        <button 
                          className="edit-button"
                          onClick={() => navigate(`/edit-event/${event.id}`, { 
                            state: { eventDetails: event }
                          })}
                        >
                          Edit Event
                        </button>
                      ) : (
                        <button 
                          className="enroll-button"
                          onClick={() => handleNavigateToEnrollment(event)}
                        >
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrganizerEvents;
