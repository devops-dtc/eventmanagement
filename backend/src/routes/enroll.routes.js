import express from 'express';
import { enroll } from '../controllers/enroll.controller.js';

const router = express.Router();

// Enroll endpoint
router.post('/enroll', enroll);

export { router as enrollRoutes };
