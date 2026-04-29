import mongoose from 'mongoose';
import DeliveryPartner from '../models/DeliveryPartner.js';
import Order from '../models/Order.js';
import Vendor from '../models/Vendor.js';
import Branch from '../models/Branch.js';
import OrderDelivery from '../models/OrderDelivery.js';
import DeliveryRun from '../models/DeliveryRun.js';
import CashCollection from '../models/CashCollection.js';
import Admin from '../models/Admin.js';
import { sendPushNotification } from '../services/notificationService.js';
import { sendWelcomeEmail, sendSystemNotificationEmail } from '../services/emailService.js';

// Helper to generate 4-digit numeric OTP securely
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const getPaginationParams = (query = {}) => {
  const hasPagination = query.page !== undefined || query.limit !== undefined;
  const pageNumber = Math.max(parseInt(query.page, 10) || 1, 1);
  const limitNumber = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return { hasPagination, pageNumber, limitNumber };
};

/**
 * Dispatch Controller Engine - Core Logic for Assignment / Tracking
 */

// @desc    Register a new Delivery Partner
// @route   POST /api/admin/delivery-partners
// @access  Private (Admin)
export const addDeliveryPartner = async (req, res) => {
  try {
    const { name, phone, email, password, vehicleType, vehicleNumber } = req.body;

    const partnerExists = await DeliveryPartner.findOne({ phone });

    if (partnerExists) {
      return res.status(400).json({ message: 'A Delivery Partner with this phone number already exists' });
    }

    let profileImage = '';
    let profileImagePublicId = '';
    if (req.file) {
      profileImage = req.file.path;
      profileImagePublicId = req.file.filename;
    }

    const partner = await DeliveryPartner.create({
      name,
      phone,
      email,
      password: password || undefined, // Password is now optional for OTP login
      vehicleType,
      vehicleNumber,
      profileImage,
      profileImagePublicId
    });

    if (partner) {
      // Send Welcome Email (We do this BEFORE response to ensure audit, but catch error to not block UI)
      try {
        await sendWelcomeEmail(partner.email, partner.name, 'Rider', password || 'Logged via Mobile OTP');
      } catch (emailErr) {
        console.error('[EMAIL-DELAY] Welcome email background failure:', emailErr.message);
      }

      return res.status(201).json({
        _id: partner._id,
        uniqueId: partner.uniqueId,
        name: partner.name,
        phone: partner.phone,
        email: partner.email,
        vehicleType: partner.vehicleType,
        authStatus: partner.authStatus,
        dutyStatus: partner.dutyStatus
      });
    } else {
      res.status(400).json({ message: 'Invalid delivery partner data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error adding delivery partner' });
  }
};

// @desc    Get all delivery partners for Admin table
// @route   GET /api/admin/delivery-partners
// @access  Private (Admin/Manager)
export const getDeliveryPartners = async (req, res) => {
  try {
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const pageNumber = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const search = (req.query.search || '').trim();
    let query = {};

    // If Branch Manager, we show all partners (fleet is usually shared)
    // but we could filter by proximity in the future if branch has its own geo-fence
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { uniqueId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { vehicleType: { $regex: search, $options: 'i' } }
      ];
    }

    const partnersQuery = DeliveryPartner.find(query).sort({ createdAt: -1 }).lean();

    if (hasPagination) {
      const total = await DeliveryPartner.countDocuments(query);
      const partners = await partnersQuery
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      res.set('X-Total-Count', String(total));
      res.set('X-Page', String(pageNumber));
      res.set('X-Limit', String(limitNumber));
      res.set('X-Total-Pages', String(Math.ceil(total / limitNumber) || 1));
      return res.json(partners);
    }

    const partners = await partnersQuery;
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching delivery partners' });
  }
};

