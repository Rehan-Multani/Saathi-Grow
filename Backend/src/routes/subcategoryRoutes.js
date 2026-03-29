import express from 'express';
import {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory
} from '../controllers/subcategoryController.js';
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', getSubCategories);
router.get('/:id', getSubCategoryById);

// Admin only routes
router.use(protectAdmin);
router.post('/', restrictTo('Admin'), upload.single('image'), createSubCategory);
router.put('/:id', restrictTo('Admin'), upload.single('image'), updateSubCategory);
router.delete('/:id', restrictTo('Admin'), deleteSubCategory);

export default router;
