import express from 'express';
import { raiseComplaint, getAllComplaints, escalateToStore, resolveComplaintByStore, closeTicket, getUserComplaints, getStoreComplaints, getPartnerComplaints } from '../controllers/complaintController.js';
import { protect, protectAdmin, protectVendor, protectStoreManager, protectDeliveryPartner } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';


const router = express.Router();


// User Routes
router.post('/raise', protect, upload.array('attachments', 5), raiseComplaint);
router.get('/my', protect, getUserComplaints);


// Admin Routes
router.get('/admin/all', protectAdmin, getAllComplaints);
router.put('/admin/escalate', protectAdmin, escalateToStore);
router.put('/admin/close', protectAdmin, closeTicket);

// Store (Vendor / Store Manager) Routes
router.get('/store/all', protectStoreManager, getStoreComplaints);
router.put('/store/resolve', protectStoreManager, resolveComplaintByStore);

// Delivery Partner Routes
router.get('/partner/all', protectDeliveryPartner, getPartnerComplaints);


export default router;