// @desc    Update delivery partner generic status (Active/Suspended)
// @route   PUT /api/admin/delivery-partners/:id/status
// @access  Private (Admin)
export const updateDeliveryPartnerStatus = async (req, res) => {
  try {
    const { authStatus } = req.body;
    const partner = await DeliveryPartner.findById(req.params.id);

    if (partner) {
      partner.authStatus = authStatus;
      const updatedPartner = await partner.save();
      res.json(updatedPartner);

      // Notify on Status Change
      const title = 'Account Status Update';
      const body = `Your Partner account status has been updated to ${authStatus}.`;
      await sendSystemNotificationEmail(partner.email, `Partner Account: ${authStatus}`, title, body);
      await sendPushNotification(partner._id, 'DeliveryPartner', { title, body }, { type: 'auth_status', status: authStatus });
    } else {
      res.status(404).json({ message: 'Delivery partner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating status' });
  }
};

// @desc    Update delivery partner generic details
// @route   PUT /api/admin/delivery-partners/:id
// @access  Private (Admin)
export const updateDeliveryPartner = async (req, res) => {
  try {
    const { name, phone, authStatus, vehicleType, vehicleNumber, email } = req.body;
    const partner = await DeliveryPartner.findById(req.params.id);

    if (partner) {
      partner.name = name || partner.name;
      partner.phone = phone || partner.phone;
      partner.authStatus = authStatus || partner.authStatus;
      partner.vehicleType = vehicleType || partner.vehicleType;
      partner.vehicleNumber = vehicleNumber || partner.vehicleNumber;
      partner.email = email || partner.email;

      const updatedPartner = await partner.save();
      res.json(updatedPartner);
    } else {
      res.status(404).json({ message: 'Delivery partner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating partner' });
  }
};

// @desc    Get single delivery partner with stats and recent orders
// @route   GET /api/admin/delivery-partners/:id
// @access  Private (Admin/Manager)
export const getDeliveryPartnerById = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id).lean();

    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    // Fetch recent deliveries
    const recentOrders = await Order.find({ deliveryPartnerId: partner._id })
      .select('orderId status items totalAmount createdAt paymentStatus shippingAddress')
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name phone')
      .lean();

    // Fetch total deliveries count (Actual count from orders)
    const totalDeliveriesCount = await Order.countDocuments({
      deliveryPartnerId: partner._id,
      status: 'delivered'
    });

    // Calculate this month's earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthOrders = await Order.find({
      deliveryPartnerId: partner._id,
      status: 'delivered',
      'deliveryTimestamps.deliveredAt': { $gte: startOfMonth }
    }).select('deliveryFee').lean();

    const earningsThisMonth = monthOrders.reduce((acc, order) => acc + (order.deliveryFee || 0), 0);

    res.json({
      ...partner,
      totalDeliveries: totalDeliveriesCount,
      recentDeliveries: recentOrders,
      earningsThisMonth
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching partner details' });
  }
};

// @desc    Delete a delivery partner
// @route   DELETE /api/admin/delivery-partners/:id
// @access  Private (Admin)
export const deleteDeliveryPartner = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id);

    if (partner) {
      // Cannot delete if active on a delivery
      if (partner.assignmentStatus === 'Busy' || partner.activeOrder) {
        return res.status(400).json({ message: 'Cannot delete a partner currently executing a live order' });
      }
      await partner.deleteOne();
      res.json({ message: 'Delivery Partner forcefully removed' });
    } else {
      res.status(404).json({ message: 'Partner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting partner' });
  }
};

// --- PHASE 2: DISPATCH & ASSIGNMENT ENGINE ---

// @desc    Get all active unassigned orders (status 'confirmed' or 'preparing')
// @route   GET /api/admin/delivery-partners/unassigned-orders
// @access  Private (Admin/Manager)
export const getUnassignedOrders = async (req, res) => {
  try {
    const { hasPagination, pageNumber, limitNumber } = getPaginationParams(req.query);
    const admin = req.admin;
    const query = {
      status: { $in: ['confirmed', 'preparing', 'pending', 'ready_for_pickup'] },
      deliveryPartnerId: null
    };

    if (admin.role !== 'Admin') {
      if (!admin.branchId) return res.status(403).json({ message: 'No branch assigned' });
      query.branchId = admin.branchId;
    }

    const listQuery = Order.find(query)
      .select('orderId user shippingAddress totalAmount paymentMethod status createdAt deliverySlot isImmediate branchId vendor')
      .populate('user', 'name phone')
      .sort({ createdAt: 1 }) // Oldest first (FIFO)
      .lean();

    if (hasPagination) {
      const total = await Order.countDocuments(query);
      const orders = await listQuery
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      res.set('X-Total-Count', String(total));
      res.set('X-Page', String(pageNumber));
      res.set('X-Limit', String(limitNumber));
      res.set('X-Total-Pages', String(Math.ceil(total / limitNumber) || 1));
      return res.json(orders);
    }

    const orders = await listQuery;

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching pending orders' });
  }
};

// @desc    Get all available delivery partners
// @route   GET /api/admin/delivery-partners/available
// @access  Private (Admin)
export const getAvailablePartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find({
      authStatus: 'Active',
      // Allowing admin to assign orders to riders even if they haven't explicitly started their 'Online' shift
      assignmentStatus: 'Free'
    })
      .select('name phone uniqueId vehicleType vehicleNumber profileImage authStatus dutyStatus assignmentStatus currentLocation activeOrder createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching available partners' });
  }
};

