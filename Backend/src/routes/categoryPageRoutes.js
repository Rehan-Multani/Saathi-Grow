import express from 'express';
import { getPublicCategoryPage } from '../controllers/categoryPageController.js';

const router = express.Router();

router.get('/:slug', getPublicCategoryPage);

export default router;
