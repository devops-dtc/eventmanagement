// src/pages/Home/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsData } from '../Auth/EventsData';
import PublicNavbar from '../../components/Layout/Navbar/PublicNavbar';
import TabButtons from '../../components/TabButtons/TabButtons';
import '../../styles/Components.css';

const Home = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  const tabs = [
    { value: 'upcoming', label: 'Upcoming Events' },
    { value: 'past', label: 'Past Events' }
  ];

  const getFilteredEvents = () => {
    switch(activeTab) {
      case 'past':
        return eventsData.enrolled; //TO do store Past events
      case 'upcoming':
      default:
        return eventsData.upcoming;
    }
  };

  const handleRegisterClick = (event) => {
    navigate('/register', { 
      state: { eventDetails: event }
    });
  };

  return (
    <div className="admin-container">
      <PublicNavbar />
      <h1 className="page-heading">Welcome!</h1>
      <main className="main-content">
        <div className="events-container">
          <div className="tab-container">
            <TabButtons 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={tabs}
            />
          </div>
          <div className="events-list">
            {getFilteredEvents().length === 0 ? (
              <div className="no-events-message">
                {activeTab === 'past' 
                  ? "You haven't participated in any events yet."
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
                      <button 
                        className="enroll-button"
                        onClick={() => handleRegisterClick(event)}
                      >
                        Register Now
                      </button>
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

export default Home;
