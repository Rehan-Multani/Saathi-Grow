import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import GlobalSetting from '../models/GlobalSetting.js';
import Product from '../models/Product.js';

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
      branchId: orderData.branchId,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature
    });

    const createdOrder = await order.save();

    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ message: error.message || 'Internal Verification Error' });
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
      branchId: orderData.branchId,
    });

    const createdOrder = await order.save();
    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    console.error('COD Order Error:', error);
    res.status(500).json({ message: error.message || 'Internal COD Error' });
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
      .populate('items.product', 'name category image unitValue unitType');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order strictly not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    order.status = status;
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
