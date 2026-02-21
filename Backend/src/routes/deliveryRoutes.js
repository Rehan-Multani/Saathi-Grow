import express from 'express';
import {
    getProfile,
    createProfile,
    updateStatus,
    updateLocation,
    getOrders,
    updateDeliveryStatus,
    getWallet,
    getDashboardStats,
    simulateOrder
} from '../controllers/deliveryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and for riders only
router.use(protect);

// Check if user is a rider - simple inline middleware
const isRider = (req, res, next) => {
    if (req.user && req.user.role === 'rider') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Only delivery partners allowed.' });
    }
};

router.use(isRider);

router.route('/profile')
    .get(getProfile)
    .post(createProfile);

router.patch('/status', updateStatus);
router.post('/location', updateLocation);

router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateDeliveryStatus);

router.get('/wallet', getWallet);
router.get('/stats', getDashboardStats);

// Simulation route (unprotected/partially protected for easy testing)
router.post('/simulate-order', simulateOrder);

export default router;
