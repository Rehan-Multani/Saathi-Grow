import express from 'express';
import {
    getProfile,
    updateStatus,
    updateLocation,
    getOrders,
    updateDeliveryStatus,
    getWallet,
    getDashboardStats,
    simulateOrder,
    getDeliveryDetail,
    getRouteDirections
} from '../controllers/deliveryController.js';
import { updateFCMToken } from '../controllers/notificationController.js';
import { protectDeliveryPartner } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected for delivery partners
router.use(protectDeliveryPartner);

router.get('/profile', getProfile);
router.patch('/status', updateStatus);
router.post('/location', updateLocation);
router.put('/fcm-token', updateFCMToken);


router.get('/orders', getOrders);
router.get('/orders/:id', getDeliveryDetail);
router.get('/route', getRouteDirections);
router.patch('/orders/:id/status', updateDeliveryStatus);

router.get('/wallet', getWallet);
router.get('/stats', getDashboardStats);

// Simulation route
router.post('/simulate-order', simulateOrder);

export default router;
