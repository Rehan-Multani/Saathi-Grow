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
  deleteVendorProduct
} from '../controllers/vendorProductController.js';
import {
  getVendorReturnRequests,
  handleReturnRequest,
  scheduleReturnPickup
} from '../controllers/orderController.js';
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

// Return Request management for vendor (vendor store orders only)
router.get('/returns', protectVendor, getVendorReturnRequests);
router.put('/returns/:id', protectVendor, handleReturnRequest);
router.post('/returns/:id/schedule-pickup', protectVendor, scheduleReturnPickup);

export default router;
