import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

export const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

export const paginateResults = (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return {
        limit: parseInt(limit),
        offset: parseInt(offset)
    };
};