import express from 'express';
const router = express.Router();
import { signup, login } from '../controllers/auth.controller';

// Define routes
router.get("/login", login);
router.post("/signup", signup);

// Export the router
export default router;
