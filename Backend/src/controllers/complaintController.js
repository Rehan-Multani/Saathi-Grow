import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
import Order from '../models/Order.js';
import { sendPushNotification, notifyAdmins } from '../services/notificationService.js';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Branch from '../models/Branch.js';

/**
 * User raises a new complaint
 */
export const raiseComplaint = async (req, res) => {
  try {
    const { orderId, category, description } = req.body;
    const userId = req.user._id;

    // Handle files from Multer
    let finalAttachments = [];
    if (req.files && req.files.length > 0) {
      finalAttachments = req.files.map(file => file.path);
    } else if (req.body.attachments) {
      // Support for case where URLs are sent directly
      finalAttachments = Array.isArray(req.body.attachments) ? req.body.attachments : [req.body.attachments];
    }

    // Search by either custom orderId or MongoDB _id to support both frontend routing patterns
    const order = await Order.findOne({
      $or: [
        { orderId: orderId },
        { _id: mongoose.isValidObjectId(orderId) ? orderId : new mongoose.Types.ObjectId() }
      ]
    }); // No need to populate for just IDs, but let's check for store

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order strictly not found' });
    }

    // Determine store (Vendor or Branch)
    // Use the raw IDs directly from the order document
    const storeId = order.vendor || order.branchId;
    const storeModel = order.vendor ? 'Vendor' : 'Branch';

    if (!storeId) {
      return res.status(400).json({ success: false, message: 'This order is not associated with a specific store.' });
    }

    // Generate Ticket ID manually to avoid "required" validation issues before pre-save hook
    const count = await Complaint.countDocuments();
    const ticketId = `TKT-${1000 + count + 1}`;

    const complaint = await Complaint.create({
      ticketId,
      order: order._id,
      user: userId,
      store: storeId,
      storeModel,
      deliveryPartner: order.deliveryPartnerId,
      category,
      description: description || 'No description provided',
      attachments: finalAttachments
    });

    // Notify Admins
    await notifyAdmins({
      title: `New Ticket Raised: ${complaint.ticketId}`,
      body: `Order #${order.orderId} - ${category}`
    }, {
      ticketId: complaint.ticketId,
      orderId: order.orderId,

      type: 'complaint'
    });

    res.status(201).json({ success: true, complaint });


  } catch (error) {
    console.error('Error raising complaint:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all complaints for Admin
 */
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name phone email')
      .populate({ path: 'order', select: 'orderId totalAmount status' })
      .populate('store')
      .sort('-createdAt');

    res.json({ success: true, complaints });
  } catch (error) {
    console.error('Error in getAllComplaints:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Admin escalates ticket to the store (Vendor/Branch)
 */
export const escalateToStore = async (req, res) => {
  try {
    const { ticketId, adminNotes } = req.body;

    const complaint = await Complaint.findOne({ ticketId }).populate('order store');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = 'ESCALATED_TO_STORE';
    complaint.adminNotes = adminNotes;
    // Logic to push admin message into thread
    complaint.resolutionThread.push({
      sender: req.admin._id,
      senderModel: 'Admin',
      message: `Ticket escalated to the store: ${adminNotes}`
    });

    await complaint.save();


    // Notify the relevant Store (Vendor or Branch Manager)
    await sendPushNotification(complaint.store._id, complaint.storeModel, {
      title: 'New Complaint Escalated',
      body: `Complaint ${ticketId} needs your attention for order ${complaint.order.orderId}`
    }, {
      ticketId: ticketId,
      orderId: complaint.order.orderId,
      type: 'escatalion'
    });

    // Notify Delivery Partner if linked
    if (complaint.deliveryPartner) {
      await sendPushNotification(complaint.deliveryPartner, 'DeliveryPartner', {
        title: 'Dispute Alert',
        body: `A complaint regarding order ${complaint.order.orderId} has been escalated.`
      }, {
        ticketId,
        type: 'dispute_alert'
      });
    }

    res.json({ success: true, message: 'Escalated to store successfully', complaint });


  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Store (Vendor/Branch) resolves the complaint
 */
export const resolveComplaintByStore = async (req, res) => {
  try {
    const { ticketId, resolutionSolution, storeNotes } = req.body;

    const complaint = await Complaint.findOne({ ticketId }).populate('order user');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Verify the user owns/manages the store
    // complaint.store is the ID of the Branch or Vendor
    const userStoreId = req.role === 'Admin'
      ? req.user.branchId?.toString()
      : req.user._id.toString();

    if (!userStoreId || complaint.store.toString() !== userStoreId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: This ticket belongs to a different store or you are not assigned to a branch.'
      });
    }

    complaint.status = 'STORE_RESPONDED';
    complaint.resolutionSolution = resolutionSolution;
    complaint.storeNotes = storeNotes;
    complaint.resolvedAt = new Date();


    complaint.resolutionThread.push({
      sender: req.user._id,
      senderModel: req.role,
      senderName: req.user.name || req.user.ownerName || 'Store Manager',
      message: `Resolution provided: ${resolutionSolution}`
    });

    await complaint.save();

    // Notify Admin of store response
    await notifyAdmins({
      title: `Store Responded: ${ticketId}`,
      body: `Resolution: ${resolutionSolution}`
    }, {
      ticketId: ticketId,
      type: 'store_response'
    });

    // Notify User of resolution
    await sendPushNotification(complaint.user._id, 'User', {
      title: 'Complaint Resolved',
      body: `Regarding order ${complaint.order.orderId}: ${resolutionSolution}`
    }, {
      ticketId: ticketId,
      type: 'resolution'
    });

    res.json({ success: true, message: 'Resolution submitted successfully', complaint });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Final closure by Admin/User
 */
export const closeTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const complaint = await Complaint.findOne({ ticketId });
    if (!complaint) return res.status(404).json({ success: false, message: 'Ticket not found' });

    complaint.status = 'CLOSED';
    complaint.closedAt = new Date();

    complaint.resolutionThread.push({
      sender: req.admin._id,
      senderModel: 'Admin',
      senderName: req.admin.name || 'System Admin',
      message: `Ticket closed by Admin.`
    });

    await complaint.save();


    res.json({ success: true, message: 'Ticket closed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get User's own complaints
 */
export const getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .populate({ path: 'order', select: 'orderId items totalAmount' })
      .sort('-createdAt');

    res.json({ success: true, complaints });
  } catch (error) {
    console.error('Error in getUserComplaints:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Get Store's (Vendor/Branch) complaints
 */
export const getStoreComplaints = async (req, res) => {
  try {
    // req.user is populated by protectStoreManager
    const storeId = req.role === 'Admin' ? req.user.branchId : req.user._id;

    if (!storeId) {
      return res.json({ success: true, complaints: [] });
    }

    const complaints = await Complaint.find({ store: storeId })
      .populate('user', 'name phone')
      .populate({ path: 'order', select: 'orderId items totalAmount' })
      .sort('-createdAt');

    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Delivery Partner's related complaints
 */
export const getPartnerComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ deliveryPartner: req.partner?._id })
      .populate('user', 'name phone')
      .populate({ path: 'order', select: 'orderId items totalAmount' })
      .sort('-createdAt');
    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


