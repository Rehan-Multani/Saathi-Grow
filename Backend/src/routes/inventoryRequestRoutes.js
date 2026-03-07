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

// Branch Manager routes
router.post('/', restrictTo('Branch Manager'), createRequest);

// Admin / Branch Manager routes
router.get('/', restrictTo('Admin', 'Branch Manager'), getRequests);

// Admin only routes
router.put('/:id/approve', restrictTo('Admin'), approveRequest);
router.put('/:id/reject', restrictTo('Admin'), rejectRequest);

export default router;
