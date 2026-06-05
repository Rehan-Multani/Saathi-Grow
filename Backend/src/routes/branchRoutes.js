import express from 'express';
import {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  getMyBranch,
  updateMyBranch
} from '../controllers/branchController.js';
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(protectAdmin);
router.get('/my-branch', restrictTo('Admin', 'Store Manager'), getMyBranch);
router.put('/my-branch', restrictTo('Admin', 'Store Manager'), upload.single('logo'), updateMyBranch);

router.route('/')
  .get(getBranches)
  .post(restrictTo('Admin', 'Store Manager'), upload.single('logo'), createBranch);

router.route('/:id')
  .get(getBranchById)
  .put(restrictTo('Admin', 'Store Manager'), upload.single('logo'), updateBranch)
  .delete(restrictTo('Admin', 'Store Manager'), deleteBranch);

export default router;
