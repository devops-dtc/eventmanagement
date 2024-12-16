import mysql from 'mysql2/promise';
import config from './config.js';

const { DB } = config;

const pool = mysql.createPool({
    host: DB.HOST,
    user: DB.USER,
    password: DB.PASSWORD,
    database: DB.NAME,
    port: DB.PORT,
    waitForConnections: DB.waitForConnections,
    connectionLimit: DB.connectionLimit,
    queueLimit: DB.queueLimit
});

export const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

// Change the default export to named export
export{pool};