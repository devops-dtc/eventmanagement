import express from 'express';
const router = express.Router();
import { signup, login } from '../controllers/auth.controller.js';

// Define routes
router.get("/login", login);
router.post("/signup", signup);

// Export the router
export { router as authroutes };
