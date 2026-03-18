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

    if (!['app', 'web'].includes(platform)) {
      return res.status(400).json({ success: false, message: 'Invalid platform. Must be "app" or "web"' });
    }

    let target;
    // Identify which user object exists in request (populated by respective middleware)
    if (req.user) target = await User.findById(req.user._id);
    else if (req.admin) target = await Admin.findById(req.admin._id);
    else if (req.vendor) target = await Vendor.findById(req.vendor._id);
    else if (req.partner) target = await DeliveryPartner.findById(req.partner._id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update the correct platform token
    if (!target.fcmToken) {
      target.fcmToken = { app: '', web: '' };
    }
    
    if (platform === 'app') {
      target.fcmToken.app = fcmToken;
    } else {
      target.fcmToken.web = fcmToken;
    }

    await target.save();

    res.status(200).json({ 
      success: true, 
      message: `FCM ${platform} token updated successfully` 
    });
  } catch (error) {
    console.error('FCM update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

