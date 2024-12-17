import { pool } from '../config/database.js';

export const createNewEvent = async (eventData) => {
    try {
        const {
            Title,
            Description,
            EventType,
            StartDate,
            StartTime,
            EndDate,
            EndTime,
            Location,
            Address,
            Price,
            MaxAttendees,
            CreatedBy,
            Published,
            EventIsDeleted,
            EventIsApproved
        } = eventData;

        const [result] = await pool.execute(
            `INSERT INTO EVENT (
                Title, Description, EventType,
                StartDate, StartTime, EndDate, EndTime,
                Location, Address, Price, MaxAttendees,
                TicketsAvailable, CreatedBy, Published,
                EventIsDeleted, EventIsApproved
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                Title,
                Description,
                EventType,
                StartDate,
                StartTime,
                EndDate || StartDate,
                EndTime || StartTime,
                Location,
                Address,
                Price,
                MaxAttendees,
                MaxAttendees, // TicketsAvailable starts equal to MaxAttendees
                CreatedBy,
                Published,
                EventIsDeleted,
                EventIsApproved
            ]
        );

        const [newEvent] = await pool.execute(
            'SELECT * FROM EVENT WHERE EventID = ?',
            [result.insertId]
        );

        return newEvent[0];
    } catch (error) {
        console.error('Error in createNewEvent:', error);
        throw new Error(`Failed to create event: ${error.message}`);
    }
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
    try {
        const {
            Title, 
            Description, 
            EventType,
            CategoryID,
            StartDate, 
            StartTime, 
            EndDate, 
            EndTime,
            VenueID,  // Add this
            Location, 
            Address,
            Price = 0, 
            MaxAttendees = 100,
            TicketsAvailable
        } = eventData;

        const query = `
            UPDATE EVENT
            SET 
                Title = ?,
                Description = ?,
                EventType = ?,
                CategoryID = ?,
                StartDate = ?,
                StartTime = ?,
                EndDate = ?,
                EndTime = ?,
                VenueID = ?,
                Location = ?,
                Address = ?,
                Price = ?,
                MaxAttendees = ?,
                TicketsAvailable = ?,
                UpdatedAt = CURRENT_TIMESTAMP
            WHERE EventID = ?
        `;

        const params = [
            Title || null,
            Description || null,
            EventType || 'Physical',
            CategoryID || null,
            StartDate || null,
            StartTime || null,
            EndDate || StartDate || null,
            EndTime || StartTime || null,
            VenueID || null,
            Location || null,
            Address || null,
            Price || 0,
            MaxAttendees || 100,
            TicketsAvailable || MaxAttendees,
            eventId
        ];

        const [result] = await pool.execute(query, params);

        if (result.affectedRows === 0) {
            throw new Error('Event not found or no changes made');
        }

        // Fetch and return the updated event with venue details
        const [updatedEvent] = await pool.execute(`
            SELECT 
                e.*,
                v.Name as VenueName,
                v.Location as VenueLocation,
                v.Address as VenueAddress,
                v.Pin_Code as VenuePinCode
            FROM EVENT e
            LEFT JOIN VENUE v ON e.VenueID = v.VenueID
            WHERE e.EventID = ?
        `, [eventId]);

        return updatedEvent[0];
    } catch (error) {
        console.error('Error in updateEventDetails:', error);
        throw new Error(`Failed to update event: ${error.message}`);
    }
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