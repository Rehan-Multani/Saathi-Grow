import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userManagementController.js';
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(protectAdmin);
router.use(restrictTo('Admin', 'Branch Manager'));

router.route('/')
  .get(getAllUsers)
  .post(upload.single('image'), createUser);

router.route('/:id')
  .get(getUserById)
  .put(upload.single('image'), updateUser)
  .delete(deleteUser);

export default router;
