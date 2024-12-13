import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // Server Configuration
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

    // Database Configuration
    DB: {
        HOST: process.env.DB_HOST || 'localhost',
        USER: process.env.DB_USER || 'root',
        PASSWORD: process.env.DB_PASSWORD,
        NAME: process.env.DB_NAME || 'easyevent_db',
        PORT: process.env.DB_PORT || 3306,
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0
    },

    // JWT Configuration
    JWT: {
        SECRET: process.env.JWT_SECRET || 'your-secret-key',
        EXPIRE: process.env.JWT_EXPIRE || '24h',
        REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d'
    },

    // Bcrypt Configuration
    BCRYPT: {
        SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10
    },

    // Email Configuration
    EMAIL: {
        HOST: process.env.EMAIL_HOST,
        PORT: process.env.EMAIL_PORT,
        USER: process.env.EMAIL_USER,
        PASS: process.env.EMAIL_PASS,
        FROM: process.env.EMAIL_FROM
    },

    // Pagination defaults
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    },

    // File Upload Configuration
    UPLOAD: {
        MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5242880, // 5MB
        ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
        UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads/'
    },

    // API Rate Limiting
    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 100 // limit each IP to 100 requests per windowMs
    },

    // Security Configuration
    SECURITY: {
        CORS_OPTIONS: {
            credentials: true,
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }
    },

    // Event Configuration
    EVENT: {
        MAX_ATTENDEES_DEFAULT: 100,
        MIN_PRICE: 0,
        MAX_PRICE: 10000,
        TYPES: ['Physical', 'Online', 'Hybrid']
    },

    // User Configuration
    USER: {
        ROLES: ['Admin', 'Organizer', 'Attendee'],
        STATUSES: ['Active', 'Banned', 'Suspended']
    }
};

// Environment-specific configurations
if (process.env.NODE_ENV === 'development') {
    config.isDevelopment = true;
} else if (process.env.NODE_ENV === 'production') {
    config.isDevelopment = false;
    config.SECURITY.CORS_OPTIONS.origin = process.env.FRONTEND_URL;
}

// Validation function for required environment variables
const validateConfig = () => {
    const requiredEnvVars = [
        'DB_PASSWORD',
        'JWT_SECRET'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);  // Fixed: Added backticks
    }
};

try {
    validateConfig();
} catch (error) {
    console.error('Configuration Error:', error.message);
    process.exit(1);
}

export default config;
