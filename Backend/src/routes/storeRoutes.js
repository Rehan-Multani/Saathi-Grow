import express from 'express';
import { getNearbyStores } from '../controllers/storeController.js';

const router = express.Router();

router.get('/nearby', getNearbyStores);

export default router;
