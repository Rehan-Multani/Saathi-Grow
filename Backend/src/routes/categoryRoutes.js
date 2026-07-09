import express from 'express';
import multer from 'multer';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  bulkUploadCategories
} from '../controllers/categoryController.js';
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const csvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin only routes
router.use(protectAdmin);
router.post('/bulk-upload', restrictTo('Admin'), csvUpload.single('file'), bulkUploadCategories);
router.post('/', restrictTo('Admin'), upload.single('image'), createCategory);
router.put('/:id', restrictTo('Admin'), upload.single('image'), updateCategory);
router.delete('/:id', restrictTo('Admin'), deleteCategory);

export default router;
