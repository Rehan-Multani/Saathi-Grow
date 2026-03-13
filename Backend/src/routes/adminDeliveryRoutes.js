import express from 'express';
import {
  addDeliveryPartner,
  getDeliveryPartners,
  updateDeliveryPartnerStatus,
  updateDeliveryPartner,
  deleteDeliveryPartner,
  getDeliveryPartnerById,
  getUnassignedOrders,
  getAvailablePartners,
  assignOrderToPartner,
  autoAssignOrder,
  unassignOrderFromPartner,
  getActiveDeliveries,
  getCashSettlementList,
  settleRiderCash
} from '../controllers/adminDeliveryController.js';
import {
  getOrdersBySlot,
  createDeliveryRun,
  getAllDeliveryRuns,
  getDeliveryRunById,
  cancelDeliveryRun
} from '../controllers/deliveryRunController.js';
import { protectAdmin, requirePermission } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import { sensitiveAdminActionLimiter, auditAction, idempotencyGuard } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Register the Admin endpoints wrapped in standard authentication checks
router.route('/')
  .get(protectAdmin, requirePermission('MANAGE_DELIVERY'), getDeliveryPartners)
  .post(protectAdmin, requirePermission('MANAGE_DELIVERY'), idempotencyGuard(), sensitiveAdminActionLimiter, upload.single('profileImage'), auditAction('DELIVERY_PARTNER_CREATE'), addDeliveryPartner);

// Dispatch & Settlement routes (Specific paths first)
router.get('/unassigned-orders', protectAdmin, requirePermission('MANAGE_DELIVERY'), getUnassignedOrders);
router.get('/available', protectAdmin, requirePermission('MANAGE_DELIVERY'), getAvailablePartners);
router.post('/assign', protectAdmin, requirePermission('MANAGE_DELIVERY'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('ORDER_ASSIGN_MANUAL'), assignOrderToPartner);
router.post('/auto-assign/:orderId', protectAdmin, requirePermission('MANAGE_DELIVERY'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('ORDER_ASSIGN_AUTO'), autoAssignOrder);
router.post('/unassign', protectAdmin, requirePermission('MANAGE_DELIVERY'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('ORDER_UNASSIGN'), unassignOrderFromPartner);
router.get('/active-tracking', protectAdmin, requirePermission('MANAGE_DELIVERY'), getActiveDeliveries);
router.get('/cash-settlement', protectAdmin, requirePermission('MANAGE_DELIVERY'), getCashSettlementList);
router.post('/settle-cash/:id', protectAdmin, requirePermission('MANAGE_DELIVERY'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('RIDER_CASH_SETTLE'), settleRiderCash);

// --- Sprint 3: Delivery Run (Multi-order Batch) routes ---
router.get('/run/orders-by-slot', protectAdmin, requirePermission('MANAGE_DELIVERY'), getOrdersBySlot);
router.post('/run/create', protectAdmin, requirePermission('MANAGE_DELIVERY'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('DELIVERY_RUN_CREATE'), createDeliveryRun);
router.get('/run', protectAdmin, requirePermission('MANAGE_DELIVERY'), getAllDeliveryRuns);
router.get('/run/:id', protectAdmin, requirePermission('MANAGE_DELIVERY'), getDeliveryRunById);
router.delete('/run/:id', protectAdmin, requirePermission('MANAGE_DELIVERY'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('DELIVERY_RUN_CANCEL'), cancelDeliveryRun);

// Parameterized routes (Generic IDs last)
router.route('/:id/status')
  .put(protectAdmin, requirePermission('MANAGE_DELIVERY'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('DELIVERY_PARTNER_STATUS_UPDATE'), updateDeliveryPartnerStatus);

router.route('/:id')
  .get(protectAdmin, requirePermission('MANAGE_DELIVERY'), getDeliveryPartnerById)
  .put(protectAdmin, requirePermission('MANAGE_DELIVERY'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('DELIVERY_PARTNER_UPDATE'), updateDeliveryPartner)
  .delete(protectAdmin, requirePermission('MANAGE_DELIVERY'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('DELIVERY_PARTNER_DELETE'), deleteDeliveryPartner);

export default router;
