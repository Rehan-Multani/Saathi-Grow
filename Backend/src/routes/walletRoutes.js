import express from 'express';
import { getWalletData, initiateTopup, verifyTopup } from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  walletTopupInitiateLimiter,
  walletTopupVerifyLimiter
} from '../middleware/securityMiddleware.js';

const router = express.Router();

router.get('/data', protect, getWalletData);
router.post('/topup/initiate', protect, walletTopupInitiateLimiter, initiateTopup);
router.post('/topup/verify', protect, walletTopupVerifyLimiter, verifyTopup);

export default router;
