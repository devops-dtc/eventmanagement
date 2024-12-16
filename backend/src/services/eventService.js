import { pool } from '../config/database.js';
import { paginateResults } from '../utils/helpers.js';

export const createNewEvent = async (eventData) => {
    const {
        Title, Description, EventType, CategoryID,
        StartDate, StartTime, EndDate, EndTime,
        Location, Address, Price, MaxAttendees,
        CreatedBy
    } = eventData;

    const [result] = await pool.execute(
        `INSERT INTO EVENT (
            Title, Description, EventType, CategoryID,
            StartDate, StartTime, EndDate, EndTime,
            Location, Address, Price, MaxAttendees,
            TicketsAvailable, CreatedBy
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            Title, Description, EventType, CategoryID,
            StartDate, StartTime, EndDate, EndTime,
            Location, Address, Price, MaxAttendees,
            MaxAttendees, CreatedBy
        ]
    );

    return findEventById(result.insertId);
};

export const findAllEvents = async (options = {}) => {
    try {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        
        const query = `
            SELECT 
                e.*,
                u.UserFullname as OrganizerName,
                ec.CategoryName,
                COALESCE((
                    SELECT COUNT(*) 
                    FROM EVENT_ENROLLMENT 
                    WHERE EventID = e.EventID
                ), 0) as AttendeeCount
            FROM EVENT e
            LEFT JOIN USER u ON e.CreatedBy = u.UserID
            LEFT JOIN EVENT_CATEGORY ec ON e.CategoryID = ec.CategoryID
            WHERE e.EventIsDeleted = FALSE 
            AND e.Published = TRUE
            ORDER BY e.StartDate ASC
            LIMIT ? OFFSET ?
        `;

        const [rows] = await pool.query(query, [limit, offset]);
        return rows;
    } catch (error) {
        console.error('Error in findAllEvents:', error);
        throw error;
    }
};

export const findEventById = async (eventId) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                e.*,
                u.UserFullname as OrganizerName,
                ec.CategoryName
            FROM EVENT e
            LEFT JOIN USER u ON e.CreatedBy = u.UserID
            LEFT JOIN EVENT_CATEGORY ec ON e.CategoryID = ec.CategoryID
            WHERE e.EventID = ? 
            AND e.EventIsDeleted = FALSE
            AND e.Published = TRUE`,
            [eventId]
        );
        return rows[0];
    } catch (error) {
        console.error('Error in findEventById:', error);
        throw error;
    }
};

export const updateEventDetails = async (eventId, eventData) => {
    const {
        Title, Description, EventType, CategoryID,
        StartDate, StartTime, EndDate, EndTime,
        Location, Address, Price, MaxAttendees
    } = eventData;

    await pool.execute(
        `UPDATE EVENT
         SET Title = ?, Description = ?, EventType = ?, CategoryID = ?,
             StartDate = ?, StartTime = ?, EndDate = ?, EndTime = ?,
             Location = ?, Address = ?, Price = ?, MaxAttendees = ?,
             TicketsAvailable = MaxAttendees, UpdatedAt = CURRENT_TIMESTAMP
         WHERE EventID = ?`,
        [
            Title, Description, EventType, CategoryID,
            StartDate, StartTime, EndDate, EndTime,
            Location, Address, Price, MaxAttendees,
            eventId
        ]
    );

    return findEventById(eventId);
};

export const removeEvent = async (eventId) => {
    await pool.execute(
        'UPDATE EVENT SET EventIsDeleted = TRUE WHERE EventID = ?',
        [eventId]
    );
};

export const findEventsByOrganizerId = async (organizerId) => {
    const [rows] = await pool.execute(
        `SELECT e.*, 
         ec.CategoryName,
         (SELECT COUNT(*) FROM EVENT_ENROLLMENT WHERE EventID = e.EventID) as AttendeeCount
        FROM EVENT e
        JOIN EVENT_CATEGORY ec ON e.CategoryID = ec.CategoryID
        WHERE e.CreatedBy = ? AND e.EventIsDeleted = FALSE`,
        [organizerId]
    );
    return rows;
};

export const approveEventById = async (eventId, adminId) => {
    await pool.execute(
        `UPDATE EVENT
         SET EventIsApproved = TRUE, EventApprovedBy = ?, EventApprovedTime = CURRENT_TIMESTAMP
         WHERE EventID = ?`,
        [adminId, eventId]
    );
    return findEventById(eventId);
};

export const publishEventById = async (eventId) => {
    await pool.execute(
        'UPDATE EVENT SET Published = TRUE WHERE EventID = ?',
        [eventId]
    );
    return findEventById(eventId);
};