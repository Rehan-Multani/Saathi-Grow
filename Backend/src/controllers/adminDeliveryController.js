import mongoose from 'mongoose';
import DeliveryPartner from '../models/DeliveryPartner.js';
import Order from '../models/Order.js';
import Vendor from '../models/Vendor.js';
import Branch from '../models/Branch.js';
import OrderDelivery from '../models/OrderDelivery.js';
import DeliveryRun from '../models/DeliveryRun.js';

// Helper to generate 4-digit numeric OTP securely
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
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
      res.status(201).json({
        _id: partner._id,
        uniqueId: partner.uniqueId,
        name: partner.name,
        phone: partner.phone,
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
    const admin = req.admin;
    let query = {};

    // If Branch Manager, we show all partners (fleet is usually shared)
    // but we could filter by proximity in the future if branch has its own geo-fence

    const partners = await DeliveryPartner.find(query).sort({ createdAt: -1 });
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
    } else {
      res.status(404).json({ message: 'Delivery partner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating status' });
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
    const admin = req.admin;
    const query = {
      status: { $in: ['confirmed', 'preparing', 'pending', 'ready_for_pickup'] },
      deliveryPartnerId: null
    };

    if (admin.role !== 'Admin') {
      if (!admin.branchId) return res.status(403).json({ message: 'No branch assigned' });
      query.branchId = admin.branchId;
    }

    const orders = await Order.find(query).populate('user', 'name phone').sort({ createdAt: 1 }); // Oldest first (FIFO)

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
    }).select('-password').sort({ 'createdAt': -1 });

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
  if (order.deliveryPartnerId) throw new Error('Order is already assigned to a driver');
  if (order.status === 'cancelled') throw new Error('Cannot assign a cancelled order');

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

  return { order, partner, run };
};

// @desc    Atomically Force-Assign an Order to a specific Free Partner
// @route   POST /api/admin/delivery-partners/assign
// @access  Private (Admin)
export const assignOrderToPartner = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, partnerId } = req.body;
    const result = await performAssignment(orderId, partnerId, session);

    // 5. Commit the Transaction safely
    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Order Assigned Successfully', ...result });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message || 'Assignment Transaction Failed' });
  }
};

// @desc    Auto-assign an order to the nearest available partner
// @route   POST /api/admin/delivery-partners/auto-assign/:orderId
// @access  Private (Admin)
export const autoAssignOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('vendor').populate('branchId');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.deliveryPartnerId) return res.status(400).json({ message: 'Order already assigned' });

    // Determine pickup coordinates
    let pickupLocation = null;
    if (order.vendor && order.vendor.address && order.vendor.address.location) {
      pickupLocation = order.vendor.address.location;
    } else if (order.branchId && order.branchId.address && order.branchId.address.location) {
      pickupLocation = order.branchId.address.location;
    }

    if (!pickupLocation || !pickupLocation.coordinates || pickupLocation.coordinates.length < 2) {
      return res.status(400).json({ message: 'Pickup location (Vendor/Branch) missing valid coordinates' });
    }

    // Find the nearest available partner within 10km (10000 meters)
    const nearestPartner = await DeliveryPartner.findOne({
      authStatus: 'Active',
      assignmentStatus: 'Free',
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: pickupLocation.coordinates
          },
          $maxDistance: 10000 // 10km radius
        }
      }
    }).session(session);

    if (!nearestPartner) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'No available delivery partners found near the pickup location' });
    }

    const result = await performAssignment(order._id, nearestPartner._id, session);

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Auto-assigned to nearest partner', ...result });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message || 'Auto-assignment failed' });
  }
};

// @desc    Unassign an order from its current driver
// @route   POST /api/admin/delivery-partners/unassign
// @access  Private (Admin)
export const unassignOrderFromPartner = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.body;

    // Support finding by both hex _id and human-readable orderId string
    const query = mongoose.isValidObjectId(orderId)
      ? { _id: orderId }
      : { orderId: orderId };

    const order = await Order.findOne(query).session(session);

    if (!order) throw new Error('Order record not found');

    // Find corresponding OrderDelivery record
    const deliveryRecord = await OrderDelivery.findOne({ order: order._id }).session(session);

    // Check if assigned in either place
    const partnerId = order.deliveryPartnerId || deliveryRecord?.deliveryPartner;

    if (!partnerId) {
      throw new Error(`Order ${order.orderId} is not currently assigned to any driver in the system.`);
    }

    // Cannot unassign if rider already picked up or in transit (optional policy, usually restricted)
    if (['out_for_delivery', 'delivered'].includes(order.status)) {
      throw new Error('Cannot unassign an order that has already been picked up or delivered');
    }

    const partner = await DeliveryPartner.findById(partnerId).session(session);

    // 1. Reset Order State
    order.deliveryPartnerId = null;
    order.deliveryOTP = null;
    if (order.deliveryTimestamps) {
      order.deliveryTimestamps.assignedAt = null;
    }
    order.status = 'confirmed'; // Reset back to confirmed for re-assignment
    await order.save({ session });

    // 2. Clear OrderDelivery and DeliveryRun records
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

    // 3. Reset Partner State
    if (partner) {
      partner.assignmentStatus = 'Free';
      partner.activeOrder = null;
      partner.activeRun = null;
      partner.currentStopIndex = 0;
      await partner.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Order unassigned and returned to pool', orderId: order.orderId });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message || 'Unassignment failed' });
  }
};

// @desc    Get all active deliveries for Live Tracking Map
// @route   GET /api/admin/delivery-partners/active-tracking
// @access  Private (Admin/Manager)
export const getActiveDeliveries = async (req, res) => {
  try {
    const admin = req.admin;
    const query = {
      deliveryPartnerId: { $ne: null },
      status: { $in: ['preparing', 'ready_for_pickup', 'out_for_delivery'] }
    };

    if (admin.role !== 'Admin') {
      if (!admin.branchId) return res.status(403).json({ message: 'No branch assigned' });
      query.branchId = admin.branchId;
    }

    // Fetch orders that are in intermediate delivery states
    const activeOrders = await Order.find(query)
      .populate('deliveryPartnerId', 'name phone currentLocation vehicleType vehicleNumber')
      .populate('vendor', 'storeName address')
      .populate('branchId', 'name address')
      .populate('user', 'name phone')
      .sort({ updatedAt: -1 });

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
    const partners = await DeliveryPartner.find({ cashInHand: { $gt: 0 } })
      .select('name phone uniqueId cashInHand profileImage')
      .sort({ cashInHand: -1 });
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Settle (Reset) a rider's cash liability after physical handover
// @route   POST /api/admin/delivery-partners/settle-cash/:id
// @access  Private (Admin)
export const settleRiderCash = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    const totalSettled = partner.cashInHand;

    // Update partner
    partner.cashInHand = 0;
    await partner.save();

    // Mark CashCollection records as settled
    const CashCollection = (await import('../models/CashCollection.js')).default;
    await CashCollection.updateMany(
      { deliveryPartner: partner._id, status: 'collected' },
      {
        status: 'settled_with_admin',
        settledAt: new Date(),
        adminAcknowledge: true
      }
    );

    res.json({
      success: true,
      message: `Successfully settled ₹${totalSettled} with ${partner.name}`,
      removedAmount: totalSettled
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
