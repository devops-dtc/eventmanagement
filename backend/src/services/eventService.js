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

// In eventService.js
export const findEventById = async (eventId) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                e.*,
                u.UserFullname as OrganizerName
            FROM EVENT e
            LEFT JOIN USER u ON e.CreatedBy = u.UserID
            WHERE e.EventID = ?`,
            [eventId]
        );
        
        if (!rows[0]) {
            return null;
        }

        const event = rows[0];
        
        // Convert LONGBLOB Image to string if it exists
        if (event.Image) {
            if (Buffer.isBuffer(event.Image)) {
                event.Image = event.Image.toString('utf8');
            } else if (typeof event.Image === 'object') {
                event.Image = Buffer.from(event.Image).toString('utf8');
            }
        }
        
        // Format dates
        if (event.StartDate) {
            event.StartDate = new Date(event.StartDate);
        }
        if (event.EndDate) {
            event.EndDate = new Date(event.EndDate);
        }

        return event;
    } catch (error) {
        console.error('Error in findEventById:', error);
        throw new Error(`Failed to fetch event: ${error.message}`);
    }
};






export const updateEventDetails = async (eventId, eventData) => {
    try {
        const query = `
            UPDATE EVENT
            SET 
                Title = ?,
                Description = ?,
                EventType = ?,
                StartDate = ?,
                StartTime = ?,
                EndDate = ?,
                EndTime = ?,
                Location = ?,
                Address = ?,
                Image = ?,
                Price = ?,
                MaxAttendees = ?,
                TicketsAvailable = ?,
                UpdatedAt = CURRENT_TIMESTAMP
            WHERE EventID = ?
        `;

        // Remove ZipCode/Pin_Code as it's not in the EVENT table
        const params = [
            eventData.Title,
            eventData.Description,
            eventData.EventType,
            eventData.StartDate,
            eventData.StartTime,
            eventData.EndDate,
            eventData.EndTime,
            eventData.Location,
            eventData.Address,
            eventData.Image ? Buffer.from(eventData.Image) : null, // Convert Image to Buffer
            eventData.Price || 0,
            eventData.MaxAttendees || 100,
            eventData.TicketsAvailable || eventData.MaxAttendees || 100,
            eventId
        ];

        console.log('Update Query Params:', {
            ...params,
            Image: eventData.Image ? 'Buffer data present' : null
        });

        const [result] = await pool.execute(query, params);

        if (result.affectedRows === 0) {
            throw new Error('Event not found or no changes made');
        }

        // Fetch and return the updated event
        return findEventById(eventId);
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