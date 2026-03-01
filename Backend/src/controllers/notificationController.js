import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Vendor from '../models/Vendor.js';
import DeliveryPartner from '../models/DeliveryPartner.js';

export const updateFCMToken = async (req, res) => {
  try {
    const { fcmToken, platform } = req.body; // platform: 'app' or 'web'

    if (!fcmToken) {
      return res.status(400).json({ success: false, message: 'FCM Token is required' });
    }

    // Identify which user object exists in request (populated by middleware)
    if (req.admin) {
      if (platform === 'app') req.admin.fcmToken.app = fcmToken;
      else req.admin.fcmToken.web = fcmToken;
      await req.admin.save();
    } else if (req.vendor) {
      req.vendor.fcmToken = fcmToken;
      await req.vendor.save();
    } else if (req.partner) {
      req.partner.fcmToken = fcmToken;
      await req.partner.save();
    } else if (req.user) {
      req.user.fcmToken = fcmToken;
      await req.user.save();
    } else {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    res.status(200).json({ success: true, message: 'FCM Token updated successfully' });
  } catch (error) {
    console.error('FCM update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
