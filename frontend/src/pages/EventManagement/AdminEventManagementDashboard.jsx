import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar/Navbar';
import TabButtons from '../../components/TabButtons/TabButtons';
import MessageDialog from '../../components/MessageDialog/MessageDialog';
import { USER_ROLES } from '../../utils/constants';
import styles from '../../styles/EventManagement.module.css';
import adminEventsData from '../../mockdata/AdminEventManagementData.json';
import organizerEventsData from '../../mockdata/OrganizerEventManagementData.json';

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
  
  const [events, setEvents] = useState(
    user?.role === USER_ROLES.SUPER_ADMIN ? adminEventsData : organizerEventsData
  );

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== USER_ROLES.SUPER_ADMIN && user?.role !== USER_ROLES.ORGANIZER) {
    return <Navigate to="/unauthorized" />;
  }

  const isAdmin = user?.role === USER_ROLES.SUPER_ADMIN;

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

  const currentEvents = events[activeTab] || [];
  
  const filteredEvents = currentEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEvent = () => {
    const initialEventData = {
      title: '',
      type: '',
      organizer: user.name,
      startTime: '',
      endTime: '',
      date: '',
      endDate: '',
      location: '',
      address: '',
      zip: '',
      attendees: '0',
      description: '',
      status: 'Publish',
      category: '',
      price: '',
      ticketsAvailable: '',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    };

    navigate('/create-event', {
      state: {
        eventDetails: initialEventData,
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
      status: 'Unpublished',
      lastModified: new Date().toISOString().split('T')[0]
    };

    setEvents(prev => ({
      ...prev,
      pendingApproval: prev.pendingApproval.filter(event => event.id !== approvedEvent.id),
      unpublished: [...prev.unpublished, approvedEvent]
    }));

    setShowApprovalDialog(false);
    setSelectedEventForAction(null);
  };

  const handleSendForApproval = () => {
    const eventForApproval = {
      ...selectedEventForAction,
      status: 'Pending Approval',
      lastModified: new Date().toISOString().split('T')[0]
    };

    setEvents(prev => ({
      ...prev,
      unpublished: [...prev.unpublished, eventForApproval],
      adminApproval: prev.adminApproval.filter(event => event.id !== selectedEventForAction.id)
    }));

    setShowApprovalDialog(false);
    setSelectedEventForAction(null);
  };

  const handlePublishEvent = () => {
    const publishedEvent = {
      ...selectedEventForAction,
      status: 'Published',
      lastModified: new Date().toISOString().split('T')[0]
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
      state: { 
        eventDetails: eventToEdit,
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
      if (activeTab === 'unpublished' && event.status === 'Publish') {
        setShowPublishDialog(true);
      } else if (activeTab === 'adminApproval' && event.status === 'Get Approval') {
        setShowApprovalDialog(true);
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
    if (activeTab === 'published') {
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
      if (activeTab === 'unpublished') {
        if (event.status === 'Publish') {
          return (
            <button 
              className={styles.actionButton}
              onClick={() => handleActionButton(event)}
            >
              Publish
            </button>
          );
        } else if (event.status === 'Pending Approval') {
          return (
            <span className={`${styles.status} ${styles['pending-approval']}`}>
              Pending Approval
            </span>
          );
        }
      }

      if (activeTab === 'adminApproval' && event.status === 'Get Approval') {
        return (
          <button 
            className={styles.actionButton}
            onClick={() => handleActionButton(event)}
          >
            Get Approval
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
                      <td>{event.startTime}</td>
                      <td>{event.endTime}</td>
                      <td>{event.attendees}</td>
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
          onSave={isAdmin ? handleApproveEvent : handleSendForApproval}
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

