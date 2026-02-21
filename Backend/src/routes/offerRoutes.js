import express from 'express';
import {
  getOfferDeals,
  getOfferDealById,
  createOfferDeal,
  updateOfferDeal,
  deleteOfferDeal,
  getActiveOfferDeals
} from '../controllers/offerController.js';
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public route for frontend
router.get('/public', getActiveOfferDeals);

// Admin routes
router.use(protectAdmin);

router.route('/')
  .get(getOfferDeals)
  .post(restrictTo('Admin'), upload.single('bannerImage'), createOfferDeal);

router.route('/:id')
  .get(getOfferDealById)
  .put(restrictTo('Admin'), upload.single('bannerImage'), updateOfferDeal)
  .delete(restrictTo('Admin'), deleteOfferDeal);

export default router;
