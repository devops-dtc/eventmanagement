// src/pages/Events/Events.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Layout/Navbar/Navbar';
import EventsList from '../../components/EventsList/EventsList';
import '../../styles/Components.css';

const Events = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="admin-container">
      <Navbar />
      <h1 className="page-heading">Events</h1>
      <main className="main-content">
        <EventsList />
      </main>
    </div>
  );
};

export default Events;
