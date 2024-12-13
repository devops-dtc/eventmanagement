import { db } from '../config/database.js';

export const enroll = async (req, res) => {
    const { UserID, EventID } = req.body;

    // Validate input
    if (!UserID || !EventID) {
        return res.status(400).json({ message: 'UserID and EventID are required' });
    }

    try {
        // Check if user exists
        const [userResult] = await db.query("SELECT * FROM User WHERE UserID = ?", [UserID]);
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if event exists
        const [eventResult] = await db.query("SELECT * FROM Event WHERE EventID = ?", [EventID]);
        if (eventResult.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if the user is already enrolled in the event
        const [enrollmentCheck] = await db.query(
            "SELECT * FROM UserEvent WHERE UserID = ? AND EventID = ?",
            [UserID, EventID]
        );
        if (enrollmentCheck.length > 0) {
            return res.status(400).json({ message: 'User is already enrolled in this event' });
        }

        // Enroll user in the event
        await db.query(
            "INSERT INTO UserEvent (UserID, EventID) VALUES (?, ?)",
            [UserID, EventID]
        );

        res.status(201).json({ message: 'User enrolled successfully' });
    } catch (error) {
        console.error("Error enrolling user:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
