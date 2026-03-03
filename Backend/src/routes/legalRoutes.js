import express from 'express';
import {
  getLegalPagesForAdmin,
  createLegalPage,
  updateLegalPage,
  deleteLegalPage,
  getLegalPageBySlug,
  getLegalPagesByAudience
} from '../controllers/legalPageController.js';
import { protectAdmin, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/list/:audience', getLegalPagesByAudience);

// Admin only routes
router.route('/admin')
  .get(protectAdmin, getLegalPagesForAdmin)
  .post(protectAdmin, requirePermission('MANAGE_SETTINGS'), createLegalPage);

router.route('/admin/:id')
  .put(protectAdmin, requirePermission('MANAGE_SETTINGS'), updateLegalPage)
  .delete(protectAdmin, requirePermission('MANAGE_SETTINGS'), deleteLegalPage);

// Generic slug - must be last
router.get('/:slug', getLegalPageBySlug);

export default router;
