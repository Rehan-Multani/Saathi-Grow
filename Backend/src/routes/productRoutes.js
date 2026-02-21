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

// Public routes for products
router.get('/', getProducts);
router.get('/inventory-logs', getAllInventoryLogs);
router.get('/:id', getProductById);
router.get('/:id/inventory-logs', getInventoryLogs);

// Admin Only Routes
router.use(protectAdmin);
router.post('/ai-suggestions', getAISuggestions);

router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), createProduct);

router.route('/:id')
  .put(upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), updateProduct)
  .delete(restrictTo('Admin', 'Branch Manager'), deleteProduct);

router.post('/:id/inventory', adjustInventory);

export default router;
