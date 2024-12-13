import { 
    createEventEnrollment, 
    fetchEnrollments, 
    fetchEnrollmentDetails,
    updateEnrollmentStatus
} from '../services/enrollService.js';
import { pool } from '../config/database.js';
export const enrollEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.UserID;
        const { paymentAmount, ticketType } = req.body;

        const enrollment = await createEventEnrollment(userId, eventId, paymentAmount, ticketType);
        res.status(201).json({
            message: 'Event enrollment successful',
            enrollment
        });
    } catch (error) {
        console.error('Event enrollment error:', error);
        res.status(500).json({ message: 'Failed to enroll in event' });
    }
};

export const getEnrollments = async (req, res) => {
    try {
        const { page = 1, limit = 10, eventId, status } = req.query;
        const enrollments = await fetchEnrollments({ page, limit, eventId, status });
        res.json(enrollments);
    } catch (error) {
        console.error('Enrollment fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch enrollments' });
    }
};

export const getEnrollmentDetails = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.UserID;
        const enrollment = await fetchEnrollmentDetails(eventId, userId);
        res.json(enrollment);
    } catch (error) {
        console.error('Enrollment details fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch enrollment details' });
    }
};

export const updateEnrollment = async (req, res) => {
    try {
        const enrollmentId = req.params.id;
        const { status, paymentStatus } = req.body;
        const updatedEnrollment = await updateEnrollmentStatus(enrollmentId, status, paymentStatus);
        res.json({
            message: 'Enrollment updated successfully',
            enrollment: updatedEnrollment
        });
    } catch (error) {
        console.error('Enrollment update error:', error);
        res.status(500).json({ message: 'Failed to update enrollment' });
    }
};