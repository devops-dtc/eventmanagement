import { pool } from '../config/database.js';

export const enrollEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.UserID;
        const { paymentAmount, ticketType } = req.body;

        // Check if already enrolled
        const [existingEnrollment] = await pool.execute(
            'SELECT * FROM EVENT_ENROLLMENT WHERE UserID = ? AND EventID = ?',
            [userId, eventId]
        );

        if (existingEnrollment.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Already enrolled in this event' 
            });
        }

        // Create enrollment
        const [result] = await pool.execute(
            `INSERT INTO EVENT_ENROLLMENT (
                UserID, EventID, Status, PaymentStatus, 
                PaymentAmount, TicketType, EnrollmentDate
            ) VALUES (?, ?, 'Confirmed', 'Completed', ?, ?, CURRENT_TIMESTAMP)`,
            [userId, eventId, paymentAmount, ticketType]
        );

        // Update event attendee count
        await pool.execute(
            'UPDATE EVENT SET AttendeeCount = AttendeeCount + 1 WHERE EventID = ?',
            [eventId]
        );

        res.status(201).json({
            success: true,
            message: 'Event enrollment successful',
            enrollmentId: result.insertId
        });
    } catch (error) {
        console.error('Event enrollment error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to enroll in event' 
        });
    }
};

export const getEnrollments = async (req, res) => {
    try {
        const userId = req.user.UserID;
        const [enrollments] = await pool.execute(`
            SELECT 
                e.EventID,
                e.Title,
                e.Description,
                e.StartDate,
                e.StartTime,
                e.Location,
                e.Price,
                e.MaxAttendees,
                e.AttendeeCount,
                e.Image,
                ee.EnrollmentID,
                ee.Status as EnrollmentStatus,
                ee.PaymentStatus,
                ee.PaymentAmount,
                ee.EnrollmentDate
            FROM EVENT e
            JOIN EVENT_ENROLLMENT ee ON e.EventID = ee.EventID
            WHERE ee.UserID = ?
            ORDER BY e.StartDate ASC`,
            [userId]
        );

        res.json({
            success: true,
            events: enrollments
        });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch enrollments' 
        });
    }
};

export const getEnrollmentDetails = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.UserID;
        
        const [enrollment] = await pool.execute(`
            SELECT 
                ee.*,
                e.Title as EventTitle,
                e.StartDate,
                e.StartTime,
                e.Location
            FROM EVENT_ENROLLMENT ee
            JOIN EVENT e ON ee.EventID = e.EventID
            WHERE ee.EventID = ? AND ee.UserID = ?`,
            [eventId, userId]
        );

        if (enrollment.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        res.json({
            success: true,
            enrollment: enrollment[0]
        });
    } catch (error) {
        console.error('Error fetching enrollment details:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch enrollment details' 
        });
    }
};

export const updateEnrollment = async (req, res) => {
    try {
        const enrollmentId = req.params.id;
        const { status, paymentStatus } = req.body;

        await pool.execute(
            `UPDATE EVENT_ENROLLMENT 
             SET Status = ?, PaymentStatus = ?, UpdatedAt = CURRENT_TIMESTAMP
             WHERE EnrollmentID = ?`,
            [status, paymentStatus, enrollmentId]
        );

        res.json({
            success: true,
            message: 'Enrollment updated successfully'
        });
    } catch (error) {
        console.error('Error updating enrollment:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update enrollment' 
        });
    }
};

export const removeEnrollment = async (req, res) => {
    try {
        const enrollmentId = req.params.id;
        const userId = req.user.UserID;

        // Get the event ID before deleting the enrollment
        const [enrollment] = await pool.execute(
            'SELECT EventID FROM EVENT_ENROLLMENT WHERE EnrollmentID = ? AND UserID = ?',
            [enrollmentId, userId]
        );

        if (enrollment.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        const eventId = enrollment[0].EventID;

        // Delete the enrollment
        await pool.execute(
            'DELETE FROM EVENT_ENROLLMENT WHERE EnrollmentID = ? AND UserID = ?',
            [enrollmentId, userId]
        );

        // Update event attendee count
        await pool.execute(
            'UPDATE EVENT SET AttendeeCount = AttendeeCount - 1 WHERE EventID = ?',
            [eventId]
        );

        res.json({
            success: true,
            message: 'Enrollment removed successfully'
        });
    } catch (error) {
        console.error('Error removing enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove enrollment'
        });
    }
};
