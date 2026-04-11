import express from 'express';
import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  getBrandByNamePublic
} from '../controllers/brandController.js';
import { protectAdmin, protectStoreManager, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/public/name/:name', getBrandByNamePublic);

// Brand routes - Allow Admin & Vendor
router.route('/')
  .get(protectStoreManager, getBrands)
  .post(protectStoreManager, upload.single('logo'), createBrand);

router.route('/:id')
  .get(protectStoreManager, getBrandById)
  .put(protectStoreManager, upload.single('logo'), updateBrand)
  .delete(protectStoreManager, deleteBrand);

export default router;
