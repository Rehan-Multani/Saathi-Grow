import express from 'express';
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getPayouts,
  createPayout,
  updatePayoutStatus
} from '../controllers/vendorController.js';
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

router.use(protectAdmin);

// Vendor Payouts
router.get('/payouts', restrictTo('Admin', 'Staff'), getPayouts);
router.post('/payouts', restrictTo('Admin'), createPayout);
router.patch('/payouts/:id', restrictTo('Admin'), updatePayoutStatus);

// Vendor CRUD
router.route('/')
  .get(restrictTo('Admin', 'Staff'), getVendors)
  .post(upload.single('logo'), createVendor);

router.route('/:id')
  .get(getVendorById)
  .put(upload.single('logo'), updateVendor)
  .delete(restrictTo('Admin'), deleteVendor);

export default router;
