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
router.get('/past', getPastEvents);          // Make sure this comes before /:id
router.get('/upcoming', getUpcomingEvents);  // Make sure this comes before /:id
router.get('/', getUpcomingEvents);          // Default route shows upcoming events
router.get('/:id', getEventById);

// Protected routes
router.use(authenticateToken);

// Organizer routes
router.get('/organizer/events', checkRole(['Organizer']), getEventsByOrganizer);

// Organizer & Admin routes
router.post('/', checkRole(['Organizer', 'Admin']), createEvent);
router.put('/:id', checkRole(['Organizer', 'Admin']), updateEvent);
router.delete('/:id', checkRole(['Organizer', 'Admin']), deleteEvent);

// Admin only routes
router.put('/:id/approve', checkRole(['Admin']), approveEvent);
router.put('/:id/publish', checkRole(['Admin', 'Organizer']), publishEvent);

export default router;
