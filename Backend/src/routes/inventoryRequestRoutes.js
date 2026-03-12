import express from 'express';
import { protectAdmin, restrictTo, requirePermission } from '../middleware/authMiddleware.js';
import {
  createRequest,
  getRequests,
  approveRequest,
  rejectRequest
} from '../controllers/inventoryRequestController.js';

const router = express.Router();

router.use(protectAdmin);

// Branch Manager & Staff routes
router.post('/', restrictTo('Branch Manager', 'Staff'), createRequest);

// Admin / Branch Manager / Staff routes
router.get('/', restrictTo('Admin', 'Branch Manager', 'Staff'), getRequests);

// Admin only routes
router.put('/:id/approve', restrictTo('Admin'), approveRequest);
router.put('/:id/reject', restrictTo('Admin'), rejectRequest);

export default router;
