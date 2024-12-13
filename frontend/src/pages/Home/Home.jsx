// src/pages/Home/HomePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { eventsData } from '../../mockdata/EventsData';
import Navbar from '../../components/Layout/Navbar/Navbar';
import TabButtons from '../../components/TabButtons/TabButtons';
import { toast } from 'react-toastify';
import { USER_ROLES } from '../../utils/constants';
import '../../styles/Components.css';
import '../../styles/OrganizerEvents.css';
import { eventService } from '../../services/event.service';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [enrolledEvents, setEnrolledEvents] = useState(eventsData.enrolled);

  const isOrganizer = user?.role === USER_ROLES.ORGANIZER;
  const isAdmin = user?.role === USER_ROLES.SUPER_ADMIN;
  const canManageEvents = isOrganizer || isAdmin;

  const getTabs = () => {
    if (!isAuthenticated()) {
      return [
        { value: 'upcoming', label: 'Upcoming Events' },
        { value: 'past', label: 'Past Events' }
      ];
    }
    if (canManageEvents) {
      return [
        { value: 'upcoming', label: 'Upcoming Events' },
        { value: 'enrolled', label: 'Enrolled Events' },
        { value: 'created', label: 'Created Events' }
      ];
    }
    return [
      { value: 'upcoming', label: 'Upcoming Events' },
      { value: 'enrolled', label: 'Enrolled Events' }
    ];
  };

  const getFilteredEvents = () => {
    switch(activeTab) {
      case 'enrolled':
        return enrolledEvents;
      case 'created':
        return canManageEvents ? eventsData.upcoming.slice(0, 2) : [];
      case 'past':
        return eventsData.enrolled;
      case 'upcoming':
      default:
        return eventsData.upcoming;
    }
  };

  const handleNavigateToEvent = (event) => {
    if (isAuthenticated()) {
      navigate('/enrollment', { 
        state: { eventDetails: event }
      });
    } else {
      navigate('/login', { 
        state: { redirectUrl: '/enrollment', eventDetails: event }
      });
    }
  };

  const handleEditEvent = (event, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/edit-event', { 
      state: { eventDetails: event }
    });
  };

  const handleRemoveEnrollment = (eventId) => {
    setEnrolledEvents(prev => prev.filter(event => event.id !== eventId));
    toast.success('Enrollment removed successfully');
  };

  const renderEventButton = (event) => {
    if (!isAuthenticated()) {
      return (
        <button 
          className="enroll-button"
          onClick={() => handleNavigateToEvent(event)}
        >
          Register Now
        </button>
      );
    }

    if (activeTab === 'created' && canManageEvents) {
      return (
        <button 
          className="edit-button"
          onClick={(e) => handleEditEvent(event, e)}
        >
          Edit Event
        </button>
      );
    } else if (activeTab === 'enrolled') {
      return (
        <button 
          className="enroll-button"
          onClick={() => handleRemoveEnrollment(event.id)}
        >
          Remove Enrollment
        </button>
      );
    } else {
      return (
        <button 
          className="enroll-button"
          onClick={() => handleNavigateToEvent(event)}
        >
          Enroll Now
        </button>
      );
    }
  };

  const getNoEventsMessage = () => {
    if (!isAuthenticated()) {
      return activeTab === 'past' 
        ? "No past events available."
        : "No upcoming events available.";
    }
    if (activeTab === 'created' && canManageEvents) {
      return "You haven't created any events yet.";
    } else if (activeTab === 'enrolled') {
      return "You haven't enrolled in any events yet.";
    }
    return "No upcoming events available.";
  };

  return (
    <div className="admin-container">
      <Navbar />
      <h1 className="page-heading">
        {isAuthenticated() ? 'Events' : 'Welcome!'}
      </h1>
      <main className="main-content">
        <div className="events-container">
          <div className="events-header">
            <TabButtons 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={getTabs()}
            />
            {canManageEvents && (
              <button 
                className="create-event-button"
                onClick={() => navigate('/create-event')}
              >
                Create Event
              </button>
            )}
          </div>

          <div className="events-list">
            {getFilteredEvents().length === 0 ? (
              <div className="no-events-message">
                {getNoEventsMessage()}
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
                          <div className="enrollment-count">
                            <span>👥 {event.attendees}/{event.maxAttendees} enrolled</span>
                          </div>
                        </div>
                      </div>
                      {renderEventButton(event)}
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

export default HomePage;
