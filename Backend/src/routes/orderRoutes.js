import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createCODOrder,
  calculateBill,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus,
  deleteOrder,
  getReturnRequests,
  handleStoreReturnAction,
  cancelOrderUser,
  createWalletOrder,
  requestReturn,
  createReturnBatch,
  getOrderRoute
} from '../controllers/orderController.js';
import { protect, protectAdmin, requirePermission } from '../middleware/authMiddleware.js';
import { sensitiveAdminActionLimiter, auditAction, idempotencyGuard } from '../middleware/securityMiddleware.js';

import { upload } from '../config/cloudinary.js';

const router = express.Router();

// --- Customer Order Routes ---
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/route', protect, getOrderRoute);
router.post('/:id/cancel', protect, cancelOrderUser);
router.post('/:id/return', protect, upload.array('images', 5), requestReturn);

router.post('/razorpay', protect, createRazorpayOrder);
router.post('/verify', protect, verifyRazorpayPayment);
router.post('/cod', protect, createCODOrder);
router.post('/wallet', protect, createWalletOrder);
router.post('/calculate-bill', protect, calculateBill);

// --- Admin/Staff Order Routes ---
router.get('/admin/list', protectAdmin, requirePermission('VIEW_ORDERS'), getAllOrdersAdmin);
router.get('/admin/:id', protectAdmin, requirePermission('VIEW_ORDERS'), getOrderById);
router.get('/admin/returns', protectAdmin, requirePermission('MANAGE_REFUNDS_RETURNS'), getReturnRequests);
router.put('/admin/:id/status', protectAdmin, requirePermission('MANAGE_ORDERS'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('ORDER_STATUS_UPDATE'), updateOrderStatus);
router.put('/admin/:id/return/accept', protectAdmin, requirePermission('MANAGE_REFUNDS_RETURNS'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('RETURN_REQUEST_HANDLE'), handleStoreReturnAction);
router.post('/admin/returns/batch-schedule', protectAdmin, requirePermission('MANAGE_REFUNDS_RETURNS'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('RETURN_BATCH_SCHEDULE'), createReturnBatch);
router.delete('/admin/:id', protectAdmin, requirePermission('MANAGE_ORDERS'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('ORDER_DELETE'), deleteOrder);

export default router;
