import express from 'express';
import { 
    createEvent, 
    getAllEvents, 
    getEventById, 
    updateEvent, 
    deleteEvent,
    getEventsByOrganizer,
    approveEvent,
    publishEvent,
    getUpcomingEvents,
    getPastEvents
} from '../controllers/eventController.js';
import { authenticateToken, checkRole } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/upcoming', getUpcomingEvents);
router.get('/past', getPastEvents);
router.get('/:id', getEventById);
router.get('/', getUpcomingEvents);  // Default route shows upcoming events

// Protected routes
router.use(authenticateToken);

// Route for both Organizer and Admin to get their events
router.get('/organizer/events', checkRole(['Organizer', 'Admin']), getEventsByOrganizer);

// Organizer & Admin routes
router.post('/', checkRole(['Organizer', 'Admin']), createEvent);
router.put('/:id', checkRole(['Organizer', 'Admin']), updateEvent);
router.delete('/:id', checkRole(['Organizer', 'Admin']), deleteEvent);
router.put('/:id/publish', checkRole(['Organizer', 'Admin']), publishEvent);

// Admin only routes
router.put('/:id/approve', checkRole(['Admin']), approveEvent);

export default router;
