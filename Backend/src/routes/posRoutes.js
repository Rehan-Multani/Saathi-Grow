import express from 'express';
import { createPOSOrder, getPOSOrders } from '../controllers/posController.js';
import { protectStoreManager, optionalProtectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POS Routes
 * These routes are shared between Admin, Staff, and Vendors
 * protectStoreManager ensures either Admin or Vendor is authenticated
 */

// Create a POS Order (Walk-in Billing)
router.post('/create', protectStoreManager, createPOSOrder);

// Get POS Orders List (Filtered by store/branch automatically via middleware check)
router.get('/list', protectStoreManager, getPOSOrders);

export default router;
