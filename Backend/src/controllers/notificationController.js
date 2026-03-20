import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Vendor from '../models/Vendor.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import Notification from '../models/Notification.js';

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

/**
 * Get notifications for the logged in user (any role)
 */
export const getMyNotifications = async (req, res) => {
  try {
    let recipientId;
    let recipientModel;

    if (req.user) {
      recipientId = req.user._id;
      recipientModel = 'User';
    } else if (req.admin) {
      recipientId = req.admin._id;
      recipientModel = 'Staff';
    } else if (req.vendor) {
      recipientId = req.vendor._id;
      recipientModel = 'Vendor';
    } else if (req.partner) {
      recipientId = req.partner._id;
      recipientModel = 'DeliveryPartner';
    }

    if (!recipientId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const notifications = await Notification.find({
      recipient: recipientId,
      recipientModel: recipientModel
    }).sort({ createdAt: -1 }).limit(50);

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mark all notifications as read for current user
 */
export const markAllRead = async (req, res) => {
  try {
    let recipientId;
    if (req.user) recipientId = req.user._id;
    else if (req.admin) recipientId = req.admin._id;
    else if (req.vendor) recipientId = req.vendor._id;
    else if (req.partner) recipientId = req.partner._id;

    await Notification.updateMany({ recipient: recipientId }, { isRead: true });
    res.status(200).json({ success: true, message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get unread notification count for current user
 */
export const getUnreadCount = async (req, res) => {
  try {
    let recipientId;
    if (req.user) recipientId = req.user._id;
    else if (req.admin) recipientId = req.admin._id;
    else if (req.vendor) recipientId = req.vendor._id;
    else if (req.partner) recipientId = req.partner._id;

    const count = await Notification.countDocuments({
      recipient: recipientId,
      isRead: false
    });

    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