// Helper for assignment logic (internal use)
const performAssignment = async (orderId, partnerId, session) => {
  // 1. Fetch both with write-locks logic applied (or transaction guaranteed isolation)
  const order = await Order.findById(orderId).session(session);
  if (!order) throw new Error('Order not found');
  if (order.orderSource === 'pos') throw new Error('Assignment failed: POS orders do not require delivery partners');
  if (order.deliveryPartnerId) throw new Error('Order is already assigned to a driver');
  
  const finalizedStatuses = ['delivered', 'cancelled', 'returned', 'return_picked_up'];
  if (finalizedStatuses.includes(order.status)) {
    throw new Error(`Cannot assign a partner to an order that is already ${order.status.replace(/_/g, ' ')}`);
  }

  const partner = await DeliveryPartner.findById(partnerId).session(session);
  if (!partner) throw new Error('Delivery Partner not found');
  if (partner.authStatus !== 'Active') throw new Error('Partner is suspended or unverified');
  if (partner.assignmentStatus !== 'Free') throw new Error('Partner is currently running an active order');

  // 2. Generate Delivery Validation PIN (OTP)
  const securePin = generateOTP();

  // 3. Update the Order
  order.deliveryPartnerId = partner._id;
  order.deliveryOTP = securePin;
  order.deliveryTimestamps = { assignedAt: Date.now() };

  // Changing status to preparing if it was pending/confirmed so vendor/branch knows rider is coming.
  if (['pending', 'confirmed'].includes(order.status)) {
    order.status = 'preparing';
  }

  // 3.5 Create/Update OrderDelivery record for tracking consistency (Legacy Stats Support)
  let deliveryRecord = await OrderDelivery.findOne({ order: order._id }).session(session);
  if (!deliveryRecord) {
    deliveryRecord = new OrderDelivery({
      order: order._id,
      deliveryPartner: partner._id,
      status: 'assigned',
      assignedAt: Date.now(),
      deliveryFee: order.deliveryFee || 0
    });
  } else {
    deliveryRecord.deliveryPartner = partner._id;
    deliveryRecord.status = 'assigned';
    deliveryRecord.assignedAt = Date.now();
  }
  await deliveryRecord.save({ session });

  // 3.6 Create DeliveryRun so it shows up in the rider app (Sprint 1 Architecture)
  const runIdString = `RUN-${Date.now().toString().slice(-6)}-${partner.uniqueId.slice(-4)}`;
  const run = new DeliveryRun({
    runId: runIdString,
    deliveryPartner: partner._id,
    slotDate: new Date(),
    isImmediate: true,
    branchId: order.branchId || null,
    orders: [{
      order: order._id,
      stopSequence: 1,
      status: 'pending',
      deliveryOTP: securePin
    }],
    status: 'assigned',
    assignedAt: new Date()
  });
  await run.save({ session });

  // 4. Update the Delivery Partner
  partner.assignmentStatus = 'Busy';
  partner.activeOrder = order._id;
  partner.activeRun = run._id;
  partner.currentStopIndex = 0;
  await partner.save({ session });

  // 5. Link Order back to Run
  order.deliveryRunId = run._id;
  order.stopSequence = 1;
  await order.save({ session });

  // 6. Notify the Delivery Partner (Push)
  await sendPushNotification(partner._id, 'DeliveryPartner', {
    title: 'New Order Assigned!',
    body: `Pickup from ${order.vendor?.storeName || 'Branch'}. Order #${order.orderId}`
  }, { orderId: order._id.toString(), type: 'assignment' });

  return { order, partner, run };
};

// @desc    Atomically Force-Assign an Order to a specific Free Partner
// @route   POST /api/admin/delivery-partners/assign
// @access  Private (Admin)
export const assignOrderToPartner = async (req, res) => {
  if (req.admin.role !== 'Admin') {
    return res.status(403).json({ message: 'Only Super Admins can manually assign delivery partners.' });
  }
  const session = await mongoose.startSession();
  let result;
  try {
    const { orderId, partnerId } = req.body;
    await session.withTransaction(async () => {
      result = await performAssignment(orderId, partnerId, session);
    });

    res.json({ message: 'Order Assigned Successfully', ...result });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Assignment Transaction Failed' });
  } finally {
    await session.endSession();
  }
};

