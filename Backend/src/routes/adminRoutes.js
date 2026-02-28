import express from 'express';
import {
    adminLogin,
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getAdminProfile,
    updateAdminProfile
} from '../controllers/adminController.js';
import { protectAdmin, restrictTo, requirePermission } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public route
router.post('/login', adminLogin);

// Protected routes (Any authenticated admin/staff)
router.get('/profile', protectAdmin, getAdminProfile);
router.put('/profile', protectAdmin, upload.single('profileImage'), updateAdminProfile);

// Staff Management (Branch Scoped for Managers/Staff with permission)
router.route('/staff')
    .get(protectAdmin, requirePermission('MANAGE_STAFF'), getAllAdmins)
    .post(protectAdmin, requirePermission('MANAGE_STAFF'), createAdmin);

router.route('/staff/:id')
    .put(protectAdmin, requirePermission('MANAGE_STAFF'), updateAdmin)
    .delete(protectAdmin, requirePermission('MANAGE_STAFF'), deleteAdmin);

export default router;
