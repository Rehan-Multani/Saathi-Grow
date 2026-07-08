import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  sendEmailToUser,
  sendMessageToUser
} from '../controllers/userManagementController.js';
import { protectAdmin, restrictTo, requirePermission } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(protectAdmin);

router.route('/')
  .get(requirePermission('VIEW_CUSTOMERS'), getAllUsers)
  .post(restrictTo('Admin', 'Store Manager', 'Staff'), upload.single('image'), createUser);

router.delete('/bulk', restrictTo('Admin', 'Store Manager'), bulkDeleteUsers);

router.route('/:id/email')
  .post(restrictTo('Admin', 'Store Manager', 'Staff'), sendEmailToUser);

router.route('/:id/message')
  .post(restrictTo('Admin', 'Store Manager', 'Staff'), sendMessageToUser);

router.route('/:id')
  .get(requirePermission('VIEW_CUSTOMERS'), getUserById)
  .put(restrictTo('Admin', 'Store Manager', 'Staff'), upload.single('image'), updateUser)
  .delete(restrictTo('Admin', 'Store Manager'), deleteUser);

export default router;
