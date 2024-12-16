import { pool } from '../config/database.js';
import { hashPassword } from '../utils/helpers.js';

export const createUser = async ({ fullname, email, password, userType }) => {
    try {
        const hashedPassword = await hashPassword(password);
        
        const [result] = await pool.execute(
            `INSERT INTO USER (UserFullname, UserEmail, UserPassword, UserType, UserStatus) 
             VALUES (?, ?, ?, ?, 'Active')`,
            [fullname, email, hashedPassword, userType]
        );

        const [user] = await pool.execute(
            'SELECT UserID, UserFullname, UserEmail, UserType FROM USER WHERE UserID = ?',
            [result.insertId]
        );

        return user[0];
    } catch (error) {
        console.error('Error in createUser:', error);
        throw new Error('Error creating user: ' + error.message);
    }
};

export const findUserByEmail = async (email) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM USER WHERE UserEmail = ?',
            [email]
        );
        return rows[0];
    } catch (error) {
        console.error('Error in findUserByEmail:', error);
        throw new Error('Error finding user: ' + error.message);
    }
};
