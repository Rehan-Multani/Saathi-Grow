import express from 'express';
import {
  getCampaignSections,
  createCampaignSection,
  updateCampaignSection,
  deleteCampaignSection,
  getActiveCampaignSections,
  getCampaignById,
  getCampaignMetadata,
  getCampaignProducts
} from '../controllers/campaignController.js';
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes for frontend
router.get('/public', getActiveCampaignSections);
router.get('/public/:id', getCampaignMetadata);
router.get('/public/:id/products', getCampaignProducts);

// Admin routes
router.use(protectAdmin);

router.route('/')
  .get(getCampaignSections)
  .post(restrictTo('Admin'), upload.single('bannerImage'), createCampaignSection);

router.route('/:id')
  .get(getCampaignById)
  .put(restrictTo('Admin'), upload.single('bannerImage'), updateCampaignSection)
  .delete(restrictTo('Admin'), deleteCampaignSection);

export default router;
