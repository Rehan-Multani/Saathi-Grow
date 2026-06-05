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
  getLowStockAlerts,
  bulkUploadProducts
} from '../controllers/productController.js';
import { protectAdmin, restrictTo, requirePermission, optionalProtectAdmin, protectStoreManager, optionalProtectStoreManager } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import multer from 'multer';

const csvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

// Static routes first (MUST BE ABOVE /:id)
router.get('/brands', getUniqueBrands);
router.get('/search/ai', optionalProtectStoreManager, searchProductsWithAI);

// Admin Only Static Routes
router.get('/inventory/stats', protectAdmin, requirePermission('VIEW_PRODUCTS'), getInventoryStats);
router.get('/inventory/branch-wise', protectAdmin, requirePermission('VIEW_PRODUCTS'), getBranchWiseStock);
router.get('/inventory/low-stock', protectAdmin, requirePermission('VIEW_PRODUCTS'), getLowStockAlerts);
router.post('/inventory/bulk-adjust', protectAdmin, requirePermission('MANAGE_INVENTORY'), bulkAdjustInventory);
router.post('/ai-suggestions', protectStoreManager, getAISuggestions);
router.get('/inventory-logs', protectAdmin, requirePermission('MANAGE_INVENTORY'), getAllInventoryLogs);
router.post('/bulk-upload', protectAdmin, requirePermission('MANAGE_PRODUCTS'), csvUpload.single('file'), bulkUploadProducts);

// Public/General Routes
router.get('/', optionalProtectStoreManager, getProducts);
router.get('/:id', optionalProtectStoreManager, getProductById);

// Admin Only Dynamic Routes
router.use(protectAdmin);

// Dynamic Routes Section
router.get('/:id/inventory-logs', requirePermission('MANAGE_INVENTORY'), getInventoryLogs);

router.post('/', requirePermission('MANAGE_PRODUCTS'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), createProduct);

router.route('/:id')
  .put(requirePermission('MANAGE_PRODUCTS'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), updateProduct)
  .delete(requirePermission('MANAGE_PRODUCTS'), restrictTo('Admin', 'Store Manager'), deleteProduct);

router.post('/:id/inventory', requirePermission('MANAGE_INVENTORY'), adjustInventory);

export default router;
