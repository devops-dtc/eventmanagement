import express from 'express';
import { 
    getAllUsers, 
    getUserDetails, 
    banUser, 
    unbanUser,
    changeUserRole
} from '../controllers/userController.js';
import { authenticateToken, checkRole } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Admin-only routes
router.get('/', checkRole(['Admin']), getAllUsers);
router.get('/:id', checkRole(['Admin']), getUserDetails);
router.post('/:id/ban', checkRole(['Admin']), banUser);
router.post('/:id/unban', checkRole(['Admin']), unbanUser);
router.put('/:id/role', checkRole(['Admin']), changeUserRole);

export default router;