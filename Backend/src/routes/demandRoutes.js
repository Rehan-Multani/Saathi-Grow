import express from 'express';
import { createDemandRequest, getDemandAnalytics } from '../controllers/demandController.js';
import { optionalProtect, protectAdmin, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// User-facing route: POST /api/demand
// Note: Optional protect for user context, but public to allow guest demand tracking
router.post('/', optionalProtect, createDemandRequest);

// Admin Analytics route: GET /api/admin/demand
// Requires Admin authentication
router.get('/admin', protectAdmin, restrictTo('Admin'), getDemandAnalytics);

export default router;
