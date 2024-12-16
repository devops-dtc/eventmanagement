// index.js

import express from 'express';
import cors from 'cors';
import config from './src/config/config.js';
import { connectDB } from './src/config/database.js';
import authRoutes from './src/routes/auth.routes.js';
import eventRoutes from './src/routes/event.routes.js';
import userRoutes from './src/routes/user.routes.js';
import enrollRoutes from './src/routes/enroll.routes.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();
const { PORT, SECURITY } = config;

// Middleware
app.use(express.json());
app.use(cors(SECURITY.CORS_OPTIONS));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/enroll', enrollRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Backend server is running' });
});

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        await connectDB();  // Connect to the database
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${config.NODE_ENV}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);  // Exit the application if server fails to start
    }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});