// @desc    Auto-assign an order to the nearest available partner
// @route   POST /api/admin/delivery-partners/auto-assign/:orderId
// @access  Private (Admin)
export const autoAssignOrder = async (req, res) => {
  if (req.admin.role !== 'Admin') {
    return res.status(403).json({ message: 'Only Super Admins can use auto-assignment features.' });
  }
  const session = await mongoose.startSession();
  let result;
  try {
    const { orderId } = req.params;
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId)
        .populate('vendor')
        .populate('branchId')
        .session(session);

      if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
      }
      if (order.deliveryPartnerId) {
        const err = new Error('Order already assigned');
        err.statusCode = 400;
        throw err;
      }

      let pickupLocation = null;
      if (order.vendor && order.vendor.address && order.vendor.address.location) {
        pickupLocation = order.vendor.address.location;
      } else if (order.branchId && order.branchId.address && order.branchId.address.location) {
        pickupLocation = order.branchId.address.location;
      }

      if (!pickupLocation || !pickupLocation.coordinates || pickupLocation.coordinates.length < 2) {
        const err = new Error('Pickup location (Vendor/Branch) missing valid coordinates');
        err.statusCode = 400;
        throw err;
      }

      const nearestPartner = await DeliveryPartner.findOne({
        authStatus: 'Active',
        assignmentStatus: 'Free',
        currentLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: pickupLocation.coordinates
            },
            $maxDistance: 10000
          }
        }
      }).session(session);

      if (!nearestPartner) {
        const err = new Error('No available delivery partners found near the pickup location');
        err.statusCode = 404;
        throw err;
      }

      result = await performAssignment(order._id, nearestPartner._id, session);
    });

    res.json({ message: 'Auto-assigned to nearest partner', ...result });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Auto-assignment failed' });
  } finally {
    await session.endSession();
  }
};

// @desc    Unassign an order from its current driver
// @route   POST /api/admin/delivery-partners/unassign
// @access  Private (Admin)
export const unassignOrderFromPartner = async (req, res) => {
  if (req.admin.role !== 'Admin') {
    return res.status(403).json({ message: 'Only Super Admins can unassign delivery partners.' });
  }
  const session = await mongoose.startSession();
  let unassignedOrderId = null;
  try {
    const { orderId } = req.body;
    await session.withTransaction(async () => {
      const query = mongoose.isValidObjectId(orderId)
        ? { _id: orderId }
        : { orderId };

      const order = await Order.findOne(query).session(session);
      if (!order) {
        const err = new Error('Order record not found');
        err.statusCode = 404;
        throw err;
      }

      const deliveryRecord = await OrderDelivery.findOne({ order: order._id }).session(session);
      const partnerId = order.deliveryPartnerId || deliveryRecord?.deliveryPartner;

      if (!partnerId) {
        const err = new Error(`Order ${order.orderId} is not currently assigned to any driver in the system.`);
        err.statusCode = 400;
        throw err;
      }

      if (['out_for_delivery', 'delivered'].includes(order.status)) {
        const err = new Error('Cannot unassign an order that has already been picked up or delivered');
        err.statusCode = 400;
        throw err;
      }

      const partner = await DeliveryPartner.findById(partnerId).session(session);

      order.deliveryPartnerId = null;
      order.deliveryOTP = null;
      if (order.deliveryTimestamps) {
        order.deliveryTimestamps.assignedAt = null;
      }
      order.status = 'confirmed';
      await order.save({ session });

      if (deliveryRecord) {
        await OrderDelivery.deleteOne({ _id: deliveryRecord._id }).session(session);
      }

      const run = await DeliveryRun.findOne({
        deliveryPartner: partnerId,
        'orders.order': order._id,
        status: { $in: ['assigned', 'in_progress'] }
      }).session(session);
      if (run) {
        await run.deleteOne({ session });
      }

      if (partner) {
        partner.assignmentStatus = 'Free';
        partner.activeOrder = null;
        partner.activeRun = null;
        partner.currentStopIndex = 0;
        await partner.save({ session });

        // Notify Partner of Unassignment
        await sendPushNotification(partner._id, 'DeliveryPartner', {
          title: 'Order Unassigned',
          body: `Order #${unassignedOrderId || order.orderId} was unassigned from you.`
        }, { type: 'unassignment' });
      }

      unassignedOrderId = order.orderId;
    });

    res.json({ message: 'Order unassigned and returned to pool', orderId: unassignedOrderId });
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message || 'Unassignment failed' });
  } finally {
    await session.endSession();
  }
};

