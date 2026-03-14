import express from 'express';
import {
    createPromoCode,
    getAllPromoCodes,
    getPromoCodeById,
    updatePromoCode,
    deletePromoCode,
    validatePromoCode,
    getApplicablePromoCodes
} from '../controllers/promoCodeController.js';
import { protect, protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User validation and listing routes (must be before :id route)
router.post('/validate', protect, validatePromoCode);
router.post('/applicable', protect, getApplicablePromoCodes);

// Admin routes
router.route('/')
    .get(protectAdmin, getAllPromoCodes)
    .post(protectAdmin, createPromoCode);

router.route('/:id')
    .get(protectAdmin, getPromoCodeById)
    .put(protectAdmin, updatePromoCode)
    .delete(protectAdmin, deletePromoCode);

export default router;
