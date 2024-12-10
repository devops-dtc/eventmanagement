import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getEvents, enrollInEvent } from '../../services/event.service';
import PageLayout from '../../components/Layout/PageLayout/PageLayout';
import TabButtons from '../../components/TabButtons/TabButtons';
import EventsList from '../../components/EventsList/EventsList';
import { EVENT_TABS } from '../../constants/eventTypes';
import { toast } from 'react-toastify';

const AttendeeEvents = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents(activeTab, user.id);
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (eventId) => {
    try {
      await enrollInEvent(eventId, user.id);
      toast.success('Successfully enrolled in event!');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to enroll in event');
    }
  };

  return (
    <PageLayout title="Events">
      <div className="events-container">
        <TabButtons 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={EVENT_TABS.ATTENDEE}
        />
        <EventsList 
          events={events}
          loading={loading}
          onEnroll={handleEnroll}
          isOrganizer={false}
        />
      </div>
    </PageLayout>
  );
};

export default AttendeeEvents;
