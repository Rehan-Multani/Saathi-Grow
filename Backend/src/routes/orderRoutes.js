import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createCODOrder,
  calculateBill,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, protectAdmin, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Customer Order Routes ---
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

router.post('/razorpay', protect, createRazorpayOrder);
router.post('/verify', protect, verifyRazorpayPayment);
router.post('/cod', protect, createCODOrder);
router.post('/calculate-bill', protect, calculateBill);

// --- Admin/Staff Order Routes ---
router.get('/admin/list', protectAdmin, requirePermission('VIEW_ORDERS'), getAllOrdersAdmin);
router.put('/admin/:id/status', protectAdmin, requirePermission('MANAGE_ORDERS'), updateOrderStatus);

export default router;
