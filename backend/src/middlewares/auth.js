import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'No token provided' 
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const [rows] = await pool.execute(
                'SELECT UserID, UserFullname, UserEmail, UserType FROM USER WHERE UserID = ?',
                [decoded.id]
            );

            if (!rows.length) {
                return res.status(401).json({ 
                    success: false,
                    message: 'User not found' 
                });
            }

            req.user = rows[0];
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid or expired token' 
            });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Authentication error' 
        });
    }
};

export const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.UserType)) {
            return res.status(403).json({ 
                success: false,
                message: 'You do not have permission to perform this action' 
            });
        }
        next();
    };
};
