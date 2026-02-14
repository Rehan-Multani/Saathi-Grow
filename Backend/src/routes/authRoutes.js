import express from 'express';
import {
  requestOTP,
  verifyOTP,
  getUserProfile,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// OTP Authentication Routes
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);

// Profile Management
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);

export default router;
