import express from 'express';
import {
  requestOTP,
  verifyOTP,
  resendOTP,
  getUserProfile,
  updateProfile
} from '../controllers/authController.js';
import { updateFCMToken } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateUserOtpRequestPayload,
  validateUserOtpVerifyPayload,
  validateUserOtpResendPayload,
} from '../middleware/requestValidation.js';

import { userUpload } from '../config/cloudinary.js';

const router = express.Router();

// OTP Authentication Routes
router.post('/request-otp', validateUserOtpRequestPayload, requestOTP);
router.post('/verify-otp', validateUserOtpVerifyPayload, verifyOTP);
router.post('/resend-otp', validateUserOtpResendPayload, resendOTP);

// Profile Management
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, userUpload.single('image'), updateProfile);
router.put('/fcm-token', protect, updateFCMToken);

export default router;
