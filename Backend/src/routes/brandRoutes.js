import express from 'express';
import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand
} from '../controllers/brandController.js';
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// All brand routes are protected (Admin/Staff)
router.use(protectAdmin);

router.route('/')
  .get(getBrands)
  .post(upload.single('logo'), createBrand);

router.route('/:id')
  .get(getBrandById)
  .put(upload.single('logo'), updateBrand)
  .delete(restrictTo('Admin'), deleteBrand);

export default router;
