import express from 'express';
import {
  login,
  register,
  getProfile,
  updateProfile
} from '../controllers/vendorAuthController.js';
import {
  getVendorProducts,
  addVendorProduct,
  updateVendorProduct,
  updateVendorProductStock,
  deleteVendorProduct,
  getVendorAISuggestions
} from '../controllers/vendorProductController.js';
import { getBranches } from '../controllers/branchController.js';
import {
  getVendorReturnRequests,
  handleReturnRequest,
  scheduleReturnPickup,
  getVendorOrders,
  updateVendorOrderStatus
} from '../controllers/orderController.js';
import {
  getVendorWallet,
  getVendorEarningsStats
} from '../controllers/vendorWalletController.js';
import { protectVendor } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/profile', protectVendor, getProfile);
router.put('/profile', protectVendor, upload.single('logo'), updateProfile);

// Product management for vendor
router.route('/products')
  .get(protectVendor, getVendorProducts)
  .post(protectVendor, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), addVendorProduct);

router.route('/products/:id')
  .put(protectVendor, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), updateVendorProduct)
  .delete(protectVendor, deleteVendorProduct);

router.route('/products/:id/stock')
  .patch(protectVendor, updateVendorProductStock);

router.post('/products/ai-suggestions', protectVendor, getVendorAISuggestions);
router.get('/branches', protectVendor, getBranches);
router.get('/orders', protectVendor, getVendorOrders);
router.put('/orders/:id/status', protectVendor, updateVendorOrderStatus);

// Return Request management for vendor (vendor store orders only)
router.get('/returns', protectVendor, getVendorReturnRequests);
router.put('/returns/:id', protectVendor, handleReturnRequest);
router.post('/returns/:id/schedule-pickup', protectVendor, scheduleReturnPickup);

// Wallet and Earnings
router.get('/wallet', protectVendor, getVendorWallet);
router.get('/wallet/stats', protectVendor, getVendorEarningsStats);

export default router;
