// src/services/event.service.js

// Mock delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to get events based on type
export const getEvents = async (type, userRole = 'Attendee') => {
  await delay(1000);
  return {
    data: [], // Your existing data array will be here
    success: true
  };
};

// Function to enroll in an event
export const enrollInEvent = async (eventId) => {
  await delay(500);
  return {
    success: true,
    message: 'Successfully enrolled in event'
  };
};

// Function to delete an event (admin only)
export const deleteEvent = async (eventId) => {
  await delay(500);
  return {
    success: true,
    message: 'Event successfully deleted'
  };
};



//User Later for service

// import axios from 'axios';

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL
// });

// // Add token to requests
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export const getEvents = async (type, userId) => {
//   return api.get(`/events/${type}`, { params: { userId } });
// };

// export const enrollInEvent = async (eventId, userId) => {
//   return api.post(`/events/${eventId}/enroll`, { userId });
// };

// export const createEvent = async (eventData) => {
//   return api.post('/events', eventData);
// };

// export const updateEvent = async (eventId, eventData) => {
//   return api.put(`/events/${eventId}`, eventData);
// };
