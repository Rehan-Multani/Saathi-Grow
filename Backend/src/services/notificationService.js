import { admin as firebaseAdmin } from '../config/firebase.js';
import User from '../models/User.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import Vendor from '../models/Vendor.js';
import Branch from '../models/Branch.js';
import Admin from '../models/Admin.js';

/**
 * Send push notification to a specific user/partner
 * @param {string} recipientId - MongoDB ID of the recipient
 * @param {string} recipientModel - Model name ('User', 'DeliveryPartner', 'Vendor', 'Branch', 'Admin')
 * @param {object} notification - { title: string, body: string }
 * @param {object} data - Optional extra data payload
 */
export const sendPushNotification = async (recipientId, recipientModel, notification, data = {}) => {
  try {
    let recipient;

    // Find recipient based on model type
    switch (recipientModel) {
      case 'User': recipient = await User.findById(recipientId); break;
      case 'DeliveryPartner': recipient = await DeliveryPartner.findById(recipientId); break;
      case 'Vendor': recipient = await Vendor.findById(recipientId); break;
      case 'Branch': recipient = await Branch.findById(recipientId); break;
      case 'Admin': recipient = await Admin.findById(recipientId); break;
      default: throw new Error('Invalid recipient model');
    }

    if (!recipient) {
      console.log(`Notification recipient not found: ${recipientId} (${recipientModel})`);
      return false;
    }

    let token = null;
    if (recipientModel === 'Admin') {
      token = recipient.fcmToken?.app || recipient.fcmToken?.web;
    } else {
      token = recipient.fcmToken;
    }

    if (!token) {
      console.log(`No FCM token found for recipient: ${recipientId}`);
      return false;
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK' // For mobile apps
      },
      token: token
    };

    const response = await firebaseAdmin.messaging().send(message);
    console.log(`Successfully sent notification to ${recipientId}:`, response);
    return true;

  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

/**
 * Send notification to all admins
 */
export const notifyAdmins = async (notification, data = {}) => {
  try {
    const admins = await Admin.find({ isActive: true });
    const notifications = admins
      .filter(admin => admin.fcmToken?.app || admin.fcmToken?.web)
      .map(admin => {
        const token = admin.fcmToken.web || admin.fcmToken.app;
        return sendPushNotification(admin._id, 'Admin', notification, data);
      });

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
};
