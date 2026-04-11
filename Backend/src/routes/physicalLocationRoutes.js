import express from 'express';
import {
  getAdminLocations,
  getAvailableAdminLocations,
  createAdminLocation,
  updateAdminLocation,
  deleteAdminLocation,
  bulkCreateAdminLocations
} from '../controllers/physicalLocationController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/', getAdminLocations);
router.get('/available', getAvailableAdminLocations);
router.post('/', createAdminLocation);
router.post('/bulk', bulkCreateAdminLocations);
router.put('/:id', updateAdminLocation);
router.delete('/:id', deleteAdminLocation);

export default router;
