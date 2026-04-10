import express from 'express';
import {
    adminLogin,
    forgotPassword,
    resetPassword,
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getAdminProfile,
    updateAdminProfile
} from '../controllers/adminController.js';
import { updateFCMToken } from '../controllers/notificationController.js';
import { protectAdmin, requirePermission } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import { adminLoginLimiter, adminWriteLimiter, sensitiveAdminActionLimiter, auditAction, idempotencyGuard } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', adminLoginLimiter, adminLogin);
router.post('/forgot-password', sensitiveAdminActionLimiter, forgotPassword);
router.post('/reset-password/:token', sensitiveAdminActionLimiter, resetPassword);

// Protected routes (Any authenticated admin/staff)
router.get('/profile', protectAdmin, getAdminProfile);
router.put('/profile', protectAdmin, idempotencyGuard(), adminWriteLimiter, upload.single('profileImage'), auditAction('ADMIN_PROFILE_UPDATE'), updateAdminProfile);
router.put('/fcm-token', protectAdmin, updateFCMToken);

// Staff Management (Branch Scoped for Managers/Staff with permission)
router.route('/staff')
    .get(protectAdmin, requirePermission('MANAGE_STAFF'), getAllAdmins)
    .post(protectAdmin, requirePermission('MANAGE_STAFF'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('STAFF_CREATE'), createAdmin);

router.route('/staff/:id')
    .put(protectAdmin, requirePermission('MANAGE_STAFF'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('STAFF_UPDATE'), updateAdmin)
    .delete(protectAdmin, requirePermission('MANAGE_STAFF'), idempotencyGuard(), sensitiveAdminActionLimiter, auditAction('STAFF_DELETE'), deleteAdmin);

export default router;
