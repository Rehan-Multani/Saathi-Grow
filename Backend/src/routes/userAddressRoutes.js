import express from 'express';
import {
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from '../controllers/userAddressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Ensure user is logged in

router.route('/')
  .get(getMyAddresses)
  .post(addAddress);

router.route('/:id')
  .put(updateAddress)
  .delete(deleteAddress);

export default router;
