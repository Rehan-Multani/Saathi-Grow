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
  getAllInventoryLogs,
  searchProductsWithAI
} from '../controllers/productController.js';
import { protectAdmin, restrictTo, requirePermission } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes for products
router.get('/', getProducts);
router.get('/search/ai', searchProductsWithAI);
router.get('/inventory-logs', getAllInventoryLogs);
router.get('/:id', getProductById);
router.get('/:id/inventory-logs', getInventoryLogs);

// Admin Only Routes
router.use(protectAdmin);
router.post('/ai-suggestions', requirePermission('VIEW_PRODUCTS'), getAISuggestions);

router.post('/', requirePermission('MANAGE_PRODUCTS'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), createProduct);

router.route('/:id')
  .put(requirePermission('MANAGE_PRODUCTS'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), updateProduct)
  .delete(requirePermission('MANAGE_PRODUCTS'), restrictTo('Admin', 'Branch Manager'), deleteProduct);

router.post('/:id/inventory', requirePermission('MANAGE_INVENTORY'), adjustInventory);

export default router;
