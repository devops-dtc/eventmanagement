import express from 'express';
import { 
    register, 
    login, 
    logout, 
    validateToken 
} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/validate', authenticateToken, validateToken);

export default router;
