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
    getRouteDirections,
    getReturnPickups,
    acceptReturnPickup,
    updateReturnPickupStatus
} from '../controllers/deliveryController.js';
import { protectDeliveryPartner } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected for delivery partners
router.use(protectDeliveryPartner);

router.get('/profile', getProfile);
router.patch('/status', updateStatus);
router.post('/location', updateLocation);

router.get('/orders', getOrders);
router.get('/orders/:id', getDeliveryDetail);
router.get('/route', getRouteDirections);
router.patch('/orders/:id/status', updateDeliveryStatus);

router.get('/wallet', getWallet);
router.get('/stats', getDashboardStats);

// Simulation route
router.post('/simulate-order', simulateOrder);

// Return Pickup Routes
router.get('/returns', getReturnPickups);
router.patch('/returns/:id/accept', acceptReturnPickup);
router.patch('/returns/:id/status', updateReturnPickupStatus);

export default router;
