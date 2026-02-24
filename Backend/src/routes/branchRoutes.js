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

const router = express.Router();

router.use(protectAdmin);
router.get('/my-branch', restrictTo('Admin', 'Branch Manager'), getMyBranch);
router.put('/my-branch', restrictTo('Admin', 'Branch Manager'), updateMyBranch);

router.route('/')
  .get(getBranches)
  .post(restrictTo('Admin', 'Branch Manager'), createBranch);

router.route('/:id')
  .get(getBranchById)
  .put(restrictTo('Admin', 'Branch Manager'), updateBranch)
  .delete(restrictTo('Admin', 'Branch Manager'), deleteBranch);

export default router;
