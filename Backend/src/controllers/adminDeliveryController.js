import mongoose from 'mongoose';
import DeliveryPartner from '../models/DeliveryPartner.js';
import Order from '../models/Order.js';
import Vendor from '../models/Vendor.js';
import Branch from '../models/Branch.js';

// Helper to generate 4-digit numeric OTP securely
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

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
// @access  Private (Admin)
export const getDeliveryPartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find({}).sort({ createdAt: -1 });
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
// @access  Private (Admin)
export const getUnassignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['confirmed', 'preparing'] },
      deliveryPartnerId: null
    }).populate('user', 'name phone').sort({ createdAt: 1 }); // Oldest first (FIFO)

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching pending orders' });
  }
};

// @desc    Get all 'Online' and 'Free' delivery partners
// @route   GET /api/admin/delivery-partners/available
// @access  Private (Admin)
export const getAvailablePartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find({
      authStatus: 'Active',
      dutyStatus: 'Online',
      assignmentStatus: 'Free'
    }).select('-password').sort({ 'location.updatedAt': -1 });

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
  if (partner.dutyStatus !== 'Online') throw new Error('Partner went offline.');
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

  await order.save({ session });

  // 4. Update the Delivery Partner
  partner.assignmentStatus = 'Busy';
  partner.activeOrder = order._id;
  await partner.save({ session });

  return { order, partner };
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
      dutyStatus: 'Online',
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
