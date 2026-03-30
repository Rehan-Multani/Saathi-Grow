import express from 'express';
import {
  getCategoryPages,
  getCategoryPageById,
  createCategoryPage,
  updateCategoryPage,
  deleteCategoryPage
} from '../controllers/categoryPageController.js';
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';
import { memoryUpload } from '../config/cloudinary.js';

const router = express.Router();

router.use(protectAdmin);
router.use(restrictTo('Admin'));

router.route('/')
  .get(getCategoryPages)
  .post(memoryUpload.any(), createCategoryPage);

router.route('/:id')
  .get(getCategoryPageById)
  .put(memoryUpload.any(), updateCategoryPage)
  .delete(deleteCategoryPage);

export default router;
