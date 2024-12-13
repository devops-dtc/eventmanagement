import express from 'express';
import { 
    enrollEvent, 
    getEnrollments, 
    getEnrollmentDetails,
    updateEnrollment
} from '../controllers/enrollController.js';
import { authenticateToken, checkRole } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes
router.use(authenticateToken);

// Attendee routes
router.post('/events/:eventId', enrollEvent);
router.get('/events/:eventId', getEnrollmentDetails);

// Organizer & Admin routes
router.get('/', checkRole(['Organizer', 'Admin']), getEnrollments);
router.put('/:id', checkRole(['Organizer', 'Admin']), updateEnrollment);

export default router;