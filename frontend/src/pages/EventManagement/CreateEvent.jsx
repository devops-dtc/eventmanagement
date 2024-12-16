// src/pages/Events/CreateEvent.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar/Navbar';
import { USER_ROLES } from '../../utils/constants';
import { toast } from 'react-toastify';
import styles from '../../styles/EditEvent.module.css'; // We can use the same styles
import MessageDialog from '../../components/MessageDialog/MessageDialog';

const CreateEvent = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const [eventData, setEventData] = useState({
    title: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    location: '',
    zip: '',
    address: '',
    description: ''
  });

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const isAdminOrOrganizer = user?.role === USER_ROLES.ADMIN || 
                            user?.role === USER_ROLES.ORGANIZER;

  if (!isAdminOrOrganizer) {
    return <Navigate to="/home" />;
  }

  const handleInputChange = (field, value) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateClick = () => {
    // Validate required fields
    const requiredFields = ['title', 'date', 'time', 'location', 'address'];
    const missingFields = requiredFields.filter(field => !eventData[field]);

    if (missingFields.length > 0) {
      toast.error(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleCreateConfirm = async () => {
    try {
      if (eventData.endDate) {
        const startDate = new Date(eventData.date);
        const endDate = new Date(eventData.endDate);
        
        if (endDate < startDate) {
          toast.error('End date cannot be before start date');
          return;
        }
      }

      // Here you would make your API call to create the event
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Event created successfully');
      navigate('/home', { 
        state: { activeTab: 'created' }
      });
    } catch (error) {
      toast.error('Failed to create event');
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const handleCreateCancel = () => {
    setShowConfirmDialog(false);
  };

  // Helper function to format time for display
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Helper function to convert 12-hour format to 24-hour format
  const convertTo24Hour = (time12h) => {
    if (!time12h) return '';
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours}:${minutes}`;
  };

  const renderDateInput = (field, label, value, placeholder) => (
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>{label}</label>
      <div className={styles['input-box']}>
        <input
          type="date"
          value={value || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={styles['editable-input']}
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  const renderTimeInput = (field, label, value, placeholder) => (
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>{label}</label>
      <div className={styles['input-box']}>
        <input
          type="time"
          value={convertTo24Hour(value) || ''}
          onChange={(e) => {
            const time24 = e.target.value;
            if (time24) {
              const date = new Date(`2000-01-01T${time24}`);
              const timeString = date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
              handleInputChange(field, timeString);
            } else {
              handleInputChange(field, '');
            }
          }}
          className={styles['editable-input']}
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  const renderInput = (field, label, value, placeholder, type = 'text') => (
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>{label}</label>
      <div className={styles['input-box']}>
        <input
          type={type}
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={styles['editable-input']}
        />
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <Navbar /> 
      <h1 className="page-heading">Create Event</h1>
      <div className={styles['edit-event-card']}>
        <div className={styles['content-wrapper']}>
          <div className={styles['main-content']}>
            {renderInput('title', 'Event name', eventData.title, 'Enter event name')}

            <div className={styles['venue-time-section']}>
              {renderDateInput('date', 'Start Date', eventData.date, 'Select start date')}
              {renderTimeInput('time', 'Start Time', eventData.time, 'Select start time')}
              {renderDateInput('endDate', 'End Date', eventData.endDate, 'Select end date')}
              {renderTimeInput('endTime', 'End Time', eventData.endTime, 'Select end time')}
            </div>

            <div className={styles['venue-details-section']}>
              {renderInput('location', 'Venue Name', eventData.location, 'Enter venue name')}
              {renderInput('zip', 'Venue Zip', eventData.zip, 'Enter zip code', 'number')}
              {renderInput('address', 'Venue Address', eventData.address, 'Enter full address')}
            </div>

            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Description</label>
              <div className={`${styles['input-box']} ${styles['description']}`}>
                <textarea
                  value={eventData.description || ''}
                  placeholder="Enter event description"
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={styles['editable-input']}
                />
              </div>
            </div>
          </div>

          <div className={styles['edit-button-container']}>
            <button 
              className={styles['edit-button']}
              onClick={handleCreateClick}
            >
              Create Event
            </button>
          </div>
        </div>
      </div>

      {showConfirmDialog && (
        <MessageDialog
          messageHeading="Create Event?"
          messageResponse="Create"
          onSave={handleCreateConfirm}
          onCancel={handleCreateCancel}
        />
      )}
    </div>
  );
};

export default CreateEvent;
