import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import User from '../models/User.js';
import UserTransaction from '../models/UserTransaction.js';
import GlobalSetting from '../models/GlobalSetting.js';
import Product from '../models/Product.js';
import OrderDelivery from '../models/OrderDelivery.js';
import { findOptimalSource, geocodeAddress } from '../services/locationService.js';

const computeBillDetails = async (items) => {
  let subTotal = 0;

  // Validate each item against the actual database to prevent frontend price manipulation
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error(`Product mapping failed for: ${item.name}`);

    const verifiedPrice = product.basePrice || product.price || 0;
    subTotal += verifiedPrice * item.quantity;
  }

  // Get live global settings
  let settings = await GlobalSetting.findOne() || new GlobalSetting();

  const taxAmount = (subTotal * settings.defaultTaxRate) / 100;

  let deliveryFee = settings.baseDeliveryFee * settings.surgeMultiplier;
  if (subTotal >= settings.freeDeliveryThreshold) {
    deliveryFee = 0;
  }

  const handlingFee = settings.handlingFee;
  const totalAmount = subTotal + taxAmount + deliveryFee + handlingFee;

  // Vendor Commission logic
  const platformCommission = (subTotal * settings.platformCommissionRate) / 100;
  const vendorPayoutAmount = (subTotal + taxAmount) - platformCommission;

  return {
    subTotal: parseFloat(subTotal.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    deliveryFee: parseFloat(deliveryFee.toFixed(2)),
    handlingFee: parseFloat(handlingFee.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    platformCommission: parseFloat(platformCommission.toFixed(2)),
    vendorPayoutAmount: parseFloat(vendorPayoutAmount.toFixed(2))
  };
};

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// @desc    Initiate an online order via Razorpay
// @route   POST /api/orders/razorpay
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required to calculate bill' });
    }

    // Always recompute on backend. NEVER trust frontend amount.
    const computedBill = await computeBillDetails(items);

    const options = {
      amount: parseInt(computedBill.totalAmount * 100), // Razorpay strictly takes format in paise
      currency: 'INR',
      receipt: `sg_rcpt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: 'Failed to negotiate with Razorpay Server' });
    }

    res.status(200).json({
      success: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Issue: ' + error.message });
  }
};

// @desc    Finalize and Verify Payment, Then save exact order items to MongoDB
// @route   POST /api/orders/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderData
    } = req.body;

    // Verify authenticity using crypto SHA256 digest
    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpaySignature !== expectedSign) {
      return res.status(400).json({ message: "Invalid payment signature!" });
    }

    // Strip empty location bounds so the 2dsphere index doesn't explode
    if (orderData.shippingAddress && (!orderData.shippingAddress.location || !orderData.shippingAddress.location.coordinates || orderData.shippingAddress.location.coordinates.length < 2)) {
      delete orderData.shippingAddress.location;
    }

    // Recompute bill to guarantee no manipulation during payment verify leap
    const computedBill = await computeBillDetails(orderData.items);

    // Setup Document safely
    const order = new Order({
      orderId: 'SG-' + Date.now().toString(),
      user: req.user._id,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: 'online',
      paymentStatus: 'paid',
      status: 'confirmed',
      totalAmount: computedBill.totalAmount, // Securely injected
      subTotal: computedBill.subTotal,
      taxAmount: computedBill.taxAmount,
      deliveryFee: computedBill.deliveryFee,
      handlingFee: computedBill.handlingFee,
      platformCommission: computedBill.platformCommission,
      vendorPayoutAmount: computedBill.vendorPayoutAmount,
      vendor: orderData.vendorId,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature
    });

    // Automatically find nearest source (Branch or Vendor) with Stock
    let coords = orderData.shippingAddress?.location?.coordinates;

    // Fallback to Geocoding if coordinates are missing but address is present
    if (!coords && orderData.shippingAddress?.street) {
      coords = await geocodeAddress(`${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}`);
      if (coords) {
        order.shippingAddress.location = { type: 'Point', coordinates: coords };
      }
    }

    if (coords) {
      const optimalSource = await findOptimalSource(coords, orderData.items);
      if (optimalSource) {
        if (optimalSource.type === 'branch') {
          order.branchId = optimalSource.id;
        } else {
          order.vendor = optimalSource.id;
        }
      }
    } else if (orderData.branchId) {
      order.branchId = orderData.branchId;
    }

    const createdOrder = await order.save();

    // Deduct Stock immediately after successful order placement
    await decrementStock(createdOrder);

    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ message: error.message || 'Internal Verification Error' });
  }
};

// Unified Stock Helpers for Branch & Vendor
const decrementStock = async (order) => {
  const { branchId, vendor, items } = order;
  for (const item of items) {
    const productId = item.product._id || item.product;
    if (branchId) {
      // Logic for Branch Stock
      await Product.findOneAndUpdate(
        { _id: productId, 'branchStocks.branchId': branchId },
        { $inc: { 'branchStocks.$.stock': -item.quantity } }
      );
    } else if (vendor) {
      // Logic for Vendor Stock (Deduct from FIRST variant atomically)
      await Product.updateOne(
        { _id: productId },
        { $inc: { 'variants.0.stock': -item.quantity } }
      );
    }
  }
};

const incrementStock = async (order) => {
  const { branchId, vendor, items } = order;
  for (const item of items) {
    const productId = item.product._id || item.product;
    if (branchId) {
      await Product.findOneAndUpdate(
        { _id: productId, 'branchStocks.branchId': branchId },
        { $inc: { 'branchStocks.$.stock': item.quantity } }
      );
    } else if (vendor) {
      // Logic for Vendor Stock (Restore to FIRST variant atomically)
      await Product.updateOne(
        { _id: productId },
        { $inc: { 'variants.0.stock': item.quantity } }
      );
    }
  }
};

// @desc    Save exact Order items via normal Cash on Delivery
// @route   POST /api/orders/cod
// @access  Private
export const createCODOrder = async (req, res) => {
  try {
    const { orderData } = req.body;

    // Strip empty location bounds so the 2dsphere index doesn't explode
    if (orderData.shippingAddress && (!orderData.shippingAddress.location || !orderData.shippingAddress.location.coordinates || orderData.shippingAddress.location.coordinates.length < 2)) {
      delete orderData.shippingAddress.location;
    }

    // Always recompute on backend. NEVER trust frontend amount
    const computedBill = await computeBillDetails(orderData.items);

    const order = new Order({
      orderId: 'SG-' + Date.now().toString(),
      user: req.user._id,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      status: 'pending',
      totalAmount: computedBill.totalAmount, // Securely injected
      subTotal: computedBill.subTotal,
      taxAmount: computedBill.taxAmount,
      deliveryFee: computedBill.deliveryFee,
      handlingFee: computedBill.handlingFee,
      platformCommission: computedBill.platformCommission,
      vendorPayoutAmount: computedBill.vendorPayoutAmount,
      vendor: orderData.vendorId,
    });

    // Automatically find nearest source (Branch or Vendor) with Stock
    let coords = orderData.shippingAddress?.location?.coordinates;

    // Fallback to Geocoding if coordinates are missing
    if (!coords && orderData.shippingAddress?.street) {
      coords = await geocodeAddress(`${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}`);
      if (coords) {
        order.shippingAddress.location = { type: 'Point', coordinates: coords };
      }
    }

    if (coords) {
      const optimalSource = await findOptimalSource(coords, orderData.items);
      if (optimalSource) {
        if (optimalSource.type === 'branch') {
          order.branchId = optimalSource.id;
        } else {
          order.vendor = optimalSource.id;
        }
      }
    } else if (orderData.branchId) {
      order.branchId = orderData.branchId;
    }

    const createdOrder = await order.save();

    // Deduct Stock immediately after successful order placement
    await decrementStock(createdOrder);

    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    console.error('COD Order Error:', error);
    res.status(500).json({ message: error.message || 'Internal COD Error' });
  }
};

// @desc    Create Order using Wallet Balance
// @route   POST /api/orders/wallet
// @access  Private
export const createWalletOrder = async (req, res) => {
  try {
    const { orderData } = req.body;
    const user = await User.findById(req.user._id);

    // Recompute bill to guarantee security
    const computedBill = await computeBillDetails(orderData.items);

    if (user.walletBalance < computedBill.totalAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    const order = new Order({
      orderId: 'SG-' + Date.now().toString(),
      user: req.user._id,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
      status: 'confirmed',
      totalAmount: computedBill.totalAmount,
      subTotal: computedBill.subTotal,
      taxAmount: computedBill.taxAmount,
      deliveryFee: computedBill.deliveryFee,
      handlingFee: computedBill.handlingFee,
      platformCommission: computedBill.platformCommission,
      vendorPayoutAmount: computedBill.vendorPayoutAmount,
      vendor: orderData.vendorId,
    });

    // Deduct from User Wallet immediately
    user.walletBalance -= computedBill.totalAmount;
    await user.save();

    const createdOrder = await order.save();

    // Log Transaction
    await UserTransaction.create({
      user: req.user._id,
      amount: computedBill.totalAmount,
      type: 'debit',
      category: 'order_payment',
      status: 'completed',
      description: `Payment for Order #${createdOrder.orderId}`,
      orderId: createdOrder._id
    });

    // Deduct Stock
    await decrementStock(createdOrder);

    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    console.error('Wallet Order Error:', error);
    res.status(500).json({ message: error.message || 'Internal Wallet Error' });
  }
};

