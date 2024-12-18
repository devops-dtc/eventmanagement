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

// Public routes - no authentication required
router.get('/upcoming', getUpcomingEvents);
router.get('/past', getPastEvents);

// Authentication required for all routes below
router.use(authenticateToken);

// Routes for all authenticated users
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Routes for organizers and admins
router.post('/create', checkRole(['Organizer', 'Admin']), createEvent);
router.get('/organizer/events', checkRole(['Organizer', 'Admin']), getEventsByOrganizer);
router.put('/:id', checkRole(['Organizer', 'Admin']), updateEvent);
router.delete('/:id', checkRole(['Organizer', 'Admin']), deleteEvent);
router.put('/:id/publish', checkRole(['Organizer', 'Admin']), publishEvent);

// Admin-only routes
router.put('/:id/approve', checkRole(['Admin']), approveEvent);

// Export the router
export default router;
