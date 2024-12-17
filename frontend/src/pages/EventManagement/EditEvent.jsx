// src/pages/Events/EditEvent.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar/Navbar';
import { USER_ROLES } from '../../utils/constants';
import { toast } from 'react-toastify';
import styles from '../../styles/EditEvent.module.css';
import MessageDialog from '../../components/MessageDialog/MessageDialog';

const EditEvent = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const eventId = location.state?.eventId;
  
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

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        toast.error('No event selected');
        navigate('/home');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch event details');
        }

        const data = await response.json();
        if (data.success) {
          setEventData({
            title: data.event.Title,
            date: new Date(data.event.StartDate).toISOString().split('T')[0],
            time: data.event.StartTime,
            endDate: data.event.EndDate ? new Date(data.event.EndDate).toISOString().split('T')[0] : '',
            endTime: data.event.EndTime || '',
            location: data.event.Location,
            zip: data.event.ZipCode || '',
            address: data.event.Address,
            description: data.event.Description
          });
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        toast.error('Failed to fetch event details');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, navigate]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const isAdminOrOrganizer = user?.role === USER_ROLES.ADMIN || 
                            user?.role === USER_ROLES.ORGANIZER;

  if (!isAdminOrOrganizer) {
    return <Navigate to="/home" />;
  }

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

  const handleInputChange = (field, value) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditClick = () => {
    if (isEditing) {
      setShowConfirmDialog(true);
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveConfirm = async () => {
    try {
        // Validate required fields first
        if (!eventData.title || !eventData.date || !eventData.location) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Convert times to MySQL format
        const startTime = eventData.time ? convertTimeToMySQLFormat(eventData.time) : null;
        if (!startTime) {
            toast.error('Invalid start time format');
            return;
        }

        // Handle end time - if not provided, use start time
        const endTime = eventData.endTime ? 
            convertTimeToMySQLFormat(eventData.endTime) : 
            startTime;

        // Validate dates if end date is provided
        if (eventData.endDate) {
            const startDate = new Date(eventData.date);
            const endDate = new Date(eventData.endDate);
            
            if (endDate < startDate) {
                toast.error('End date cannot be before start date');
                return;
            }
        }

        // Prepare request body with all required fields and proper data types
        const requestBody = {
            EventID: parseInt(eventId),
            Title: eventData.title.trim(),
            Description: eventData.description ? eventData.description.trim() : '',
            EventType: 'Physical',
            StartDate: eventData.date,
            StartTime: startTime,
            EndDate: eventData.endDate || eventData.date,
            EndTime: endTime,
            Location: eventData.location.trim(),
            Address: eventData.address ? eventData.address.trim() : '',
            Pin_Code: eventData.zip ? eventData.zip.toString() : null, // Changed from ZipCode to Pin_Code
            Price: 0,
            MaxAttendees: 100
        };

        console.log('Sending update request with data:', requestBody);

        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update event');
        }

        if (data.success) {
            toast.success('Event updated successfully');
            navigate('/home', { 
                state: { activeTab: 'created' }
            });
        } else {
            throw new Error(data.message || 'Failed to update event');
        }
    } catch (error) {
        console.error('Error updating event:', error);
        toast.error(error.message || 'Failed to update event');
    } finally {
        setShowConfirmDialog(false);
    }
};

  
  

  const handleSaveCancel = () => {
    setShowConfirmDialog(false);
  };

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

  const convertTo24Hour = (time12h) => {
    if (!time12h) return '';
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    
    if (hours === 12) {
      hours = modifier === 'PM' ? 12 : 0;
    } else if (modifier === 'PM') {
      hours += 12;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const renderDateInput = (field, label, value, placeholder) => (
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>{label}</label>
      <div className={styles['input-box']}>
        {isEditing ? (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={styles['editable-input']}
            placeholder={placeholder}
          />
        ) : (
          <div className={styles['input-text']}>{value || placeholder}</div>
        )}
      </div>
    </div>
  );

  const renderTimeInput = (field, label, value, placeholder) => (
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>{label}</label>
      <div className={styles['input-box']}>
        {isEditing ? (
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
        ) : (
          <div className={styles['input-text']}>
            {formatTimeForDisplay(value) || placeholder}
          </div>
        )}
      </div>
    </div>
  );

  const renderInput = (field, label, value, placeholder, type = 'text') => (
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>{label}</label>
      <div className={styles['input-box']}>
        {isEditing ? (
          <input
            type={type}
            value={value || ''}
            placeholder={placeholder}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={styles['editable-input']}
          />
        ) : (
          <div className={styles['input-text']}>{value || placeholder}</div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-container">
        <Navbar />
        <div className="loading">Loading event details...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Navbar />
      <h1 className="page-heading">Edit Event</h1>
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
                {isEditing ? (
                  <textarea
                    value={eventData.description || ''}
                    placeholder="Enter event description"
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={styles['editable-input']}
                  />
                ) : (
                  <div className={styles['input-text']}>
                    {eventData.description || 'Enter event description'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles['edit-button-container']}>
            <button 
              className={styles['edit-button']}
              onClick={handleEditClick}
            >
              {isEditing ? 'Save Changes' : 'Edit Event'}
            </button>
          </div>
        </div>
      </div>

      {showConfirmDialog && (
        <MessageDialog
          messageHeading="Save Changes?"
          messageResponse="Save"
          onSave={handleSaveConfirm}
          onCancel={handleSaveCancel}
        />
      )}
    </div>
  );
};

export default EditEvent;
