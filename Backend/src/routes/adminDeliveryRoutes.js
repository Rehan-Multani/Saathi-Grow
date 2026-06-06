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
import { protectStoreManager, requirePermission } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import { sensitiveAdminActionLimiter, auditAction, idempotencyGuard } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Helper to check for delivery permission (Admins only, Vendors bypass)
const deliveryAuth = (req, res, next) => {
    if (req.vendor) return next();
    if (req.admin && (['Admin', 'Store Manager', 'Staff'].includes(req.admin.role) || (req.admin.permissions || []).includes('MANAGE_DELIVERY'))) return next();
    return res.status(403).json({ message: 'Delivery Management Access Denied' });
};

// Register the Admin/Vendor endpoints
router.route('/')
  .get(protectStoreManager, deliveryAuth, getDeliveryPartners)
  .post(protectStoreManager, deliveryAuth, idempotencyGuard(), sensitiveAdminActionLimiter, upload.single('profileImage'), auditAction('DELIVERY_PARTNER_CREATE'), addDeliveryPartner);

// Dispatch & Settlement routes (Specific paths first)
router.get('/unassigned-orders', protectStoreManager, deliveryAuth, getUnassignedOrders);
router.get('/available', protectStoreManager, deliveryAuth, getAvailablePartners);
router.post('/assign', protectStoreManager, deliveryAuth, idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('ORDER_ASSIGN_MANUAL'), assignOrderToPartner);
router.post('/auto-assign/:orderId', protectStoreManager, deliveryAuth, idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('ORDER_ASSIGN_AUTO'), autoAssignOrder);
router.post('/unassign', protectStoreManager, deliveryAuth, idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('ORDER_UNASSIGN'), unassignOrderFromPartner);
router.get('/active-tracking', protectStoreManager, deliveryAuth, getActiveDeliveries);
router.get('/cash-settlement', protectStoreManager, deliveryAuth, getCashSettlementList);
router.post('/settle-cash/:id', protectStoreManager, deliveryAuth, idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('RIDER_CASH_SETTLE'), settleRiderCash);

// --- Sprint 3: Delivery Run (Multi-order Batch) routes ---
router.get('/run/orders-by-slot', protectStoreManager, deliveryAuth, getOrdersBySlot);
router.post('/run/create', protectStoreManager, deliveryAuth, idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('DELIVERY_RUN_CREATE'), createDeliveryRun);
router.get('/run', protectStoreManager, deliveryAuth, getAllDeliveryRuns);
router.get('/run/:id', protectStoreManager, deliveryAuth, getDeliveryRunById);
router.delete('/run/:id', protectStoreManager, deliveryAuth, idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('DELIVERY_RUN_CANCEL'), cancelDeliveryRun);

// Parameterized routes (Generic IDs last)
router.route('/:id/status')
  .put(protectStoreManager, deliveryAuth, idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('DELIVERY_PARTNER_STATUS_UPDATE'), updateDeliveryPartnerStatus);

router.route('/:id')
  .get(protectStoreManager, deliveryAuth, getDeliveryPartnerById)
  .put(protectStoreManager, deliveryAuth, idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('DELIVERY_PARTNER_UPDATE'), updateDeliveryPartner)
  .delete(protectStoreManager, deliveryAuth, idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('DELIVERY_PARTNER_DELETE'), deleteDeliveryPartner);

export default router;
