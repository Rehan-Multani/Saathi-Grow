import express from 'express';
import {
    createPromoCode,
    getAllPromoCodes,
    getPromoCodeById,
    updatePromoCode,
    deletePromoCode,
    validatePromoCode,
    getApplicablePromoCodes,
    getUpsellingPromoCodes
} from '../controllers/promoCodeController.js';
import { protect, protectAdmin } from '../middleware/authMiddleware.js';

import { upload } from '../config/cloudinary.js';

const router = express.Router();

// User validation and listing routes (must be before :id route)
router.post('/validate', protect, validatePromoCode);
router.post('/applicable', protect, getApplicablePromoCodes);
router.post('/upselling', protect, getUpsellingPromoCodes);

// Admin routes
router.route('/')
    .get(protectAdmin, getAllPromoCodes)
    .post(protectAdmin, upload.single('giftImage'), createPromoCode);

router.route('/:id')
    .get(protectAdmin, getPromoCodeById)
    .put(protectAdmin, upload.single('giftImage'), updatePromoCode)
    .delete(protectAdmin, deletePromoCode);

export default router;
