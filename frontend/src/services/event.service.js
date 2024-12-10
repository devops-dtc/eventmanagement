// Mock Service

// Mock delay function to simulate API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock events data
const mockEvents = [
  {
    id: 1,
    title: "Summer Music Festival",
    description: "Join us for three days of amazing music performances featuring top artists from around the world. Food, drinks, and camping facilities available.",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3",
    date: "2023-08-15",
    time: "16:00",
    location: "Central Park",
    capacity: 1000,
    enrolled: 750
  },
  {
    id: 2,
    title: "Tech Conference 2023",
    description: "Annual technology conference featuring keynote speakers, workshops, and networking opportunities. Learn about the latest trends in AI, blockchain, and cloud computing.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3",
    date: "2023-09-20",
    time: "09:00",
    location: "Convention Center",
    capacity: 500,
    enrolled: 320
  },
  {
    id: 3,
    title: "Cooking Masterclass",
    description: "Learn to cook authentic Italian dishes with our expert chefs. All ingredients and equipment provided. Perfect for beginners and intermediate cooks.",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3",
    date: "2023-08-30",
    time: "14:00",
    location: "Culinary Institute",
    capacity: 30,
    enrolled: 25
  }
];

// Mock service functions
export const getEvents = async (type) => {
  await delay(1000); // Simulate network delay
  return {
    data: mockEvents,
    success: true
  };
};

export const enrollInEvent = async (eventId) => {
  await delay(500);
  return {
    success: true,
    message: 'Successfully enrolled in event'
  };
};

export const createEvent = async (eventData) => {
  await delay(1000);
  return {
    success: true,
    data: {
      id: Math.floor(Math.random() * 1000),
      ...eventData
    }
  };
};

export const updateEvent = async (eventId, eventData) => {
  await delay(1000);
  return {
    success: true,
    data: {
      id: eventId,
      ...eventData
    }
  };
};

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