// @desc    Get all active deliveries for Live Tracking Map
// @route   GET /api/admin/delivery-partners/active-tracking
// @access  Private (Admin/Manager)
export const getActiveDeliveries = async (req, res) => {
  try {
    const { hasPagination, pageNumber, limitNumber } = getPaginationParams(req.query);
    const admin = req.admin;
    const query = {
      deliveryPartnerId: { $ne: null },
      status: { $in: ['preparing', 'ready_for_pickup', 'out_for_delivery'] }
    };

    if (admin.role !== 'Admin') {
      if (!admin.branchId) return res.status(403).json({ message: 'No branch assigned' });
      query.branchId = admin.branchId;
    }

    const listQuery = Order.find(query)
      .select('orderId status shippingAddress totalAmount createdAt updatedAt deliveryPartnerId deliveryRunId vendor branchId user')
      .populate('deliveryPartnerId', 'name phone currentLocation vehicleType vehicleNumber profileImage')
      .populate('vendor', 'storeName address')
      .populate('branchId', 'name address')
      .populate('user', 'name phone')
      .populate('deliveryRunId', 'optimizedRoute status runId')
      .sort({ updatedAt: -1 })
      .lean();

    if (hasPagination) {
      const total = await Order.countDocuments(query);
      const activeOrders = await listQuery
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      res.set('X-Total-Count', String(total));
      res.set('X-Page', String(pageNumber));
      res.set('X-Limit', String(limitNumber));
      res.set('X-Total-Pages', String(Math.ceil(total / limitNumber) || 1));
      return res.json(activeOrders);
    }

    const activeOrders = await listQuery;

    res.json(activeOrders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching tracking data' });
  }
};

/**
 * CASH SETTLEMENT / COD CONCILIATION (PHASE 3)
 */

// @desc    Get all partners with their current cash-on-hand liability
// @route   GET /api/admin/delivery-partners/cash-settlement
// @access  Private (Admin)
export const getCashSettlementList = async (req, res) => {
  try {
    const { hasPagination, pageNumber, limitNumber } = getPaginationParams(req.query);
    const { search } = req.query;

    const query = { cashInHand: { $gt: 0 } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { uniqueId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Get summary stats (total pending cash and active collector count)
    const summaryStats = await DeliveryPartner.aggregate([
      { $match: { cashInHand: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          totalPendingCash: { $sum: '$cashInHand' },
          activeCollectors: { $sum: 1 }
        }
      }
    ]);

    const stats = summaryStats[0] || { totalPendingCash: 0, activeCollectors: 0 };

    const listQuery = DeliveryPartner.find(query)
      .select('name phone uniqueId cashInHand profileImage lastSettledAt')
      .sort({ cashInHand: -1 })
      .lean();

    if (hasPagination) {
      const total = await DeliveryPartner.countDocuments(query);
      const partners = await listQuery
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      res.set('X-Total-Count', String(total));
      res.set('X-Page', String(pageNumber));
      res.set('X-Limit', String(limitNumber));
      res.set('X-Total-Pages', String(Math.ceil(total / limitNumber) || 1));
      
      return res.json({
        partners,
        stats,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber)
        }
      });
    }

    const partners = await listQuery;
    res.json({ partners, stats });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching settlement list' });
  }
};

// @desc    Settle (Reset) a rider's cash liability after physical handover
// @route   POST /api/admin/delivery-partners/settle-cash/:id
// @access  Private (Admin)
export const settleRiderCash = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { pin } = req.body;
    
    if (!pin) {
      return res.status(400).json({ message: 'Settlement PIN is required' });
    }

    const admin = await Admin.findById(req.admin._id).select('+settlementPin');
    if (admin.settlementPin !== pin) {
      return res.status(401).json({ message: 'Invalid settlement PIN' });
    }

    let payload = null;

    await session.withTransaction(async () => {
      const partner = await DeliveryPartner.findById(req.params.id).session(session);
      if (!partner) {
        const err = new Error('Partner not found');
        err.statusCode = 404;
        throw err;
      }

      const totalSettled = partner.cashInHand || 0;
      partner.cashInHand = 0;
      partner.lastSettledAt = new Date();
      await partner.save({ session });

      await CashCollection.updateMany(
        { deliveryPartner: partner._id, status: 'collected' },
        {
          status: 'settled_with_admin',
          settledAt: new Date(),
          adminAcknowledge: true
        }
      ).session(session);

      payload = {
        success: true,
        message: `Successfully settled Rs ${totalSettled} with ${partner.name}`,
        removedAmount: totalSettled
      };
    });

    res.json(payload);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  } finally {
    await session.endSession();
  }
};
