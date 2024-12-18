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
                AttendeeCount, CreatedBy, Published,
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
                MaxAttendees, 
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
        
        // Handle Image field
        if (event.Image) {
            if (Buffer.isBuffer(event.Image)) {
                // Convert Buffer to string
                const imageString = event.Image.toString('utf8');
                // Check if it's a URL
                if (imageString.startsWith('http')) {
                    event.Image = imageString;
                } else {
                    // If not a URL, use placeholder
                    event.Image = `https://picsum.photos/seed/${event.EventID}/800/400`;
                }
            } else if (typeof event.Image === 'string') {
                // If already a string, use it directly if it's a URL
                if (!event.Image.startsWith('http')) {
                    event.Image = `https://picsum.photos/seed/${event.EventID}/800/400`;
                }
            }
        } else {
            // If no image, use placeholder
            event.Image = `https://picsum.photos/seed/${event.EventID}/800/400`;
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
        // First, check if the image is a URL
        let imageBuffer = null;
        if (eventData.Image && typeof eventData.Image === 'string' && eventData.Image.startsWith('http')) {
            imageBuffer = Buffer.from(eventData.Image);
        }

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
                AttendeeCount = ?,
                UpdatedAt = CURRENT_TIMESTAMP
            WHERE EventID = ?
        `;

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
            imageBuffer, // Use the prepared image buffer
            eventData.Price || 0,
            eventData.MaxAttendees || Nan,
            eventData.AttendeeCount || Nan,
            eventId
        ];

        const [result] = await pool.execute(query, params);

        if (result.affectedRows === 0) {
            throw new Error('Event not found or no changes made');
        }

        // Fetch and return the updated event
        const updatedEvent = await findEventById(eventId);
        if (!updatedEvent) {
            throw new Error('Failed to fetch updated event');
        }

        return updatedEvent;
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