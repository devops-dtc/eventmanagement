import {pool} from '../config/database.js';
import { paginateResults } from '../utils/helpers.js';

export const createEventEnrollment = async (userId, eventId, paymentAmount, ticketType) => {
    const [result] = await pool.execute(
        `INSERT INTO EVENT_ENROLLMENT (
            UserID, EventID, Status, PaymentStatus, 
            PaymentAmount, TicketType
        ) VALUES (?, ?, 'Pending', 'Pending', ?, ?)`,
        [userId, eventId, paymentAmount, ticketType]
    );

    return {
        EnrollmentID: result.insertId,
        UserID: userId,
        EventID: eventId,
        Status: 'Pending',
        PaymentStatus: 'Pending',
        PaymentAmount: paymentAmount,
        TicketType: ticketType
    };
};

export const fetchEnrollments = async ({ page, limit, eventId, status }) => {
    const { limit: limitVal, offset } = paginateResults(page, limit);
    
    let query = `
        SELECT ee.*, 
               e.Title as EventTitle, 
               u.UserFullname, 
               u.UserEmail
        FROM EVENT_ENROLLMENT ee
        JOIN EVENT e ON ee.EventID = e.EventID
        JOIN USER u ON ee.UserID = u.UserID
    `;
    const queryParams = [];

    if (eventId) {
        query += ' WHERE ee.EventID = ?';
        queryParams.push(eventId);
    }

    if (status) {
        if (!eventId) {
            query += ' WHERE ';
        } else {
            query += ' AND ';
        }
        query += ' ee.Status = ?';
        queryParams.push(status);
    }

    query += ' ORDER BY ee.EnrollmentDate DESC LIMIT ? OFFSET ?';
    queryParams.push(limitVal, offset);

    const [rows] = await pool.execute(query, queryParams);
    return rows;
};

export const fetchEnrollmentDetails = async (eventId, userId) => {
    const [rows] = await pool.execute(
        `SELECT ee.*, 
         e.Title as EventTitle
        FROM EVENT_ENROLLMENT ee
        JOIN EVENT e ON ee.EventID = e.EventID
        WHERE ee.EventID = ? AND ee.UserID = ?`,
        [eventId, userId]
    );
    return rows[0];
};

export const updateEnrollmentStatus = async (enrollmentId, status, paymentStatus) => {
    await pool.execute(
        `UPDATE EVENT_ENROLLMENT
         SET Status = ?, PaymentStatus = ?
         WHERE EnrollmentID = ?`,
        [status, paymentStatus, enrollmentId]
    );

    const [rows] = await pool.execute(
        `SELECT ee.*, 
         e.Title as EventTitle,
         u.UserFullname, 
         u.UserEmail
        FROM EVENT_ENROLLMENT ee
        JOIN EVENT e ON ee.EventID = e.EventID
        JOIN USER u ON ee.UserID = u.UserID
        WHERE ee.EnrollmentID = ?`,
        [enrollmentId]
    );
    return rows[0];
};