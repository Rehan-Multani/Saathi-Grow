import express from 'express';
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getPayouts,
  getPayoutById,
  createPayout,
  updatePayoutStatus,
  contactVendor
} from '../controllers/vendorController.js';
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import { idempotencyGuard, sensitiveAdminActionLimiter, auditAction } from '../middleware/securityMiddleware.js';

const router = express.Router();

router.use(protectAdmin);

// Vendor Payouts
router.get('/payouts', restrictTo('Admin', 'Staff'), getPayouts);
router.get('/payouts/:id', restrictTo('Admin', 'Staff'), getPayoutById);
router.post('/payouts', restrictTo('Admin'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('VENDOR_PAYOUT_CREATE'), createPayout);
router.patch('/payouts/:id', restrictTo('Admin'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('VENDOR_PAYOUT_STATUS_UPDATE'), updatePayoutStatus);

// Vendor CRUD
router.route('/')
  .get(restrictTo('Admin', 'Staff'), getVendors)
  .post(upload.single('logo'), createVendor);

router.route('/:id')
  .get(getVendorById)
  .put(upload.single('logo'), updateVendor)
  .delete(restrictTo('Admin'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('VENDOR_DELETE'), deleteVendor);

router.post('/:id/contact', restrictTo('Admin', 'Staff'), contactVendor);

export default router;
