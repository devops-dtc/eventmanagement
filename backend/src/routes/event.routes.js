import express from 'express';
import { 
    createEvent, 
    getAllEvents, 
    getEventById, 
    updateEvent, 
    deleteEvent,
    getEventsByOrganizer,
    approveEvent,
    publishEvent
} from '../controllers/eventController.js';
import { authenticateToken, checkRole } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes
router.use(authenticateToken);

// Organizer & Admin routes
router.post('/', checkRole(['Organizer', 'Admin']), createEvent);
router.put('/:id', checkRole(['Organizer', 'Admin']), updateEvent);
router.delete('/:id', checkRole(['Organizer', 'Admin']), deleteEvent);
router.get('/organizer/events', checkRole(['Organizer']), getEventsByOrganizer);

// Admin only routes
router.put('/:id/approve', checkRole(['Admin']), approveEvent);
router.put('/:id/publish', checkRole(['Admin', 'Organizer']), publishEvent);

export default router;