import express from 'express';
import {
  login,
  register,
  getProfile,
  updateProfile,
  getBankAccount,
  saveBankAccount,
  deleteBankAccount,
  forgotPassword,
  resetPassword
} from '../controllers/vendorAuthController.js';
import { updateFCMToken } from '../controllers/notificationController.js';

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
  getVendorLocations,
  getAvailableVendorLocations,
  createVendorLocation,
  updateVendorLocation,
  deleteVendorLocation
} from '../controllers/physicalLocationController.js';
import {
  getVendorReturnRequests,
  handleStoreReturnAction,
  getVendorOrders,
  lookupVendorOrder,
  updateVendorOrderStatus
} from '../controllers/orderController.js';
import {
  getVendorWallet,
  getVendorEarningsStats,
  requestWithdrawal,
  getWithdrawalRequests
} from '../controllers/vendorWalletController.js';
import {
  getOfferDeals,
  getOfferDealById,
  createOfferDeal,
  updateOfferDeal,
  deleteOfferDeal
} from '../controllers/offerController.js';
import { protectVendor } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/profile', protectVendor, getProfile);
router.get('/dashboard/stats', protectVendor, async (req, res) => {
  const { getVendorDashboardStats } = await import('../controllers/dashboardController.js');
  return getVendorDashboardStats(req, res);
});
router.put('/profile', protectVendor, upload.single('logo'), updateProfile);
router.put('/fcm-token', protectVendor, updateFCMToken);


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

// Vendor Physical Location Management (their own store)
router.get('/locations', protectVendor, getVendorLocations);
router.get('/locations/available', protectVendor, getAvailableVendorLocations);
router.post('/locations', protectVendor, createVendorLocation);
router.put('/locations/:id', protectVendor, updateVendorLocation);
router.delete('/locations/:id', protectVendor, deleteVendorLocation);

router.get('/orders', protectVendor, getVendorOrders);
router.get('/orders/lookup', protectVendor, lookupVendorOrder);
router.put('/orders/:id/status', protectVendor, updateVendorOrderStatus);

// Return Request management for vendor (vendor store orders only)
router.get('/returns', protectVendor, getVendorReturnRequests);
router.put('/returns/:id', protectVendor, handleStoreReturnAction);

// Wallet and Earnings
router.get('/wallet', protectVendor, getVendorWallet);
router.get('/wallet/stats', protectVendor, getVendorEarningsStats);
router.post('/wallet/withdraw', protectVendor, requestWithdrawal);
router.get('/wallet/withdrawals', protectVendor, getWithdrawalRequests);

// Bank Account (one per vendor)
router.get('/bank-account', protectVendor, getBankAccount);
router.put('/bank-account', protectVendor, saveBankAccount);
router.delete('/bank-account', protectVendor, deleteBankAccount);

// Vendor Offers
router.route('/offers')
  .get(protectVendor, getOfferDeals)
  .post(protectVendor, upload.single('bannerImage'), createOfferDeal);

router.route('/offers/:id')
  .get(protectVendor, getOfferDealById)
  .put(protectVendor, upload.single('bannerImage'), updateOfferDeal)
  .delete(protectVendor, deleteOfferDeal);

export default router;
