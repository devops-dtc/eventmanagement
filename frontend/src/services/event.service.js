import api from './api';

export const eventService = {
    getAllEvents: async (params) => {
        const response = await api.get('/events', { params });
        return response.data;
    },

    getEventById: async (id) => {
        const response = await api.get(`/events/${id}`);
        return response.data;
    },

    createEvent: async (eventData) => {
        const response = await api.post('/events', eventData);
        return response.data;
    },

    updateEvent: async (id, eventData) => {
        const response = await api.put(`/events/${id}`, eventData);
        return response.data;
    },

    deleteEvent: async (id) => {
        const response = await api.delete(`/events/${id}`);
        return response.data;
    },

    enrollEvent: async (eventId) => {
        const response = await api.post(`/events/${eventId}/enroll`);
        return response.data;
    }
};