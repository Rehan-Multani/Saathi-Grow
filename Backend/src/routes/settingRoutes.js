import express from 'express';
import { getSettings, updateSettings, getPublicSettings } from '../controllers/settingController.js';
import { protectAdmin, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for App / Frontend
router.get('/public', getPublicSettings);

// Admin Routes for Dashboard
router.get('/', protectAdmin, requirePermission('MANAGE_SETTINGS'), getSettings);
router.put('/', protectAdmin, requirePermission('MANAGE_SETTINGS'), updateSettings);

export default router;
