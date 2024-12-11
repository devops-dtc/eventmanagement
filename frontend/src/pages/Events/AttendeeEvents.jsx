// src/pages/Events/Events.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsData } from '../Auth/EventsData';
import Navbar from '../../components/Layout/Navbar/AttendeeNavbar';
import TabButtons from '../../components/TabButtons/TabButtons';
import { toast } from 'react-toastify';
import '../../styles/Components.css';

const Events = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [enrolledEvents, setEnrolledEvents] = useState(eventsData.enrolled);

  const tabs = [
    { value: 'upcoming', label: 'Upcoming Events' },
    { value: 'enrolled', label: 'Enrolled Events' }
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Filter events based on active tab
  const getFilteredEvents = () => {
    switch(activeTab) {
      case 'enrolled':
        return enrolledEvents;
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

  const handleRemoveEnrollment = (eventId) => {
    // Backend remove enrollment logic (commented for future implementation)
    /*
    try {
      await removeEventEnrollment(eventId);
      setEnrolledEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success('Enrollment removed successfully');
    } catch (error) {
      toast.error('Failed to remove enrollment');
    }
    */

    // Dummy remove enrollment logic
    setEnrolledEvents(prev => prev.filter(event => event.id !== eventId));
    toast.success('Enrollment removed successfully');
  };

  return (
    <div className="admin-container">
      <Navbar />
      <h1 className="page-heading">Events</h1>
      <main className="main-content">
        <div className="events-container">
          <TabButtons 
            activeTab={activeTab}
            onTabChange={handleTabChange}
            tabs={tabs}
          />
          <div className="events-list">
            {getFilteredEvents().length === 0 ? (
              <div className="no-events-message">
                {activeTab === 'enrolled' 
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
                      {activeTab === 'enrolled' ? (
                        <button 
                          className="enroll-button"
                          onClick={() => handleRemoveEnrollment(event.id)}
                        >
                          Remove Enrollment
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

export default Events;
