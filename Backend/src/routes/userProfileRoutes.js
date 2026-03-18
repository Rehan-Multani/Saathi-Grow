import express from 'express';
import { updateFCMToken } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// User FCM Token Update
router.put('/fcm-token', protect, updateFCMToken);

export default router;
