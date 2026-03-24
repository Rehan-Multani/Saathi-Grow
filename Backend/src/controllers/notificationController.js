import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Vendor from '../models/Vendor.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import Notification from '../models/Notification.js';

export const updateFCMToken = async (req, res) => {
  try {
    console.log('FCM update body:', req.body);
    const { fcmToken, platform = 'app' } = req.body; 

    if (!fcmToken) {
      return res.status(400).json({ success: false, message: 'FCM Token is required' });
    }

    if (platform && !['app', 'web'].includes(platform)) {
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
      recipientModel = 'Admin'; // Fixed recipientModel for Admin
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {
      recipient: recipientId,
      recipientModel: recipientModel
    };

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      success: true, 
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
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

/**
 * Admin: Send notification
 */
export const adminSendNotification = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { title, body, targetType, recipientId, recipientType, group } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required' });
    }

    const notificationData = {
      title,
      body,
      sentBy: req.admin._id,
      type: targetType === 'broadcast' ? 'admin_broadcast' : 'individual',
      isBroadcast: targetType === 'broadcast',
      targetGroup: targetType === 'broadcast' ? (group || 'all') : undefined,
      recipient: targetType !== 'broadcast' ? recipientId : undefined,
      recipientModel: targetType !== 'broadcast' ? recipientType : undefined
    };

    const record = await Notification.create(notificationData);
    res.status(200).json({ success: true, message: 'Notification processed', record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Get Sent History
 */
export const getAdminNotificationHistory = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { sentBy: { $exists: true } };

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate('recipient', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      success: true, 
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete Notification(s) - Single or Bulk
 */
export const deleteNotifications = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting array of IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Notification IDs array is required' });
    }

    // Logic: If it's a simple user, they can only delete notifications where they are the recipient.
    // If it's an admin, they can delete anything (history or received).
    
    let query = { _id: { $in: ids } };
    
    if (!req.admin) {
      // Non-admin can only delete their own notifications
      const recipientId = req.user?._id || req.vendor?._id || req.partner?._id;
      query.recipient = recipientId;
    }

    await Notification.deleteMany(query);

    res.status(200).json({ success: true, message: 'Notifications deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Search Recipient Candidates
 */
export const searchRecipients = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { q, type } = req.query;
    if (!q || !type) return res.status(400).json({ success: false, message: 'Query and type required' });

    let results = [];
    const filter = { name: { $regex: q, $options: 'i' } };

    if (type === 'User') results = await User.find(filter).limit(20).select('name phone');
    else if (type === 'Vendor') results = await Vendor.find(filter).limit(20).select('name phone');
    else if (type === 'DeliveryPartner') results = await DeliveryPartner.find(filter).limit(20).select('name phone');
    else if (type === 'Staff') results = await Admin.find({ ...filter, role: 'Staff' }).limit(20).select('name phone');
    else if (type === 'Branch Manager') results = await Admin.find({ ...filter, role: 'Branch Manager' }).limit(20).select('name phone');

    res.status(200).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

