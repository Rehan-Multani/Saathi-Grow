import express from 'express';
import {
  addDeliveryPartner,
  getDeliveryPartners,
  updateDeliveryPartnerStatus,
  deleteDeliveryPartner,
  getUnassignedOrders,
  getAvailablePartners,
  assignOrderToPartner,
  autoAssignOrder,
  unassignOrderFromPartner,
  getActiveDeliveries
} from '../controllers/adminDeliveryController.js';
import { protectAdmin, requirePermission } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Register the Admin endpoints wrapped in standard authentication checks
router.route('/')
  .get(protectAdmin, requirePermission('MANAGE_DELIVERY'), getDeliveryPartners)
  .post(protectAdmin, requirePermission('MANAGE_DELIVERY'), upload.single('profileImage'), addDeliveryPartner);

router.route('/:id/status')
  .put(protectAdmin, requirePermission('MANAGE_DELIVERY'), updateDeliveryPartnerStatus);

router.route('/:id')
  .delete(protectAdmin, requirePermission('MANAGE_DELIVERY'), deleteDeliveryPartner);

// Dispatch routes
router.get('/unassigned-orders', protectAdmin, requirePermission('MANAGE_DELIVERY'), getUnassignedOrders);
router.get('/available', protectAdmin, requirePermission('MANAGE_DELIVERY'), getAvailablePartners);
router.post('/assign', protectAdmin, requirePermission('MANAGE_DELIVERY'), assignOrderToPartner);
router.post('/auto-assign/:orderId', protectAdmin, requirePermission('MANAGE_DELIVERY'), autoAssignOrder);
router.post('/unassign', protectAdmin, requirePermission('MANAGE_DELIVERY'), unassignOrderFromPartner);
router.get('/active-tracking', protectAdmin, requirePermission('MANAGE_DELIVERY'), getActiveDeliveries);

export default router;
