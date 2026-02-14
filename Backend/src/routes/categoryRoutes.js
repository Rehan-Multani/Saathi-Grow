import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// All brand routes are protected (Admin/Staff)
router.use(protectAdmin);

router.route('/')
  .get(getCategories)
  .post(upload.single('image'), createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(upload.single('image'), updateCategory)
  .delete(restrictTo('Admin'), deleteCategory);

export default router;
