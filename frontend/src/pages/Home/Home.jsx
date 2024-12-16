import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Layout/Navbar/Navbar';
import TabButtons from '../../components/TabButtons/TabButtons';
import { toast } from 'react-toastify';
import '../../styles/Components.css';
import '../../styles/OrganizerEvents.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState({
    upcoming: [],
    enrolled: [],
    created: []
  });
  const [loading, setLoading] = useState(true);

  const isOrganizer = user?.role === 'Organizer';
  const isAdmin = user?.role === 'Admin';
  const canManageEvents = isOrganizer || isAdmin;

  // Fetch events based on active tab
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        let endpoint = '';

        switch(activeTab) {
          case 'enrolled':
            endpoint = '/api/enroll/events';
            break;
          case 'created':
            endpoint = '/api/events/organizer/events';
            break;
          case 'upcoming':
          default:
            endpoint = '/api/events';
            break;
        }

        const response = await fetch(`http://localhost:3000${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (data.success) {
          setEvents(prev => ({
            ...prev,
            [activeTab]: data.events
          }));
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [activeTab]);

  const getTabs = () => {
    if (!isAuthenticated()) {
      return [
        { value: 'upcoming', label: 'Upcoming Events' }
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

  const handleNavigateToEvent = (event) => {
    if (isAuthenticated()) {
      navigate(`/event/${event.EventID}`);
    } else {
      navigate('/login', { 
        state: { redirectUrl: `/event/${event.EventID}` }
      });
    }
  };

  const handleEditEvent = async (event, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-event/${event.EventID}`);
  };

  const handleRemoveEnrollment = async (enrollmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/enroll/${enrollmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setEvents(prev => ({
          ...prev,
          enrolled: prev.enrolled.filter(event => event.EnrollmentID !== enrollmentId)
        }));
        toast.success('Enrollment removed successfully');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error removing enrollment:', error);
      toast.error('Failed to remove enrollment');
    }
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
          onClick={() => handleRemoveEnrollment(event.EnrollmentID)}
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
      return "No upcoming events available.";
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
        {isAuthenticated() ? `Welcome, ${user.name}!` : 'Welcome!'}
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
            {loading ? (
              <div className="loading">Loading events...</div>
            ) : events[activeTab]?.length === 0 ? (
              <div className="no-events-message">
                {getNoEventsMessage()}
              </div>
            ) : (
              events[activeTab]?.map((event) => (
                <div key={event.EventID} className="event-card">
                  <img 
                    src={event.Image || 'https://via.placeholder.com/400x300'} 
                    alt={event.Title} 
                    className="event-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300';
                    }}
                  />
                  <div className="event-content">
                    <h2 className="event-title">{event.Title}</h2>
                    <p className="event-description">{event.Description}</p>
                    <div className="event-footer">
                      <div className="event-timing">
                        <div className="event-details">
                          <span>📍 {event.Location}</span>
                          <div>
                            <span>📅 {new Date(event.StartDate).toLocaleDateString()}</span>
                            <span style={{marginLeft: '15px'}}>⏰ {event.StartTime}</span>
                          </div>
                          <div className="enrollment-count">
                            <span>👥 {event.AttendeeCount}/{event.MaxAttendees} enrolled</span>
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
