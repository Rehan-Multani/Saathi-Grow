import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAISuggestions,
  adjustInventory,
  getInventoryLogs,
  getAllInventoryLogs
} from '../controllers/productController.js';
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(protectAdmin);

router.post('/ai-suggestions', getAISuggestions);
router.get('/inventory-logs', getAllInventoryLogs);

router.route('/')
  .get(getProducts)
  .post(upload.single('image'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(upload.single('image'), updateProduct)
  .delete(restrictTo('Admin', 'Branch Manager'), deleteProduct);

router.post('/:id/inventory', adjustInventory);
router.get('/:id/inventory-logs', getInventoryLogs);

export default router;
