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
  searchProductsWithAI,
  getUniqueBrands,
  getInventoryStats,
  bulkAdjustInventory,
  getBranchWiseStock,
  getLowStockAlerts
} from '../controllers/productController.js';
import { protectAdmin, restrictTo, requirePermission, optionalProtectAdmin, optionalProtectStoreManager } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes for products (Optional Auth for branch/vendor scoping)
router.get('/', optionalProtectStoreManager, getProducts);
router.get('/brands', getUniqueBrands);
router.get('/search/ai', optionalProtectStoreManager, searchProductsWithAI);
router.get('/:id', optionalProtectStoreManager, getProductById);

// Admin Only Routes
router.use(protectAdmin);

// Static Admin Routes (MUST BE ABOVE /:id)
router.get('/inventory/stats', requirePermission('VIEW_PRODUCTS'), getInventoryStats);
router.get('/inventory/branch-wise', requirePermission('VIEW_PRODUCTS'), getBranchWiseStock);
router.get('/inventory/low-stock', requirePermission('VIEW_PRODUCTS'), getLowStockAlerts);
router.post('/inventory/bulk-adjust', requirePermission('MANAGE_INVENTORY'), bulkAdjustInventory);
router.post('/ai-suggestions', requirePermission('VIEW_PRODUCTS'), getAISuggestions);
router.get('/inventory-logs', requirePermission('MANAGE_INVENTORY'), getAllInventoryLogs);

// Dynamic Routes Section
router.get('/:id/inventory-logs', requirePermission('MANAGE_INVENTORY'), getInventoryLogs);

router.post('/', requirePermission('MANAGE_PRODUCTS'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), createProduct);

router.route('/:id')
  .put(requirePermission('MANAGE_PRODUCTS'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), updateProduct)
  .delete(requirePermission('MANAGE_PRODUCTS'), restrictTo('Admin', 'Branch Manager'), deleteProduct);

router.post('/:id/inventory', requirePermission('MANAGE_INVENTORY'), adjustInventory);

export default router;
