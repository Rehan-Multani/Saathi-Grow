import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  sendEmailToUser,
  sendMessageToUser
} from '../controllers/userManagementController.js';
import { protectAdmin, restrictTo, requirePermission } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(protectAdmin);

router.route('/')
  .get(requirePermission('VIEW_CUSTOMERS'), getAllUsers)
  .post(restrictTo('Admin', 'Branch Manager', 'Staff'), upload.single('image'), createUser);

router.route('/:id/email')
  .post(restrictTo('Admin', 'Branch Manager', 'Staff'), sendEmailToUser);

router.route('/:id/message')
  .post(restrictTo('Admin', 'Branch Manager', 'Staff'), sendMessageToUser);

router.route('/:id')
  .get(requirePermission('VIEW_CUSTOMERS'), getUserById)
  .put(restrictTo('Admin', 'Branch Manager', 'Staff'), upload.single('image'), updateUser)
  .delete(restrictTo('Admin', 'Branch Manager'), deleteUser);

export default router;
