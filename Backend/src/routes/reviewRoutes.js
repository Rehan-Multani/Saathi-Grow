import express from 'express';
import { 
  getProductReviews, 
  createReview, 
  getVendorReviews, 
  replyToReview 
} from '../controllers/reviewController.js';
import { protect, protectVendor } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// User routes
router.post('/', protect, createReview);

// Vendor routes
router.get('/vendor/all', protectVendor, getVendorReviews);
router.patch('/vendor/:id/reply', protectVendor, replyToReview);

export default router;
