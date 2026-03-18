import { admin as firebaseAdmin } from '../config/firebase.js';
import User from '../models/User.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import Vendor from '../models/Vendor.js';
import Branch from '../models/Branch.js';
import Admin from '../models/Admin.js';

// Simple in-memory deduplication cache (store message + recipient for 10 seconds)
const sentCache = new Map();
const CACHE_TTL = 10000; // 10 seconds

/**
 * Send push notification to a specific user/partner
 * @param {string} recipientId - MongoDB ID of the recipient
 * @param {string} recipientModel - Model name ('User', 'DeliveryPartner', 'Vendor', 'Branch', 'Admin')
 * @param {object} notification - { title: string, body: string }
 * @param {object} data - Optional extra data payload
 */
export const sendPushNotification = async (recipientId, recipientModel, notification, data = {}) => {
  try {
    // Deduplication check
    const cacheKey = `${recipientId}_${notification.title}_${notification.body}`;
    if (sentCache.has(cacheKey)) {
      console.log(`Notification already sent to ${recipientId} recently. Skipping.`);
      return true;
    }
    sentCache.set(cacheKey, Date.now());
    setTimeout(() => sentCache.delete(cacheKey), CACHE_TTL);

    let recipient;
    switch (recipientModel) {
      case 'User': recipient = await User.findById(recipientId); break;
      case 'DeliveryPartner': recipient = await DeliveryPartner.findById(recipientId); break;
      case 'Vendor': recipient = await Vendor.findById(recipientId); break;
      case 'Branch': recipient = await Branch.findById(recipientId); break;
      case 'Admin': recipient = await Admin.findById(recipientId); break;
      default: throw new Error('Invalid recipient model');
    }

    if (!recipient || !recipient.fcmToken) {
      console.log(`No recipient or FCM tokens found for: ${recipientId}`);
      return false;
    }

    const tokens = [];
    if (recipient.fcmToken.app) tokens.push(recipient.fcmToken.app);
    if (recipient.fcmToken.web) tokens.push(recipient.fcmToken.web);

    if (tokens.length === 0) return false;

    const messages = tokens.map(token => ({
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      token: token
    }));

    // sendEach is the replacement for sendAll in firebase-admin 12.x
    const response = await firebaseAdmin.messaging().sendEach(messages);
    console.log(`Successfully sent notifications to ${recipientId} (${response.successCount} succeeded)`);
    return true;

  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

/**
 * Send notification to all admins/staff
 */
export const notifyAdmins = async (notification, data = {}) => {
  try {
    const admins = await Admin.find({ isActive: true });
    for (const admin of admins) {
      await sendPushNotification(admin._id, 'Admin', notification, data);
    }
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
};

/**
 * Send notification to multiple users (e.g., promotional)
 */
export const notifyUsers = async (userIds, notification, data = {}) => {
  try {
    for (const id of userIds) {
      await sendPushNotification(id, 'User', notification, data);
    }
  } catch (error) {
    console.error('Error notifying users:', error);
  }
};

