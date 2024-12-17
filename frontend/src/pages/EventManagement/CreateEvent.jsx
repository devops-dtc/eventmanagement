// src/pages/Events/CreateEvent.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar/Navbar';
import { USER_ROLES } from '../../utils/constants';
import { toast } from 'react-toastify';
import styles from '../../styles/EditEvent.module.css';
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
    description: '',
    image: ''
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

  const convertTimeToMySQLFormat = (timeString) => {
    if (!timeString) return null;
    try {
      const [timePart, period] = timeString.split(' ');
      let [hours, minutes] = timePart.split(':').map(num => parseInt(num, 10));

      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    } catch (error) {
      console.error('Time conversion error:', error);
      return null;
    }
  };

  const handleCreateClick = () => {
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

      const startTime = convertTimeToMySQLFormat(eventData.time);
      const endTime = eventData.endTime ? 
        convertTimeToMySQLFormat(eventData.endTime) : 
        startTime;

      if (!startTime) {
        toast.error('Invalid start time format');
        return;
      }

      const token = localStorage.getItem('token');
      const requestData = {
        Title: eventData.title,
        Description: eventData.description,
        EventType: 'Physical',
        StartDate: eventData.date,
        StartTime: startTime,
        EndDate: eventData.endDate || eventData.date,
        EndTime: endTime,
        Location: eventData.location,
        Address: eventData.address,
        Image: eventData.image || null,
        Price: 0,
        MaxAttendees: 100,
        TicketsAvailable: 100
      };

      const response = await fetch('http://localhost:3000/api/events/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Event created successfully');
        navigate('/home', { 
          state: { activeTab: 'created' }
        });
      } else {
        throw new Error(data.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error details:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const handleCreateCancel = () => {
    setShowConfirmDialog(false);
  };

  const renderImageInput = () => (
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>Event Image URL</label>
      <div className={styles['input-box']}>
        <input
          type="text"
          value={eventData.image || ''}
          onChange={(e) => handleInputChange('image', e.target.value)}
          className={styles['editable-input']}
          placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
        />
      </div>
    </div>
  );

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
          value={value || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
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

            <div className={styles['form-content']}>
              <div className={styles['description-box']}>
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
              <div className={styles['description-box']}>
                {renderImageInput()}
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
