import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';

// JWT token generation
export const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        config.JWT.SECRET,
        { expiresIn: config.JWT.EXPIRE }
    );
};

// Password hashing
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(config.BCRYPT.SALT_ROUNDS);
    return bcrypt.hash(password, salt);
};

// Password comparison
export const comparePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

// Date formatting
export const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

// Pagination helper
export const paginateResults = (page = 1, limit = 10) => {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    return {
        limit: limitNum,
        offset: offset
    };
};

// Random string generator
export const generateRandomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Error response formatter
export const formatError = (error) => {
    return {
        success: false,
        message: error.message || 'An error occurred',
        error: config.NODE_ENV === 'development' ? error.stack : undefined
    };
};

// Success response formatter
export const formatSuccess = (data, message = 'Operation successful') => {
    return {
        success: true,
        message,
        data
    };
};

// Validate email format
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Sanitize user input
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

export default {
    generateToken,
    hashPassword,
    comparePassword,
    formatDate,
    paginateResults,
    generateRandomString,
    formatError,
    formatSuccess,
    isValidEmail,
    sanitizeInput
};
