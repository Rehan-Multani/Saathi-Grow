import express from 'express';
import {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch
} from '../controllers/branchController.js';
import { protectAdmin, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectAdmin);

router.route('/')
  .get(getBranches)
  .post(restrictTo('Admin', 'Branch Manager'), createBranch);

router.route('/:id')
  .get(getBranchById)
  .put(restrictTo('Admin', 'Branch Manager'), updateBranch)
  .delete(restrictTo('Admin', 'Branch Manager'), deleteBranch);

export default router;
