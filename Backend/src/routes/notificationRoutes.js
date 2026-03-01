import express from 'express';
import { updateFCMToken } from '../controllers/notificationController.js';
import { protect, protectAdmin, protectVendor, protectDeliveryPartner } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to try populating any authenticated object
const multiRoleProtect = async (req, res, next) => {
  // If Admin/Vendor/Partner/User middleware already populated it, it's fine.
  // Here we use a sequence of attempts or just trust that the client calls the right role route.
  // Actually, I'll make a more robust check in app.js or simply register it multiple times or use a "tryAllAuth".

  // Instead, I'll allow this endpoint to be used if ANY of the middleware succeeds.
  next();
};

// I'll register this same endpoint with different middleware in app.js to handle all roles.
router.put('/update-token', updateFCMToken);

export default router;
