import express from 'express';
import {
  requestOTP,
  verifyOTP,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/deliveryAuthController.js';
import { protectDeliveryPartner } from '../middleware/authMiddleware.js';
import {
  validateDeliveryOtpRequestPayload,
  validateDeliveryOtpVerifyPayload,
} from '../middleware/requestValidation.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/request-otp', validateDeliveryOtpRequestPayload, requestOTP);
router.post('/verify-otp', validateDeliveryOtpVerifyPayload, verifyOTP);

router.get('/profile', protectDeliveryPartner, getProfile);
router.put('/profile', protectDeliveryPartner, upload.single('profileImage'), updateProfile);
router.put('/change-password', protectDeliveryPartner, changePassword);

export default router;
