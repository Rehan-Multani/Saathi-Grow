import express from 'express';
import { 
  getSalesReports, 
  exportSalesReport, 
  getInventoryReports, 
  exportInventoryReport,
  getVendorReports,
  exportVendorReport,
  getRevenueAnalytics,
  getAdminVendorEarnings,
  getAdminVendorPayoutDetail,
  getBranchStrategicAnalytics
} from '../controllers/reportController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Sales Reports
router.get('/sales', protectAdmin, getSalesReports);
router.get('/sales/export', protectAdmin, exportSalesReport);

// Inventory Reports
router.get('/inventory', protectAdmin, getInventoryReports);
router.get('/inventory/export', protectAdmin, exportInventoryReport);

// Vendor Performance Reports
router.get('/vendors', protectAdmin, getVendorReports);
router.get('/vendors/export', protectAdmin, exportVendorReport);

// Revenue & Financial Analytics
router.get('/revenue-analytics', protectAdmin, getRevenueAnalytics);
router.get('/strategic-analytics', protectAdmin, getBranchStrategicAnalytics);
router.get('/vendor-earnings', protectAdmin, getAdminVendorEarnings);
router.get('/vendor-payouts/:id', protectAdmin, getAdminVendorPayoutDetail);

export default router;
