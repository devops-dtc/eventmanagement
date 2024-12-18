import { pool } from '../config/database.js';
import { 
    createNewEvent,
    findEventById,
    findAllEvents,
    updateEventDetails,
    removeEvent,
    findEventsByOrganizerId,
    approveEventById,
    publishEventById
} from '../services/eventService.js';
import { validateEvent } from '../utils/validation.js';

export const createEvent = async (req, res) => {
    try {
        console.log('Create event request:', req.body);

        const eventData = {
            ...req.body,
            CreatedBy: req.user.UserID,
            Published: false,
            EventIsDeleted: false,
            EventIsApproved: false,
            EventType: req.body.EventType || 'Physical',
            MaxAttendees: req.body.MaxAttendees || 100,
            TicketsAvailable: req.body.TicketsAvailable || 100,
            Price: req.body.Price || 0
        };

        const { isValid, errors } = validateEvent(eventData);
        if (!isValid) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed',
                errors 
            });
        }

        const event = await createNewEvent(eventData);
        
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to create event',
            error: error.message 
        });
    }
};

export const getAllEvents = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const events = await findAllEvents({ page, limit });
        
        res.json({
            success: true,
            events,
            pagination: {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                total: events.length
            }
        });
    } catch (error) {
        console.error('Error fetching all events:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events'
        });
    }
};

export const getUpcomingEvents = async (req, res) => {
    try {
        const [events] = await pool.execute(`
            SELECT 
                e.*,
                u.UserFullname as OrganizerName,
                COUNT(ee.EnrollmentID) as CurrentAttendees
            FROM EVENT e
            LEFT JOIN USER u ON e.CreatedBy = u.UserID
            LEFT JOIN EVENT_ENROLLMENT ee ON e.EventID = ee.EventID
            WHERE e.StartDate >= CURDATE()
            AND e.Published = TRUE 
            AND e.EventIsApproved = TRUE 
            AND e.EventIsDeleted = FALSE
            GROUP BY e.EventID
            ORDER BY e.StartDate ASC, e.StartTime ASC
        `);

        const formattedEvents = events.map(event => ({
            ...event,
            AttendeeCount: parseInt(event.CurrentAttendees) || 0
        }));

        res.json({
            success: true,
            events: formattedEvents
        });
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming events'
        });
    }
};

export const getPastEvents = async (req, res) => {
    try {
        const [events] = await pool.execute(`
            SELECT 
                e.*,
                u.UserFullname as OrganizerName,
                COUNT(ee.EnrollmentID) as CurrentAttendees
            FROM EVENT e
            LEFT JOIN USER u ON e.CreatedBy = u.UserID
            LEFT JOIN EVENT_ENROLLMENT ee ON e.EventID = ee.EventID
            WHERE e.StartDate < CURDATE()
            AND e.Published = TRUE 
            AND e.EventIsApproved = TRUE 
            AND e.EventIsDeleted = FALSE
            GROUP BY e.EventID
            ORDER BY e.StartDate DESC, e.StartTime DESC
        `);

        const formattedEvents = events.map(event => ({
            ...event,
            AttendeeCount: parseInt(event.CurrentAttendees) || 0
        }));

        res.json({
            success: true,
            events: formattedEvents || []
        });
    } catch (error) {
        console.error('Error fetching past events:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch past events'
        });
    }
};

export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching event ID:', id);

        const event = await findEventById(id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Log the event being sent
        console.log('Sending event:', event);

        res.json({
            success: true,
            event
        });
    } catch (error) {
        console.error('Error fetching event by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event',
            error: error.message
        });
    }
};


export const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.UserID;
        const userType = req.user.UserType;

        console.log('Update request for event:', eventId);

        // First check if event exists
        const event = await findEventById(eventId);
        if (!event) {
            return res.status(404).json({ 
                success: false,
                message: 'Event not found' 
            });
        }

        // Check authorization
        if (userType !== 'Admin' && event.CreatedBy !== userId) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to update this event' 
            });
        }

        const eventData = {
            Title: req.body.Title,
            Description: req.body.Description,
            EventType: req.body.EventType || 'Physical',
            StartDate: req.body.StartDate,
            StartTime: req.body.StartTime,
            EndDate: req.body.EndDate || req.body.StartDate,
            EndTime: req.body.EndTime || req.body.StartTime,
            Location: req.body.Location,
            Address: req.body.Address,
            Image: req.body.Image,
            Price: req.body.Price || 0,
            MaxAttendees: req.body.MaxAttendees || 100,
            TicketsAvailable: req.body.TicketsAvailable || req.body.MaxAttendees || 100
        };

        const updatedEvent = await updateEventDetails(eventId, eventData);
        
        res.json({
            success: true,
            message: 'Event updated successfully',
            event: updatedEvent
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update event',
            error: error.message 
        });
    }
};







export const deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.UserID;
        const userType = req.user.UserType;

        const event = await findEventById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (userType !== 'Admin' && event.CreatedBy !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await removeEvent(eventId);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Failed to delete event' });
    }
};

export const getEventsByOrganizer = async (req, res) => {
    try {
        const userId = req.user.UserID;
        const userType = req.user.UserType;

        let query = `
            SELECT 
                e.*,
                u.UserFullname as OrganizerName,
                COUNT(ee.EnrollmentID) as CurrentAttendees
            FROM EVENT e
            LEFT JOIN USER u ON e.CreatedBy = u.UserID
            LEFT JOIN EVENT_ENROLLMENT ee ON e.EventID = ee.EventID
            WHERE e.EventIsDeleted = FALSE
        `;

        if (userType !== 'Admin') {
            query += ` AND e.CreatedBy = ?`;
        }

        query += `
            GROUP BY e.EventID
            ORDER BY e.StartDate DESC, e.StartTime DESC
        `;

        const [events] = await pool.execute(
            query,
            userType !== 'Admin' ? [userId] : []
        );

        const formattedEvents = events.map(event => ({
            ...event,
            AttendeeCount: parseInt(event.CurrentAttendees) || 0
        }));

        res.json({
            success: true,
            events: formattedEvents
        });
    } catch (error) {
        console.error('Error fetching organizer events:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch organizer events' 
        });
    }
};

export const approveEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const adminId = req.user.UserID;

        const updatedEvent = await approveEventById(eventId, adminId);
        res.json({
            success: true,
            message: 'Event approved successfully',
            event: updatedEvent
        });
    } catch (error) {
        console.error('Error approving event:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to approve event' 
        });
    }
};

export const publishEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.UserID;
        const userType = req.user.UserType;

        const event = await findEventById(eventId);
        if (!event) {
            return res.status(404).json({ 
                success: false,
                message: 'Event not found' 
            });
        }

        if (userType !== 'Admin' && event.CreatedBy !== userId) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to publish this event' 
            });
        }

        const updatedEvent = await publishEventById(eventId);
        res.json({
            success: true,
            message: 'Event published successfully',
            event: updatedEvent
        });
    } catch (error) {
        console.error('Error publishing event:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to publish event' 
        });
    }
};
