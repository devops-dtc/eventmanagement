import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await pool.execute(
            'SELECT UserID, UserFullname, UserEmail, UserType FROM USER WHERE UserID = ?',
            [decoded.id]
        );

        if (!rows.length) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = rows[0];
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

export const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.UserType)) {
            return res.status(403).json({ 
                message: 'You do not have permission to perform this action' 
            });
        }
        next();
    };
};