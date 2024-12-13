import { pool } from '../config/database.js';
import { paginateResults } from '../utils/helpers.js';

export const fetchAllUsers = async ({ page, limit, search, status }) => {
    const { limit: limitVal, offset } = paginateResults(page, limit);

    let query = `
        SELECT u.*, 
               COUNT(DISTINCT e.EventID) as CreatedEvents,
               (SELECT COUNT(*) FROM EVENT_ENROLLMENT ee WHERE ee.UserID = u.UserID) as EnrolledEvents
        FROM USER u
        LEFT JOIN EVENT e ON u.UserID = e.CreatedBy
    `;
    const queryParams = [];

    if (search) {
        query += ' WHERE u.UserFullname LIKE ? OR u.UserEmail LIKE ?';
        queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
        if (!search) {
            query += ' WHERE ';
        } else {
            query += ' AND ';
        }
        query += ' u.UserStatus = ?';
        queryParams.push(status);
    }

    query += ' GROUP BY u.UserID ORDER BY u.CreatedAt DESC LIMIT ? OFFSET ?';
    queryParams.push(limitVal, offset);

    const [rows] = await pool.execute(query, queryParams);
    return rows;
};

export const fetchUserById = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT u.*, 
         COUNT(DISTINCT e.EventID) as CreatedEvents,
         (SELECT COUNT(*) FROM EVENT_ENROLLMENT ee WHERE ee.UserID = u.UserID) as EnrolledEvents,
         (SELECT COUNT(*) FROM EVENT_ENROLLMENT ee WHERE ee.UserID = u.UserID AND e.EventIsApproved = TRUE) as ApprovedEvents
        FROM USER u
        LEFT JOIN EVENT e ON u.UserID = e.CreatedBy
        WHERE u.UserID = ?
        GROUP BY u.UserID`,
        [userId]
    );
    return rows[0];
};

export const banUserById = async (userId, bannedBy, reason) => {
    await pool.execute(
        `INSERT INTO BANNED_USERS (UserID, BannedAt, BannedBy, OriginalRole, BanReason)
         SELECT UserID, CURRENT_TIMESTAMP, ?, UserType, ?
         FROM USER 
         WHERE UserID = ?`,
        [bannedBy, reason, userId]
    );

    await pool.execute(
        'UPDATE USER SET UserStatus = "Banned", BannedAt = CURRENT_TIMESTAMP, BannedBy = ?, BanReason = ? WHERE UserID = ?',
        [bannedBy, reason, userId]
    );
};

export const unbanUserById = async (userId) => {
    await pool.execute(
        'UPDATE USER SET UserStatus = "Active", BannedAt = NULL, BannedBy = NULL, BanReason = NULL WHERE UserID = ?',
        [userId]
    );
};

export const updateUserRole = async (userId, newRole) => {
    await pool.execute(
        'UPDATE USER SET UserType = ? WHERE UserID = ?',
        [newRole, userId]
    );
};