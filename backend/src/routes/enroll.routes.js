import express from 'express';
import { 
    enrollEvent, 
    getEnrollments, 
    getEnrollmentDetails,
    updateEnrollment,
    removeEnrollment
} from '../controllers/enrollController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes - all routes require authentication
router.use(authenticateToken);

// Enrollment routes
router.get('/events', getEnrollments);  // Get user's enrolled events
router.post('/events/:eventId', enrollEvent);  // Enroll in an event
router.get('/events/:eventId', getEnrollmentDetails);  // Get specific enrollment details
router.put('/:id', updateEnrollment);  // Update enrollment status
router.delete('/:id', removeEnrollment);  // Remove enrollment

export default router;
