// src/pages/OrganizerEvents/OrganizerEvents.jsx
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { eventsData } from '../Auth/EventsData'; 
import Navbar from '../../components/Layout/Navbar/Navbar';
import '../../styles/OrganizerEvents.css';

const OrganizerEvents = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();
  const { user } = useAuth();



  //TO DO ALLOW AUTH
  // Check if user is authorized to view this page
//   if (!user || (user.role !== 'Organizer' && user.role !== 'Admin')) { 
//     return <Navigate to="/events" />;
//   }


  // Filter events based on active tab
  const getFilteredEvents = () => {
    switch(activeTab) {
      case 'enrolled':
        return eventsData.enrolled; // Use eventsData.enrolled instead of EventData.slice
      case 'created':
        return eventsData.upcoming.slice(0, 2); // Use eventsData.upcoming instead of EventData
      case 'upcoming':
      default:
        return eventsData.upcoming; // Use eventsData.upcoming instead of EventData
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
                <button 
                  className={`tab-button ${activeTab === 'created' ? 'active' : ''}`}
                  onClick={() => setActiveTab('created')}
                >
                  Created Events
                </button>
              </div>
            </div>
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
                        <div className="action-buttons">
                          <button 
                            className="edit-button"
                            onClick={() => navigate(`/edit-event/${event.id}`, { 
                              state: { eventDetails: event }
                            })}
                          >
                            Edit Event
                          </button>
                          {user.role === 'Admin' && (
                            <button 
                              className="delete-button"
                              onClick={() => {
                                if(window.confirm('Are you sure you want to delete this event?')) {
                                  // Add delete logic here
                                  alert('Event deleted successfully');
                                }
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
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
