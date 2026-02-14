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

// Staff Management (Restricted to main 'Admin' role)
router.route('/staff')
    .get(protectAdmin, restrictTo('Admin'), getAllAdmins)
    .post(protectAdmin, restrictTo('Admin'), createAdmin);

router.route('/staff/:id')
    .put(protectAdmin, restrictTo('Admin'), updateAdmin)
    .delete(protectAdmin, restrictTo('Admin'), deleteAdmin);

export default router;
