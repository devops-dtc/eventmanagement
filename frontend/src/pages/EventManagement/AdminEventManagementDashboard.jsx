// src/pages/EventManagement/EventManagement.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import AttendeeNavbar from '../../components/Layout/Navbar/AttendeeNavbar';
import OrganizerAdminNavbar from '../../components/Layout/Navbar/OrganizerAdminNavbar';
import TabButtons from '../../components/TabButtons/TabButtons';
import MessageDialog from '../../components/MessageDialog/MessageDialog';
import { USER_ROLES } from '../../utils/constants';
import styles from '../../styles/EventManagement.module.css';
import initialEventsData from '../../mockdata/AdminEventManagementData.json';

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
  const [events, setEvents] = useState(initialEventsData);

  const tabs = [
    { label: 'Published', value: 'published' },
    { label: 'Unpublished', value: 'unpublished' },
    { label: 'Pending Approval', value: 'pendingApproval' }
  ];

  // Check for authentication and super admin role
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== USER_ROLES.SUPER_ADMIN) {
    return <Navigate to="/unauthorized" />;
  }

  const currentEvents = events[activeTab] || [];
  
  const filteredEvents = currentEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEvent = () => {
    navigate('/create-event');
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

  const handleDeleteEvents = () => {
    const updatedEvents = {
      ...events,
      [activeTab]: events[activeTab].filter(event => !selectedEvents.includes(event.id))
    };
    setEvents(updatedEvents);
    setShowDeleteDialog(false);
    setSelectedEvents([]);
  };

  const handleApproveEvent = () => {
    const approvedEvent = {
      ...selectedEventForAction,
      status: 'Unpublished'
    };

    setEvents(prev => ({
      ...prev,
      pendingApproval: prev.pendingApproval.filter(event => event.id !== approvedEvent.id),
      unpublished: [...prev.unpublished, approvedEvent]
    }));

    setShowApprovalDialog(false);
    setSelectedEventForAction(null);
  };

  const handlePublishEvent = () => {
    const publishedEvent = {
      ...selectedEventForAction,
      status: 'Published'
    };

    setEvents(prev => ({
      ...prev,
      unpublished: prev.unpublished.filter(event => event.id !== publishedEvent.id),
      published: [...prev.published, publishedEvent]
    }));

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
      state: { eventDetails: eventToEdit }
    });
    setShowOptionsMenu({ show: false, eventId: null, x: 0, y: 0 });
  };

  const handleManageUsers = (eventId) => {
    navigate(`/manage-users/${eventId}`);
    setShowOptionsMenu({ show: false, eventId: null, x: 0, y: 0 });
  };

  const handleActionButton = (event) => {
    setSelectedEventForAction(event);
    if (activeTab === 'pendingApproval') {
      setShowApprovalDialog(true);
    } else if (activeTab === 'unpublished') {
      setShowPublishDialog(true);
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

  return (
    <div className={styles.adminContainer}>
      <OrganizerAdminNavbar />
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
              <table className={styles.table}>
                <colgroup>
                  <col style={{ width: '40px' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '8%' }} />
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
                      <td>{event.startTime}</td>
                      <td>{event.endTime}</td>
                      <td>{event.attendees}</td>
                      <td>
                        {activeTab === 'pendingApproval' || activeTab === 'unpublished' ? (
                          <button 
                            className={styles.actionButton}
                            onClick={() => handleActionButton(event)}
                          >
                            {activeTab === 'pendingApproval' ? 'Approve' : 'Publish'}
                          </button>
                        ) : (
                          <span className={`${styles.status} ${styles[event.status.toLowerCase().replace(' ', '-')]}`}>
                            {event.status}
                          </span>
                        )}
                      </td>
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
          messageHeading="Approve Event?"
          messageResponse="Approve"
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
