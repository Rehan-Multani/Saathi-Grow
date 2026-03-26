import express from 'express';
import { getNearbyStores, reverseGeocodeToAddress } from '../controllers/storeController.js';

const router = express.Router();

router.get('/nearby', getNearbyStores);
router.get('/reverse-geocode', reverseGeocodeToAddress);

export default router;
