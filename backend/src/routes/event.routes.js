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

// Protected routes first
router.use(authenticateToken);

// Specific routes before parameter routes
router.get('/upcoming', getUpcomingEvents);
router.get('/past', getPastEvents);
router.get('/organizer/events', checkRole(['Organizer', 'Admin']), getEventsByOrganizer);

// Create event route
router.post('/create', checkRole(['Organizer', 'Admin']), createEvent);

// Parameter routes
router.get('/:id', getEventById);
router.put('/:id', checkRole(['Organizer', 'Admin']), updateEvent);
router.delete('/:id', checkRole(['Organizer', 'Admin']), deleteEvent);
router.put('/:id/publish', checkRole(['Organizer', 'Admin']), publishEvent);
router.put('/:id/approve', checkRole(['Admin']), approveEvent);

// Default route
router.get('/', getUpcomingEvents);

export default router;
