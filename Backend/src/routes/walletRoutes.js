import express from 'express';
import { getWalletData, initiateTopup, verifyTopup } from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/data', protect, getWalletData);
router.post('/topup/initiate', protect, initiateTopup);
router.post('/topup/verify', protect, verifyTopup);

export default router;
