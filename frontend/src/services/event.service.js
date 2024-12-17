const API_URL = 'http://localhost:3000/api';

export const enrollInEvent = async (eventId, userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/enroll/${eventId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ userId, eventId })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to enroll in event');
  }
};

export const getEvents = async (type) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/events/${type}`, {
      headers,
      credentials: 'include'
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to fetch events');
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to delete event');
  }
};
