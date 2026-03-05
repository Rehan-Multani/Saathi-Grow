import express from 'express';
import {
  getDeliverySlots,
  getAllSlotsAdmin,
  createDeliverySlot,
  updateDeliverySlot,
  deleteDeliverySlot
} from '../controllers/deliverySlotController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for users during checkout
router.get('/', getDeliverySlots);

// Admin routes
router.use(protectAdmin);
router.get('/admin', getAllSlotsAdmin);
router.post('/admin', createDeliverySlot);
router.put('/admin/:id', updateDeliverySlot);
router.delete('/admin/:id', deleteDeliverySlot);

export default router;
