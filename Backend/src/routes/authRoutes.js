import express from 'express';
import {
  requestOTP,
  verifyOTP,
  resendOTP,
  getUserProfile,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateUserOtpRequestPayload,
  validateUserOtpVerifyPayload,
  validateUserOtpResendPayload,
} from '../middleware/requestValidation.js';

import { upload } from '../config/cloudinary.js';

const router = express.Router();

// OTP Authentication Routes
router.post('/request-otp', validateUserOtpRequestPayload, requestOTP);
router.post('/verify-otp', validateUserOtpVerifyPayload, verifyOTP);
router.post('/resend-otp', validateUserOtpResendPayload, resendOTP);

// Profile Management
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('image'), updateProfile);

export default router;
