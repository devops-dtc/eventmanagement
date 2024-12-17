// src/pages/Events/HomePage.jsx
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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState({
    upcoming: [],
    past: [],
    enrolled: [],
    created: []
  });
  const [loading, setLoading] = useState(true);

  const isOrganizer = user?.role === 'Organizer';
  const isAdmin = user?.role === 'Admin';
  const canManageEvents = isOrganizer || isAdmin;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      setActiveTab('upcoming');
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        let endpoint = '';
        let headers = {
          'Content-Type': 'application/json'
        };

        if (token && isAuthenticated()) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        switch(activeTab) {
          case 'enrolled':
            if (!isAuthenticated()) {
              setActiveTab('upcoming');
              return;
            }
            endpoint = '/api/enroll/events';
            break;
          case 'created':
            if (!isAuthenticated() || !canManageEvents) {
              setActiveTab('upcoming');
              return;
            }
            endpoint = '/api/events/organizer/events';
            break;
          case 'past':
            endpoint = '/api/events/past';
            break;
          case 'upcoming':
          default:
            endpoint = '/api/events/upcoming';
            break;
        }

        const response = await fetch(`http://localhost:3000${endpoint}`, { 
          headers,
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          const formattedEvents = data.events.map(event => ({
            ...event,
            StartDate: new Date(event.StartDate).toLocaleDateString(),
            StartTime: event.StartTime ? event.StartTime.slice(0, 5) : '',
            AttendeeCount: event.MaxAttendees - event.TicketsAvailable || 0,
            MaxAttendees: parseInt(event.MaxAttendees) || 0,
            Image: event.Image || `https://picsum.photos/seed/${event.EventID}/800/400`
          }));
          
          

          setEvents(prev => ({
            ...prev,
            [activeTab]: formattedEvents
          }));
        } else {
          toast.error(data.message || 'Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error(`Failed to fetch ${activeTab} events`);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [activeTab, isAuthenticated, canManageEvents]);

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

  const handleNavigateToEvent = (event) => {
    if (isAuthenticated()) {
      navigate('/enrollment', { 
        state: { 
          eventDetails: {
            id: event.EventID,
            title: event.Title,
            description: event.Description,
            date: event.StartDate,
            time: event.StartTime,
            location: event.Location,
            attendees: event.MaxAttendees - event.TicketsAvailable,
            maxAttendees: event.MaxAttendees,
            image: event.Image,
            price: event.Price || 0
          }
        }
      });
    } else {
      navigate('/login', { 
        state: { redirectUrl: '/enrollment' }
      });
    }
  };
  


  const handleEditEvent = async (event, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/edit-event', {
      state: {
        eventId: event.EventID,
        eventDetails: {
          title: event.Title,
          description: event.Description,
          date: event.StartDate,
          time: event.StartTime,
          endDate: event.EndDate,
          endTime: event.EndTime,
          location: event.Location,
          address: event.Address,
          zip: event.ZipCode
        }
      }
    });
  };


  const handleRemoveEnrollment = async (enrollmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/enroll/${enrollmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setEvents(prev => ({
          ...prev,
          enrolled: prev.enrolled.filter(event => event.EnrollmentID !== enrollmentId)
        }));

        const upcomingResponse = await fetch(`http://localhost:3000/api/events/upcoming`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        const upcomingData = await upcomingResponse.json();
        if (upcomingData.success) {
          const formattedEvents = upcomingData.events.map(event => ({
            ...event,
            StartDate: new Date(event.StartDate).toLocaleDateString(),
            StartTime: event.StartTime ? event.StartTime.slice(0, 5) : '',
            AttendeeCount: event.MaxAttendees - event.TicketsAvailable || 0,
            MaxAttendees: parseInt(event.MaxAttendees) || 0
          }));          

          setEvents(prev => ({
            ...prev,
            upcoming: formattedEvents
          }));
        }

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
    }

    if (activeTab === 'enrolled') {
      return (
        <button 
          className="enroll-button"
          onClick={() => handleRemoveEnrollment(event.EnrollmentID)}
        >
          Remove Enrollment
        </button>
      );
    }

    if (activeTab === 'past') {
      return null;
    }

    return (
      <button 
        className="enroll-button"
        onClick={() => handleNavigateToEvent(event)}
      >
        Enroll Now
      </button>
    );
  };

  const getNoEventsMessage = () => {
    switch(activeTab) {
      case 'created':
        return "You haven't created any events yet.";
      case 'enrolled':
        return "You haven't enrolled in any events yet.";
      case 'past':
        return "No past events available.";
      default:
        return "No upcoming events available.";
    }
  };

  if (authLoading) {
    return <div className="loading">Loading...</div>;
  }

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
            {canManageEvents && isAuthenticated() && (
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
                    src={event.Image || `https://picsum.photos/seed/${event.EventID}/800/400`}
                    alt={event.Title} 
                    className="event-image"
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/seed/${event.EventID}/800/400`;
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
                            <span>📅 {event.StartDate}</span>
                            <span style={{marginLeft: '15px'}}>⏰ {event.StartTime}</span>
                          </div>
                          <div className="enrollment-count">
                            <span>👥 {event.MaxAttendees - event.TicketsAvailable}/{event.MaxAttendees} enrolled</span>
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
