// src/pages/Admin/EventManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar/Navbar';
import TabButtons from '../../components/TabButtons/TabButtons';
import MessageDialog from '../../components/MessageDialog/MessageDialog';
import { USER_ROLES } from '../../utils/constants';
import styles from '../../styles/EventManagement.module.css';
import { toast } from 'react-toastify';

const EventManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('published');
  const [activeManagementTab, setActiveManagementTab] = useState('events');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState({ show: false, eventId: null, x: 0, y: 0 });
  const [selectedEventForAction, setSelectedEventForAction] = useState(null);
  const [events, setEvents] = useState({
    published: [],
    unpublished: [],
    pendingApproval: [],
    adminApproval: []
  });
  const [loading, setLoading] = useState(true);

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== USER_ROLES.ADMIN && user?.role !== USER_ROLES.ORGANIZER) {
    return <Navigate to="/unauthorized" />;
  }

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const tabs = isAdmin
    ? [
        { label: 'Published', value: 'published' },
        { label: 'Unpublished', value: 'unpublished' },
        { label: 'Pending Approval', value: 'pendingApproval' }
      ]
    : [
        { label: 'Published', value: 'published' },
        { label: 'Unpublished', value: 'unpublished' },
        { label: 'Admin Approval', value: 'adminApproval' }
      ];

  // Fetch events based on tab
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        let endpoint = '';

        switch(activeTab) {
          case 'published':
            endpoint = '/api/events/upcoming';
            break;
          case 'unpublished':
            endpoint = '/api/events/organizer/events';
            break;
          case 'pendingApproval':
          case 'adminApproval':
            endpoint = '/api/events/organizer/events';
            break;
          default:
            endpoint = '/api/events/upcoming';
        }

        const response = await fetch(`http://localhost:3000${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        
        if (data.success) {
          const formattedEvents = data.events.map(event => ({
            id: event.EventID,
            title: event.Title,
            type: event.EventType,
            organizer: event.OrganizerName,
            startTime: event.StartTime,
            endTime: event.EndTime,
            startDate: new Date(event.StartDate).toLocaleDateString(),
            endDate: new Date(event.EndDate).toLocaleDateString(),
            location: event.Location,
            attendees: event.AttendeeCount,
            maxAttendees: event.MaxAttendees,
            status: event.Published ? 'Published' : event.EventIsApproved ? 'Unpublished' : 'Needs Approval'
          }));

          // Filter events based on status
          const categorizedEvents = {
            published: formattedEvents.filter(e => e.status === 'Published'),
            unpublished: formattedEvents.filter(e => e.status === 'Unpublished'),
            pendingApproval: formattedEvents.filter(e => e.status === 'Needs Approval')
          };

          setEvents(prev => ({
            ...prev,
            [activeTab]: categorizedEvents[activeTab] || []
          }));
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

    const currentEvents = events[activeTab] || [];
  
  const filteredEvents = currentEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEvent = () => {
    navigate('/create-event', {
      state: {
        sourceRoute: '/event-management',
        activeTab: 'unpublished',
        userRole: user.role
      }
    });
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setSelectedEvents([]);
    setShowOptionsMenu({ show: false, eventId: null, x: 0, y: 0 });
  };

  const handleManagementTabChange = (value) => {
    setActiveManagementTab(value);
    if (value === 'users') {
      navigate('/user-management');
    } else {
      navigate('/event-management');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCheckEvent = (eventId) => {
    setSelectedEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      }
      return [...prev, eventId];
    });
  };

  const handleCheckAll = (e) => {
    if (e.target.checked) {
      setSelectedEvents(filteredEvents.map(event => event.id));
    } else {
      setSelectedEvents([]);
    }
  };

  const handleDeleteEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Delete each selected event
      for (const eventId of selectedEvents) {
        const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Failed to delete event ${eventId}`);
        }
      }

      // Update local state
      setEvents(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(event => !selectedEvents.includes(event.id))
      }));

      setShowDeleteDialog(false);
      setSelectedEvents([]);
      toast.success('Events deleted successfully');
    } catch (error) {
      console.error('Error deleting events:', error);
      toast.error('Failed to delete events');
    }
  };

  const handleApproveEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/events/${selectedEventForAction.id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to approve event');
      }

      const data = await response.json();
      if (data.success) {
        setEvents(prev => ({
          ...prev,
          pendingApproval: prev.pendingApproval.filter(event => event.id !== selectedEventForAction.id),
          unpublished: [...prev.unpublished, { ...selectedEventForAction, status: 'Unpublished' }]
        }));
        toast.success('Event approved successfully');
      }
    } catch (error) {
      console.error('Error approving event:', error);
      toast.error('Failed to approve event');
    }
    setShowApprovalDialog(false);
    setSelectedEventForAction(null);
  };

  const handlePublishEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/events/${selectedEventForAction.id}/publish`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to publish event');
      }

      const data = await response.json();
      if (data.success) {
        setEvents(prev => ({
          ...prev,
          unpublished: prev.unpublished.filter(event => event.id !== selectedEventForAction.id),
          published: [...prev.published, { ...selectedEventForAction, status: 'Published' }]
        }));
        toast.success('Event published successfully');
      }
    } catch (error) {
      console.error('Error publishing event:', error);
      toast.error('Failed to publish event');
    }
    setShowPublishDialog(false);
    setSelectedEventForAction(null);
  };

  const handleOptionMenuClick = (e, event) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setShowOptionsMenu({
      show: true,
      eventId: event.id,
      x: rect.x - 120,
      y: rect.bottom
    });
  };

  const handleEditEvent = (eventId) => {
    const eventToEdit = currentEvents.find(event => event.id === eventId);
    navigate('/edit-event', { 
      state: { 
        eventId: eventId,
        sourceRoute: '/event-management',
        activeTab: activeTab,
        userRole: user.role
      }
    });
    setShowOptionsMenu({ show: false, eventId: null, x: 0, y: 0 });
  };

    const handleManageUsers = (eventId) => {
    navigate('/user-management', { 
      state: { 
        eventId: eventId,
        eventTitle: currentEvents.find(event => event.id === eventId)?.title
      }
    });
    setShowOptionsMenu({ show: false, eventId: null, x: 0, y: 0 });
  };

  const handleActionButton = (event) => {
    setSelectedEventForAction(event);
    if (isAdmin) {
      if (activeTab === 'pendingApproval' && event.status === 'Needs Approval') {
        setShowApprovalDialog(true);
      } else if (activeTab === 'unpublished' && event.status === 'Unpublished') {
        setShowPublishDialog(true);
      }
    } else {
      if (activeTab === 'unpublished' && event.status === 'Unpublished') {
        setShowPublishDialog(true);
      }
    }
  };

  const handleClickOutside = (e) => {
    if (showOptionsMenu.show && !e.target.closest(`.${styles.menuButton}`)) {
      setShowOptionsMenu({ show: false, eventId: null, x: 0, y: 0 });
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showOptionsMenu.show]);

  React.useEffect(() => {
    const isUserManagement = location.pathname.includes('user-management');
    setActiveManagementTab(isUserManagement ? 'users' : 'events');
  }, [location]);

  const renderActionButton = (event) => {
    if (event.status === 'Published') {
      return (
        <span className={`${styles.status} ${styles.published}`}>
          Published
        </span>
      );
    }

    if (isAdmin) {
      if (activeTab === 'pendingApproval' && event.status === 'Needs Approval') {
        return (
          <button 
            className={styles.actionButton}
            onClick={() => handleActionButton(event)}
          >
            Approve
          </button>
        );
      }

      if (activeTab === 'unpublished' && event.status === 'Unpublished') {
        return (
          <button 
            className={styles.actionButton}
            onClick={() => handleActionButton(event)}
          >
            Publish
          </button>
        );
      }
    } else {
      if (activeTab === 'unpublished' && event.status === 'Unpublished') {
        return (
          <button 
            className={styles.actionButton}
            onClick={() => handleActionButton(event)}
          >
            Publish
          </button>
        );
      }
    }

    return (
      <span className={`${styles.status} ${styles[event.status.toLowerCase().replace(' ', '-')]}`}>
        {event.status}
      </span>
    );
  };

  return (
    <div className={styles.adminContainer}>
      <Navbar />
      <div className={styles.pageContainer}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Event Management</h1>
          <div className={styles.managementTabs}>
            <button 
              className={activeManagementTab === 'events' ? styles.active : ''}
              onClick={() => handleManagementTabChange('events')}
            >
              Manage Events
            </button>
            <button 
              className={activeManagementTab === 'users' ? styles.active : ''}
              onClick={() => handleManagementTabChange('users')}
            >
              Manage Users
            </button>
          </div>
        </div>

        <div className={styles.contentContainer}>
          <div className={styles.whiteContainer}>
            <div className={styles.header}>
              <div className={styles.tabSection}>
                <TabButtons
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
              </div>
              
              <div className={styles.actionSection}>
                <div className={styles.searchBox}>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                
                <button className={styles.addButton} onClick={handleAddEvent}>
                  + Add Event
                </button>

                <button 
                  className={`${styles.deleteButton} ${selectedEvents.length > 0 ? styles.active : ''}`}
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={selectedEvents.length === 0}
                >
                  Delete Event
                </button>
              </div>
            </div>

            <div className={styles.tableContainer}>
              {loading ? (
                <div className={styles.loading}>Loading events...</div>
              ) : (
                <table className={styles.table}>
                  <colgroup>
                    <col style={{ width: '40px' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '100px' }} />
                    <col style={{ width: '40px' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className={styles.checkbox}>
                        <input 
                          type="checkbox"
                          checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                          onChange={handleCheckAll}
                        />
                      </th>
                      <th>Event Title</th>
                      <th>Event Type</th>
                      <th>Event Organizer</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Attendees</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map(event => (
                      <tr key={event.id}>
                        <td className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={selectedEvents.includes(event.id)}
                            onChange={() => handleCheckEvent(event.id)}
                          />
                        </td>
                        <td>{event.title}</td>
                        <td>{event.type}</td>
                        <td>{event.organizer}</td>
                        <td>{`${event.startDate} ${event.startTime}`}</td>
                        <td>{`${event.endDate} ${event.endTime}`}</td>
                        <td>{`${event.attendees}/${event.maxAttendees}`}</td>
                        <td>{renderActionButton(event)}</td>
                        <td className={styles.menuCell}>
                          <button 
                            className={styles.menuButton}
                            onClick={(e) => handleOptionMenuClick(e, event)}
                          >
                            •••
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {showOptionsMenu.show && (
        <div 
          className={styles.optionsMenu}
          style={{ 
            position: 'fixed', 
            left: showOptionsMenu.x,
            top: showOptionsMenu.y 
          }}
        >
          <button onClick={() => handleEditEvent(showOptionsMenu.eventId)}>
            Edit Event
          </button>
          <button onClick={() => handleManageUsers(showOptionsMenu.eventId)}>
            Manage Users
          </button>
        </div>
      )}

      {showDeleteDialog && (
        <MessageDialog
          messageHeading="Delete Events?"
          messageResponse="Delete"
          messageResponse2="Cancel"
          onSave={handleDeleteEvents}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}

      {showApprovalDialog && (
        <MessageDialog
          messageHeading={isAdmin ? "Approve Event?" : "Send for Admin Approval?"}
          messageResponse={isAdmin ? "Approve" : "Send"}
          messageResponse2="Cancel"
          onSave={handleApproveEvent}
          onCancel={() => {
            setShowApprovalDialog(false);
            setSelectedEventForAction(null);
          }}
        />
      )}

      {showPublishDialog && (
        <MessageDialog
          messageHeading="Publish Event?"
          messageResponse="Publish"
          messageResponse2="Cancel"
          onSave={handlePublishEvent}
          onCancel={() => {
            setShowPublishDialog(false);
            setSelectedEventForAction(null);
          }}
        />
      )}
    </div>
  );
};

export default EventManagement;

