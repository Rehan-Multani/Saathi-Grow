import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAISuggestions
} from '../controllers/productController.js';
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(protectAdmin);

router.post('/ai-suggestions', getAISuggestions);

router.route('/')
  .get(getProducts)
  .post(upload.single('image'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(upload.single('image'), updateProduct)
  .delete(restrictTo('Admin'), deleteProduct);

export default router;
