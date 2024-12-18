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
    description: '',
    image: ''
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
        console.log('Fetching event details for ID:', eventId);
        
        const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('Received event data:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch event details');
        }

        if (data.success && data.event) {
          setEventData({
            title: data.event.Title || '',
            date: new Date(data.event.StartDate).toISOString().split('T')[0],
            time: data.event.StartTime || '',
            endDate: data.event.EndDate ? new Date(data.event.EndDate).toISOString().split('T')[0] : '',
            endTime: data.event.EndTime || '',
            location: data.event.Location || '',
            zip: data.event.Pin_Code || '',
            address: data.event.Address || '',
            description: data.event.Description || '',
            image: data.event.Image || ''
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

  // In your handleSaveConfirm function
const handleSaveConfirm = async () => {
  try {
    const token = localStorage.getItem('token');
    const requestBody = {
      EventID: parseInt(eventId),
      Title: eventData.title.trim(),
      Description: eventData.description.trim(),
      EventType: 'Physical',
      StartDate: eventData.date,
      StartTime: eventData.time,
      EndDate: eventData.endDate || eventData.date,
      EndTime: eventData.endTime || eventData.time,
      Location: eventData.location.trim(),
      Address: eventData.address.trim(),
      Image: eventData.image.trim() || null, // Make sure to trim the image URL
      Price: 0,
      MaxAttendees: 100
    };

    console.log('Sending update request:', requestBody);

    const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('Update response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update event');
    }

    if (data.success) {
      toast.success('Event updated successfully');
      // Force a reload of the events list
      navigate('/home', { 
        state: { 
          activeTab: 'created',
          refresh: Date.now() // Add a timestamp to force refresh
        }
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
              {renderInput('zip', 'Venue Pin Code', eventData.zip, 'Enter pin code', 'number')}
              {renderInput('address', 'Venue Address', eventData.address, 'Enter full address')}
            </div>

            <div className={styles['form-content']}>
              <div className={styles['description-box']}>
                <div className={styles['form-group']}>
                  <label className={styles['form-label']}>Description</label>
                  <div className={`${styles['input-box']} ${styles['description']}`}>
                    {isEditing ? (
                      <textarea
                        value={eventData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className={styles['editable-input']}
                        placeholder="Enter event description"
                      />
                    ) : (
                      <div className={styles['input-text']}>
                        {eventData.description || 'No description provided'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles['description-box']}>
                <div className={styles['form-group']}>
                  <label className={styles['form-label']}>Event Image URL</label>
                  <div className={styles['input-box']}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={eventData.image || ''}
                        onChange={(e) => handleInputChange('image', e.target.value)}
                        className={styles['editable-input']}
                        placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                      />
                    ) : (
                      <div className={styles['input-text']}>
                        {eventData.image || 'No image URL provided'}
                      </div>
                    )}
                  </div>
                </div>
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
