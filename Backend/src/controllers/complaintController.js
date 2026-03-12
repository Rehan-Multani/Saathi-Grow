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

    let order = null;
    let storeId = null;
    let storeModel = null;
    let isGeneralTicket = true;

    if (orderId) {
      // Search by either custom orderId or MongoDB _id
      order = await Order.findOne({
        $or: [
          { orderId: orderId },
          { _id: mongoose.isValidObjectId(orderId) ? orderId : new mongoose.Types.ObjectId() }
        ]
      });

      if (order) {
        storeId = order.vendor || order.branchId;
        storeModel = order.vendor ? 'Vendor' : 'Branch';
        isGeneralTicket = false;
      }
    }

    // Generate Ticket ID with timestamp to prevent collisions
    const ticketId = `TKT-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

    const complaint = await Complaint.create({
      ticketId,
      order: order ? order._id : null,
      user: userId,
      store: storeId,
      storeModel,
      isGeneralTicket,
      deliveryPartner: order?.deliveryPartnerId || null,
      category,
      description: description || 'No description provided',
      attachments: finalAttachments
    });

    // Notify Admins
    await notifyAdmins({
      title: `New Ticket: ${complaint.ticketId}`,
      body: order ? `Order #${order.orderId} - ${category}` : `General - ${category}`
    }, {
      ticketId: complaint.ticketId,
      orderId: order?.orderId || 'GENERAL',
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
    const { ticketId, resolutionSolution, storeNotes, storeRecommendedRefund } = req.body;

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
    complaint.storeRecommendedRefund = storeRecommendedRefund || false;
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
    const { ticketId, processRefund, refundAmount: customAmount } = req.body;
    const complaint = await Complaint.findOne({ ticketId }).populate('order user');
    if (!complaint) return res.status(404).json({ success: false, message: 'Ticket not found' });

    complaint.status = 'CLOSED';
    complaint.closedAt = new Date();

    // REFUND PROCESSING
    if (processRefund && complaint.order && !complaint.refundProcessed) {
      const { debitVendorWallet } = await import('./orderController.js');
      const UserTransaction = (await import('../models/UserTransaction.js')).default;
      const User = (await import('../models/User.js')).default;

      const amountToRefund = customAmount || complaint.order.totalAmount;
      const user = await User.findById(complaint.user._id || complaint.user);
      
      if (user) {
        user.walletBalance = (user.walletBalance || 0) + amountToRefund;
        await user.save();

        await UserTransaction.create({
          user: user._id,
          amount: amountToRefund,
          type: 'credit',
          category: 'order_refund',
          status: 'completed',
          description: `Support Refund for Ticket ${ticketId} (Order #${complaint.order.orderId})`,
          orderId: complaint.order._id
        });

        // Debit Vendor if applicable
        if (complaint.order.vendor) {
          // Creating a mock "returned" state for debit function if needed, 
          // but better to use a direct debit or ensure debitVendorWallet handles it
          await debitVendorWallet(complaint.order);
        }

        complaint.refundProcessed = true;
        complaint.refundAmount = amountToRefund;
      }
    }

    complaint.resolutionThread.push({
      sender: req.admin._id,
      senderModel: 'Admin',
      senderName: req.admin.name || 'System Admin',
      message: `Ticket closed by Admin.${complaint.refundProcessed ? ` Refund of ₹${complaint.refundAmount} processed.` : ""}`
    });

    await complaint.save();

    res.json({ success: true, message: 'Ticket closed successfully', refundProcessed: complaint.refundProcessed });
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


