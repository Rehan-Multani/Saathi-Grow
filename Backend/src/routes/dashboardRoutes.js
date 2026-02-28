import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get Stats for Admin/Staff/Manager Dashboard
// Base protectAdmin is enough since the controller handles scope natively.
router.get('/stats', protectAdmin, getDashboardStats);

export default router;
