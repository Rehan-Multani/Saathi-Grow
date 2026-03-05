import DeliveryRun from '../models/DeliveryRun.js';
import Order from '../models/Order.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import DeliverySlot from '../models/DeliverySlot.js';
import mongoose from 'mongoose';

// Google Maps setup for route optimization
import axios from 'axios';

/**
 * @desc    Get unassigned orders grouped by Slot (and Immediate)
 * @route   GET /api/admin/delivery/run/orders-by-slot
 * @access  Private (Admin/Manager)
 */
export const getOrdersBySlot = async (req, res) => {
  try {
    const admin = req.admin;
    const { date, branchId } = req.query;

    // Default to today if no date provided
    const queryDate = date ? new Date(date) : new Date();

    // Set start and end of the query date for order filtering
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Build base query for orders
    const orderQuery = {
      status: { $in: ['confirmed', 'preparing', 'pending'] },
      deliveryPartnerId: null, // Unassigned
      // Only include orders created today or orders specifically scheduled for this date 
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    };

    if (admin.role !== 'Admin') {
      if (!admin.branchId) return res.status(403).json({ message: 'No branch assigned' });
      orderQuery.branchId = admin.branchId;
    } else if (branchId) {
      orderQuery.branchId = branchId;
    }

    // 1. Fetch unassigned orders matching criteria
    const orders = await Order.find(orderQuery)
      .populate('user', 'name phone')
      .populate('deliverySlotId')
      .sort({ createdAt: 1 });

    // 2. Fetch all active slots for the display
    const activeSlots = await DeliverySlot.find({ isActive: true }).sort({ startTime: 1 });

    // 3. Fetch existing Runs for today to show assignment progress
    const runQuery = {
      slotDate: { $gte: startOfDay, $lte: endOfDay }
    };
    if (orderQuery.branchId) runQuery.branchId = orderQuery.branchId;

    const existingRuns = await DeliveryRun.find(runQuery)
      .populate('deliveryPartner', 'name phone vehicleType')
      .populate('deliverySlot');

    // 4. Grouping Data Structure
    const grouped = {
      immediate: {
        orders: [],
        count: 0,
        runs: existingRuns.filter(r => r.isImmediate)
      },
      slots: activeSlots.map(slot => ({
        slot: slot,
        orders: [],
        count: 0,
        runs: existingRuns.filter(r => r.deliverySlot && r.deliverySlot._id.toString() === slot._id.toString())
      }))
    };

    // 5. Populate groups
    orders.forEach(order => {
      // If no slot is selected, it's considered immediate
      if (order.isImmediate || !order.deliverySlotId) {
        grouped.immediate.orders.push(order);
        grouped.immediate.count++;
      } else {
        const slotGroup = grouped.slots.find(s => s.slot._id.toString() === order.deliverySlotId._id.toString());
        if (slotGroup) {
          slotGroup.orders.push(order);
          slotGroup.count++;
        }
      }
    });

    res.json(grouped);
  } catch (error) {
    console.error('getOrdersBySlot error:', error);
    res.status(500).json({ message: error.message || 'Error fetching grouped orders' });
  }
};

/**
 * @desc    Create a new Delivery Run (Batch Assignment)
 * @route   POST /api/admin/delivery/run/create
 * @access  Private (Admin)
 */
