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
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public route
router.post('/login', adminLogin);

// Protected routes (Any authenticated admin/staff)
router.get('/profile', protectAdmin, getAdminProfile);
router.put('/profile', protectAdmin, upload.single('profileImage'), updateAdminProfile);

// Staff Management (Restricted to Admin and Branch Manager roles)
router.route('/staff')
    .get(protectAdmin, restrictTo('Admin', 'Branch Manager'), getAllAdmins)
    .post(protectAdmin, restrictTo('Admin', 'Branch Manager'), createAdmin);

router.route('/staff/:id')
    .put(protectAdmin, restrictTo('Admin', 'Branch Manager'), updateAdmin)
    .delete(protectAdmin, restrictTo('Admin', 'Branch Manager'), deleteAdmin);

export default router;
