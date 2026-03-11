import express from 'express';
import jwt from 'jsonwebtoken';
import { updateFCMToken } from '../controllers/notificationController.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Vendor from '../models/Vendor.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import { validateFcmUpdatePayload } from '../middleware/requestValidation.js';

const router = express.Router();

// Auth middleware that accepts any known role token.
const multiRoleProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);
    if (admin) {
      req.admin = admin;
      return next();
    }

    const vendor = await Vendor.findById(decoded.id);
    if (vendor) {
      if (vendor.status !== 'Active') {
        return res.status(403).json({ success: false, message: 'Account is not active' });
      }
      req.vendor = vendor;
      return next();
    }

    const partner = await DeliveryPartner.findById(decoded.id);
    if (partner) {
      if (partner.authStatus !== 'Active') {
        return res.status(403).json({ success: false, message: 'Account is suspended or inactive' });
      }
      req.partner = partner;
      return next();
    }

    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
      return next();
    }

    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

router.put('/update-token', multiRoleProtect, validateFcmUpdatePayload, updateFCMToken);

export default router;
