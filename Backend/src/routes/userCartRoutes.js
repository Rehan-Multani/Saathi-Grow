import express from 'express';
import { getCart, syncCart } from '../controllers/userCartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Ensure user is logged in

router.route('/')
  .get(getCart);

router.route('/sync')
  .post(syncCart);

export default router;
