import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';

const { BCRYPT } = config;

export const createUser = async ({ fullname, email, password, userType }) => {
    try {
        const salt = await bcrypt.genSalt(BCRYPT.SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const [result] = await pool.execute(
            `INSERT INTO USER (UserFullname, UserEmail, UserPassword, UserType) 
             VALUES (?, ?, ?, ?)`,
            [fullname, email, hashedPassword, userType]
        );

        return {
            UserID: result.insertId,
            UserFullname: fullname,
            UserEmail: email,
            UserType: userType
        };
    } catch (error) {
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
        throw new Error('Error finding user: ' + error.message);
    }
};

export const updateUserProfile = async (userId, { fullname, email }) => {
    try {
        await pool.execute(
            'UPDATE USER SET UserFullname = ?, UserEmail = ? WHERE UserID = ?',
            [fullname, email, userId]
        );

        const [rows] = await pool.execute(
            'SELECT UserID, UserFullname, UserEmail, UserType FROM USER WHERE UserID = ?',
            [userId]
        );
        return rows[0];
    } catch (error) {
        throw new Error('Error updating user profile: ' + error.message);
    }
};
