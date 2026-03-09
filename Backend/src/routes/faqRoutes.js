import express from 'express';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '../controllers/faqController.js';
import { protectAdmin, restrictTo, optionalProtectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for users (supports optional admin detection)
router.get('/', optionalProtectAdmin, getFAQs);

// Admin routes
router.use(protectAdmin);
router.post('/', restrictTo('Admin'), createFAQ);
router.put('/:id', restrictTo('Admin'), updateFAQ);
router.delete('/:id', restrictTo('Admin'), deleteFAQ);

export default router;
