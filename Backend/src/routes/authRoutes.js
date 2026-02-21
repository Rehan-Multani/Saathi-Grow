import express from 'express';
import {
  requestOTP,
  verifyOTP,
  resendOTP,
  getUserProfile,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

import { upload } from '../config/cloudinary.js';

const router = express.Router();

// OTP Authentication Routes
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Profile Management
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('image'), updateProfile);

export default router;
