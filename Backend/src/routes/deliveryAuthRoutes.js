import express from 'express';
import {
  registerPartner,
  requestOTP,
  verifyOTP,
  getProfile,
  updateProfile,
  changePassword,
  deleteProfile
} from '../controllers/deliveryAuthController.js';
import { protectDeliveryPartner } from '../middleware/authMiddleware.js';
import {
  validateDeliveryOtpRequestPayload,
  validateDeliveryOtpVerifyPayload,
} from '../middleware/requestValidation.js';
import { deliveryUpload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/register', registerPartner);
router.post('/request-otp', validateDeliveryOtpRequestPayload, requestOTP);
router.post('/verify-otp', validateDeliveryOtpVerifyPayload, verifyOTP);

router.get('/profile', protectDeliveryPartner, getProfile);
router.put('/profile', protectDeliveryPartner, deliveryUpload.single('profileImage'), updateProfile);
router.delete('/profile', protectDeliveryPartner, deleteProfile);
router.put('/change-password', protectDeliveryPartner, changePassword);

export default router;