export const createDeliveryRun = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { partnerId, slotId, slotDate, orderIds, branchId, optimizeRoute } = req.body;

    if (!partnerId || !orderIds || orderIds.length === 0) {
      throw new Error('Partner ID and Order IDs are required');
    }

    // 1. Validate Partner
    const partner = await DeliveryPartner.findById(partnerId).session(session);
    if (!partner) throw new Error('Delivery Partner not found');
    if (partner.authStatus !== 'Active') throw new Error('Partner is not active');
    if (partner.assignmentStatus !== 'Free') throw new Error('Partner is currently busy with another delivery/run');

    // 2. Validate Orders
    const orders = await Order.find({ _id: { $in: orderIds } })
      .populate('vendor', 'address')
      .populate('branchId', 'address')
      .session(session);

    if (orders.length !== orderIds.length) {
      throw new Error('One or more orders not found');
    }

    for (const order of orders) {
      if (order.deliveryPartnerId || order.deliveryRunId) {
        throw new Error(`Order ${order.orderId} is already assigned`);
      }
      if (order.status === 'cancelled') {
        throw new Error(`Order ${order.orderId} is cancelled`);
      }
    }

    // Generate a unique RUN ID
    const runIdString = `RUN-${Date.now().toString().slice(-6)}-${partner.uniqueId.slice(-4)}`;

    // Build stops
    let waypointOrderArray = orders.map((_, i) => i); // Default: same order they came in
    let polyline = null;
    let totalDist = 0;
    let totalDur = 0;

    // Optional: Call Google Maps API if optimizeRoute is true and we have a valid pickup source (like Branch coordinates)
    // For now, we are skipping the full Google API call due to key constraints, but the framework is ready.

    const orderedStops = waypointOrderArray.map((originalIndex, seqIndex) => {
      const orderDoc = orders[originalIndex];
      return {
        order: orderDoc._id,
        stopSequence: seqIndex + 1,
        status: 'pending',
        deliveryOTP: Math.floor(1000 + Math.random() * 9000).toString() // Secure 4-digit PIN
      };
    });

    // 3. Create the DeliveryRun
    const run = new DeliveryRun({
      runId: runIdString,
      deliveryPartner: partner._id,
      deliverySlot: slotId || null,
      slotDate: slotDate ? new Date(slotDate) : new Date(),
      isImmediate: !slotId,
      branchId: branchId || null,
      orders: orderedStops,
      status: 'assigned',
      assignedAt: new Date(),
      optimizedRoute: {
        waypointOrder: waypointOrderArray,
        encodedPolyline: polyline,
        totalDistanceMeters: totalDist,
        totalDurationSeconds: totalDur
      }
    });

    await run.save({ session });

    // 4. Update Orders
    for (const order of orders) {
      const stopConfig = orderedStops.find(s => s.order.toString() === order._id.toString());

      order.deliveryRunId = run._id;
      order.deliveryPartnerId = partner._id;
      order.stopSequence = stopConfig.stopSequence;
      order.deliveryOTP = stopConfig.deliveryOTP;

      if (['pending', 'confirmed'].includes(order.status)) {
        order.status = 'preparing';
      }

      order.deliveryTimestamps = { assignedAt: new Date(), pickedUpAt: null, deliveredAt: null };

      await order.save({ session });
    }

    // 5. Update Partner
    partner.assignmentStatus = 'Busy';
    partner.activeRun = run._id;
    partner.currentStopIndex = 0;
    await partner.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Delivery Run created successfully', run });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create run error:', error);
    res.status(400).json({ message: error.message || 'Transaction Failed' });
  }
};

/**
 * @desc    Get all Delivery Runs
 * @route   GET /api/admin/delivery/run
 * @access  Private
 */
export const getAllDeliveryRuns = async (req, res) => {
  try {
    const admin = req.admin;
    const { status, date } = req.query;

    let query = {};
    if (admin.role !== 'Admin') {
      if (admin.branchId) query.branchId = admin.branchId;
    }

    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const e = new Date(d); e.setHours(23, 59, 59, 999);
      query.slotDate = { $gte: d, $lte: e };
    }

    const runs = await DeliveryRun.find(query)
      .populate('deliveryPartner', 'name phone vehicleType profileImage')
      .populate('deliverySlot')
      .populate({
        path: 'orders.order',
        select: 'orderId totalAmount status shippingAddress'
      })
      .sort({ createdAt: -1 });

    res.json(runs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Get Single Run details
 * @route   GET /api/admin/delivery/run/:id
 * @access  Private
 */
export const getDeliveryRunById = async (req, res) => {
  try {
    const run = await DeliveryRun.findById(req.params.id)
      .populate('deliveryPartner')
      .populate('deliverySlot')
      .populate({
        path: 'orders.order',
        populate: [
          { path: 'user', select: 'name phone email' },
          { path: 'branchId' },
          { path: 'vendor' }
        ]
      });

    if (!run) return res.status(404).json({ message: 'Run not found' });

    res.json(run);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Cancel an entire run and unassign orders
 * @route   DELETE /api/admin/delivery/run/:id
 * @access  Private
 */
export const cancelDeliveryRun = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const run = await DeliveryRun.findById(req.params.id).session(session);
    if (!run) throw new Error('Run not found');

    if (['completed', 'partial_complete'].includes(run.status)) {
      throw new Error('Cannot cancel a completed run');
    }

    // Remove run links from orders
    for (const stop of run.orders) {
      if (stop.status === 'pending') {
        await Order.findByIdAndUpdate(stop.order, {
          deliveryRunId: null,
          deliveryPartnerId: null,
          stopSequence: null,
          deliveryOTP: null,
          status: 'confirmed'
        }, { session });
      }
    }

    // Free the partner
    const partner = await DeliveryPartner.findById(run.deliveryPartner).session(session);
    if (partner && partner.activeRun && partner.activeRun.toString() === run._id.toString()) {
      partner.assignmentStatus = 'Free';
      partner.activeRun = null;
      partner.currentStopIndex = 0;
      await partner.save({ session });
    }

    // Update run status
    run.status = 'cancelled';
    run.cancelledAt = new Date();
    run.cancelledBy = req.admin._id;
    await run.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Delivery run cancelled and orders freed up' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};
