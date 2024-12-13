import mysql from 'mysql2';
export const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'test',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0, 
}).promise(); 
