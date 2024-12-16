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
        const eventData = {
            ...req.body,
            CreatedBy: req.user.UserID
        };

        const { isValid, errors } = validateEvent(eventData);
        if (!isValid) {
            return res.status(400).json({ errors });
        }

        const event = await createNewEvent(eventData);
        res.status(201).json({
            message: 'Event created successfully',
            event
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create event' });
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
                EventID,
                Title,
                Description,
                EventType,
                StartDate,
                StartTime,
                Location,
                Address,
                Price,
                MaxAttendees,
                AttendeeCount,
                Published,
                EventIsApproved
            FROM EVENT 
            WHERE StartDate >= CURDATE()
            AND Published = TRUE 
            AND EventIsApproved = TRUE 
            AND EventIsDeleted = FALSE
            ORDER BY StartDate ASC, StartTime ASC
        `);

        res.json({
            success: true,
            events: events
        });
    } catch (error) {
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
                EventID,
                Title,
                Description,
                EventType,
                StartDate,
                StartTime,
                Location,
                Address,
                Price,
                MaxAttendees,
                AttendeeCount,
                Published,
                EventIsApproved
            FROM EVENT 
            WHERE StartDate < CURDATE()
            AND Published = TRUE 
            AND EventIsApproved = TRUE 
            AND EventIsDeleted = FALSE
            ORDER BY StartDate DESC, StartTime DESC
        `);

        res.json({
            success: true,
            events: events || []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch past events'
        });
    }
};

export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await findEventById(id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event'
        });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.UserID;
        const userType = req.user.UserType;

        const event = await findEventById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (userType !== 'Admin' && event.CreatedBy !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        const updatedEvent = await updateEventDetails(eventId, req.body);
        res.json({
            message: 'Event updated successfully',
            event: updatedEvent
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update event' });
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
        res.status(500).json({ message: 'Failed to delete event' });
    }
};

export const getEventsByOrganizer = async (req, res) => {
    try {
        const organizerId = req.user.UserID;
        const events = await findEventsByOrganizerId(organizerId);
        res.json({
            success: true,
            events
        });
    } catch (error) {
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
        res.status(500).json({ 
            success: false,
            message: 'Failed to publish event' 
        });
    }
};