// @desc    Cancel Order logic for User (Before Out for Delivery)
// @route   POST /api/orders/:id/cancel
// @access  Private
export const cancelOrderUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const orderId = req.params.id;
    console.log(`[CANCELLATION_DEBUG] HIT! Order: ${orderId}, User: ${req.user?._id}, Reason: ${reason}`);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order strictly not found' });
    }

    // Security check - String conversion for safety
    if (String(order.user) !== String(req.user?._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    // Normalize and check status
    const currentStatus = (order.status || 'pending').toLowerCase();
    const restricted = ['out_for_delivery', 'delivered', 'cancelled', 'returned'];
    if (restricted.includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cancellation window closed. Current status: ${currentStatus.replace(/_/g, ' ')}`
      });
    }

    // Primitive property updates + save() which is higher reliability in some Mongoose versions
    order.status = 'cancelled';
    const oldPaymentStatus = order.paymentStatus;

    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';

      // Auto-refund to wallet if it was paid online or via wallet
      const refundAmount = order.totalAmount;
      const user = await User.findById(order.user);
      user.walletBalance += refundAmount;
      await user.save();

      // Log Transaction
      await UserTransaction.create({
        user: order.user,
        amount: refundAmount,
        type: 'credit',
        category: 'order_refund',
        status: 'completed',
        description: `Refund for Cancelled Order #${order.orderId}`,
        orderId: order._id
      });
    }

    order.cancellation = {
      isCancelled: true,
      reason: reason || 'Cancelled by user',
      cancelledAt: new Date()
    };

    const updatedOrder = await order.save();

    // Restore Stock (Works for both Branch and Vendor sources)
    await incrementStock(updatedOrder);

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Cancellation Endpoint Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    User requests a return for a delivered order
// @route   POST /api/orders/:id/return
// @access  Private (User)
export const requestReturn = async (req, res) => {
  try {
    const { reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Return reason is required' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the order owner can request a return
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Only delivered orders can be returned
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }

    // Prevent duplicate return requests
    if (order.returnRequest.isRequested) {
      return res.status(400).json({ message: 'A return request already exists for this order' });
    }

    order.returnRequest = {
      isRequested: true,
      reason,
      description: description || null,
      images: [],
      status: 'Pending',
      requestDate: new Date()
    };

    order.status = 'return_requested';
    const updatedOrder = await order.save();
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Calculate Bill Summary to display securely to User 
// @route   POST /api/orders/calculate-bill
// @access  Private
export const calculateBill = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const bill = await computeBillDetails(items);
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's historic orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order detail
// @route   GET /api/orders/:id
// @access  Private
// Allows getting standard order info fully populated
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name category image unitValue unitType')
      .populate('deliveryPartnerId', 'name phone profileImage vehicleType vehicleNumber rating')
      .populate('branchId', 'name address location')
      .populate('vendor', 'storeName address location');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order strictly not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Route Directions via Google Maps for order tracking (User/Rider)
// @route   GET /api/orders/:id/route
// @access  Private
export const getOrderRoute = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('deliveryPartnerId', 'currentLocation')
      .populate('branchId', 'address.location')
      .populate('vendor', 'address.location');

    if (!order) return res.status(404).json({ message: 'Order strictly not found' });

    // Destination is ship address coordinates
    const destCoords = order.shippingAddress?.location?.coordinates;
    if (!destCoords || destCoords.length !== 2) {
      return res.status(400).json({ message: 'Target destination missing for this order' });
    }
    const destination = `${destCoords[1]},${destCoords[0]}`;

    // Origin is rider's current location OR store location (if waiting for pickup)
    let originStr = "";
    if (order.deliveryPartnerId?.currentLocation?.coordinates) {
      const riderLoc = order.deliveryPartnerId.currentLocation.coordinates;
      originStr = `${riderLoc[1]},${riderLoc[0]}`;
    } else {
      // Fallback to store if rider not assigned or location missing
      const storeLoc = order.branchId?.location?.coordinates || order.vendor?.location?.coordinates;
      if (storeLoc) originStr = `${storeLoc[1]},${storeLoc[0]}`;
    }

    if (!originStr) return res.status(400).json({ message: 'Rider or Store location not detected' });

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API;
    if (!apiKey) return res.status(500).json({ message: 'Maps logic restricted on server currently' });

    const mapUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destination}&key=${apiKey}`;
    const response = await axios.get(mapUrl);

    if (response.data.status !== "OK") {
      return res.status(400).json({ message: response.data.error_message || "Maps engine responded with error" });
    }

    res.json({ routes: response.data.routes });
  } catch (error) {
    console.error('getOrderRoute issue:', error);
    res.status(500).json({ message: 'Server Issue: Maps logic failed' });
  }
};

// --- ADMIN / STAFF ORDER MANAGEMENT ---

// @desc    Get all orders for Admin/Staff (Branch-scoped)
// @route   GET /api/admin/orders
// @access  Private (Admin/Staff)
export const getAllOrdersAdmin = async (req, res) => {
  try {
    let query = {};

    // Branch Scoping: If not Super Admin, only show orders for their branch
    if (req.admin.role !== 'Admin') {
      if (!req.admin.branchId) {
        return res.status(403).json({ message: 'No branch assigned' });
      }
      query.branchId = req.admin.branchId;
      // Note: Make sure Order model has branchId field or we derive it from items
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Order Status (Confirm, Pakk, Ship, Deliver, Cancel)
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin/Staff)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Branch Security
    if (req.admin.role !== 'Admin' && order.branchId?.toString() !== req.admin.branchId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to manage orders from other branches' });
    }

    const oldStatus = order.status;
    order.status = status;
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }

    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      order.cancellation = {
        isCancelled: true,
        reason: 'Cancelled by Admin/Staff',
        cancelledAt: new Date()
      };
      // Restore Stock
      await incrementStock(order);
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Order entirely
// @route   DELETE /api/admin/orders/:id
// @access  Private (Admin only)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Branch Security - Only Root Admin or same branch staff allowed
    if (req.admin.role !== 'Admin' && order.branchId?.toString() !== req.admin.branchId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete orders from other branches' });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all return requests (Admin/Staff)
// @route   GET /api/orders/admin/returns
// @access  Private (Admin/Staff)
export const getReturnRequests = async (req, res) => {
  try {
    let query = { 'returnRequest.isRequested': true };

    if (req.admin.role !== 'Admin') {
      if (!req.admin.branchId) {
        return res.status(403).json({ message: 'No branch assigned' });
      }
      query.branchId = req.admin.branchId;
    }

    const returns = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name category image')
      .populate('branchId', 'name address')
      .populate('vendor', 'storeName address')
      .sort({ 'returnRequest.requestDate': -1 });

    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get return requests for vendor's own store orders ONLY
// @route   GET /api/vendor/returns
// @access  Private (Vendor)
export const getVendorReturnRequests = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    const returns = await Order.find({
      'returnRequest.isRequested': true,
      vendor: vendorId
    })
      .populate('user', 'name email phone')
      .populate('items.product', 'name category image')
      .sort({ 'returnRequest.requestDate': -1 });

    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Approve or Reject Return Request
// @route   PUT /api/orders/admin/:id/return
// @access  Private (Admin/Staff/Vendor)
export const handleReturnRequest = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'Approved' or 'Rejected'
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Auth: Admin can always act. Staff restricted to their branch.
    // Vendor can act on their own store's orders.
    const isAdmin = req.admin?.role === 'Admin';
    const isStaffForBranch = req.admin && order.branchId?.toString() === req.admin.branchId?.toString();
    const isVendorOwner = req.vendor && order.vendor?.toString() === req.vendor._id?.toString();

    if (!isAdmin && !isStaffForBranch && !isVendorOwner) {
      return res.status(403).json({ message: 'Not authorized to manage returns for this order' });
    }

    if (!order.returnRequest.isRequested) {
      return res.status(400).json({ message: 'No return request found for this order' });
    }

    order.returnRequest.status = action;

    if (action === 'Approved') {
      // Keep order in 'return_requested' until pickup is scheduled/completed.
      // Stock is restored immediately (items are approved for return).
      await incrementStock(order);

      // NOTE: Refund is intentionally deferred to when the delivery partner
      // marks 'return_delivered' (item physically back at branch/vendor store).
      // This ensures money is not refunded before item is actually returned.
      // Exception: if no delivery pickup is ever scheduled (rare edge case),
      // admin can manually trigger refund separately.

    } else if (action === 'Rejected') {
      order.status = 'delivered'; // Revert — order stays delivered if return is rejected
      order.returnRequest.rejectionReason = rejectionReason || 'Return request rejected';
      order.returnRequest.resolvedAt = new Date();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin schedules physical return pickup by creating an OrderDelivery record
// @route   POST /api/orders/admin/:id/return/schedule-pickup
// @access  Private (Admin/Staff)
export const scheduleReturnPickup = async (req, res) => {
  try {
    const { pickupFee = 30 } = req.body;

    // Populate both branchId and vendor so we know the drop destination
    const order = await Order.findById(req.params.id)
      .populate('user', 'name phone')
      .populate('branchId', 'name address phone')
      .populate('vendor', 'storeName address phone');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Auth guard: Admin bypasses all | Staff limited to their branch | Vendor must own order
    const isAdmin = req.admin?.role === 'Admin';
    const isStaffForBranch = req.admin && order.branchId?.toString() === req.admin.branchId?.toString();
    const isVendorOwner = req.vendor && order.vendor?._id?.toString() === req.vendor._id?.toString();

    if (!isAdmin && !isStaffForBranch && !isVendorOwner) {
      return res.status(403).json({ message: 'Not authorized to schedule pickup for this order' });
    }

    if (order.returnRequest.status !== 'Approved') {
      return res.status(400).json({ message: 'Return must be approved before scheduling pickup' });
    }

    if (order.returnRequest.pickupDeliveryId) {
      return res.status(400).json({ message: 'Pickup already scheduled for this return' });
    }

    // Determine where the item needs to be dropped back
    // Branch order → drop to branch | Vendor order → drop to vendor store
    const dropDestinationType = order.branchId ? 'branch' : 'vendor';
    const dropDestinationId = order.branchId ? order.branchId._id : order.vendor?._id;

    if (!dropDestinationId) {
      return res.status(400).json({ message: 'Order has no linked branch or vendor store. Cannot schedule pickup.' });
    }

    // Create an OrderDelivery record for the return pickup
    const returnDelivery = await OrderDelivery.create({
      type: 'return_pickup',
      order: order._id,
      status: 'pending',
      pickupFee,
      dropDestinationType,
      dropDestinationId,
    });

    // Link back to order
    order.returnRequest.pickupDeliveryId = returnDelivery._id;
    order.returnRequest.pickupScheduledAt = new Date();
    order.status = 'return_pickup_scheduled';
    await order.save();

    res.json({ success: true, returnDelivery, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
