import axios from 'axios';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import User from '../models/User.js';
import UserTransaction from '../models/UserTransaction.js';
import GlobalSetting from '../models/GlobalSetting.js';
import Product from '../models/Product.js';
import OrderDelivery from '../models/OrderDelivery.js';
import InventoryLog from '../models/InventoryLog.js';
import Branch from '../models/Branch.js';
import Vendor from '../models/Vendor.js';
import DeliverySlot from '../models/DeliverySlot.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import { findOptimalSource, geocodeAddress, calculateDistance } from '../services/locationService.js';

const validateStoreDistance = async (storeId, storeType, userLocation) => {
  if (!storeId || !userLocation || !userLocation.coordinates || userLocation.coordinates.length < 2) return true;

  try {
    let store;
    if (storeType === 'branch') {
      store = await Branch.findById(storeId);
    } else {
      store = await Vendor.findById(storeId);
    }

    if (!store || !store.address?.location?.coordinates) return true;

    const storeCoords = store.address.location.coordinates;
    const distance = calculateDistance(
      userLocation.coordinates[1], userLocation.coordinates[0],
      storeCoords[1], storeCoords[0]
    );

    // Dynamic Hard Guard from Admin Settings
    const settings = await GlobalSetting.findOne();
    const maxRadius = settings?.maxDeliveryRadius || 25;

    if (distance > maxRadius) {
      throw new Error(`Store range validation failed. Distance: ${distance.toFixed(1)}km exceeds the allowed ${maxRadius}km limit.`);
    }
  } catch (error) {
    throw error;
  }
  return true;
};

const validateSlotAvailability = async (deliverySlotId, isImmediate) => {
  if (isImmediate) return true;
  if (!deliverySlotId) throw new Error('Delivery slot ID is required for scheduled orders.');

  const slot = await DeliverySlot.findById(deliverySlotId);
  if (!slot || !slot.isActive) {
    throw new Error('Selected delivery slot is no longer active or valid.');
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  const [endHour, endMin] = slot.endTime.split(':').map(Number);

  // Buffer: Cannot select a slot that ends in less than 30 minutes
  const isExpired = currentHour > endHour || (currentHour === endHour && currentMin >= (endMin - 30));

  if (isExpired) {
    throw new Error(`The selected slot (${slot.label}) has already passed or is too close to expiry. Please pick another or choose Immediate.`);
  }

  return true;
};

const computeBillDetails = async (items, storeInfo = null) => {
  let subTotal = 0;

  // Validate each item against the actual database to prevent frontend price manipulation
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error(`Product mapping failed for: ${item.name}`);

    // In a mature store-first app, we'd check store-specific pricing here if it exists.
    // For now, we take the base price.
    const verifiedPrice = product.basePrice || product.price || 0;
    subTotal += verifiedPrice * item.quantity;
  }

  // Get live global settings
  let settings = await GlobalSetting.findOne() || new GlobalSetting();

  const taxAmount = (subTotal * settings.defaultTaxRate) / 100;

  let deliveryFee = settings.baseDeliveryFee * settings.surgeMultiplier;

  // Custom logic: Distance based fee could be calculated if we have storeInfo
  // and user location. For now, we stick to global settings threshold.
  if (subTotal >= settings.freeDeliveryThreshold) {
    deliveryFee = 0;
  }

  const handlingFee = settings.handlingFee;
  const totalAmount = subTotal + taxAmount + deliveryFee + handlingFee;

  // Vendor Commission logic (Note: If storeType is 'vendor', this applies)
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

    // RANGE VALIDATION (Store-First Architecture Safeguard)
    if (orderData.storeId) {
      await validateStoreDistance(orderData.storeId, orderData.storeType, orderData.shippingAddress.location);
    }

    // SLOT VALIDATION
    await validateSlotAvailability(orderData.deliverySlotId, orderData.isImmediate);

    // Recompute bill to guarantee no manipulation during payment verify leap
    const computedBill = await computeBillDetails(orderData.items);

    // Setup Document safely
    const order = new Order({
      orderId: 'SG-' + Date.now().toString(),
      user: req.user._id,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: 'online',
      paymentStatus: 'paid', // Mark as paid for razorpay
      status: 'confirmed',
      totalAmount: computedBill.totalAmount, // Securely injected
      subTotal: computedBill.subTotal,
      taxAmount: computedBill.taxAmount,
      deliveryFee: computedBill.deliveryFee,
      handlingFee: computedBill.handlingFee,
      platformCommission: computedBill.platformCommission,
      vendorPayoutAmount: computedBill.vendorPayoutAmount,
      vendor: orderData.vendorId,
      deliverySlot: orderData.deliverySlot,        // legacy label
      deliverySlotId: orderData.deliverySlotId || null, // Sprint 2: ObjectId ref
      isImmediate: orderData.isImmediate ?? true,       // Sprint 2: ASAP flag
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature
    });

    // Priority 1: Use specific Store if provided by Frontend (Store-First Architecture)
    if (orderData.storeId && orderData.storeType) {
      if (orderData.storeType === 'branch') {
        order.branchId = orderData.storeId;
      } else {
        order.vendor = orderData.storeId;
      }
    }
    // Legacy/Fallback Logic
    else if (coords) {
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
  console.log(`[STOCK-DEBUG] Starting decrement for Order: ${order.orderId}, Source: ${branchId ? 'Branch ' + branchId : 'Vendor ' + vendor}`);

  for (const item of items) {
    try {
      const productId = item.product._id || item.product;
      const quantity = parseInt(item.quantity) || 0;
      console.log(`[STOCK-DEBUG] Processing Product: ${productId}, Qty: ${quantity}`);

      if (branchId) {
        // Logic for Branch Stock
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: productId, 'branchStocks.branchId': branchId },
          { $inc: { 'branchStocks.$.stock': -quantity } },
          { new: true }
        );

        if (updatedProduct) {
          console.log(`[STOCK-SUCCESS] Deducted ${quantity} from Branch ${branchId} for Product ${productId}`);
          const currentBS = updatedProduct.branchStocks.find(bs => bs.branchId.toString() === branchId.toString());
          await InventoryLog.create({
            product: productId,
            branchId: branchId,
            changeAmount: -quantity,
            previousStock: (currentBS?.stock || 0) + quantity,
            newStock: currentBS?.stock || 0,
            type: 'Removal',
            reason: `Order Placement #${order.orderId}`,
            orderId: order._id
          });
        } else {
          console.warn(`[STOCK-WARN] No match found for Product: ${productId} at Branch: ${branchId}`);
        }
      } else if (vendor) {
        // Logic for Vendor Stock (Deduct from top-level stock atomically)
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: productId },
          { $inc: { stock: -quantity } },
          { new: true }
        );

        if (updatedProduct) {
          console.log(`[STOCK-SUCCESS] Deducted ${quantity} from Vendor ${vendor} for Product ${productId}`);
          await InventoryLog.create({
            product: productId,
            vendorId: vendor,
            changeAmount: -quantity,
            previousStock: (updatedProduct.stock || 0) + quantity,
            newStock: updatedProduct.stock || 0,
            type: 'Removal',
            reason: `Order Placement #${order.orderId}`,
            orderId: order._id
          });
        } else {
          console.warn(`[STOCK-WARN] No match found for Product: ${productId} at Vendor: ${vendor}`);
        }
      }
    } catch (err) {
      console.error(`[STOCK-DECREMENT-FAIL] Order: ${order.orderId}, Product: ${item.product}`, err);
    }
  }
};

const incrementStock = async (order) => {
  const { branchId, vendor, items } = order;
  for (const item of items) {
    try {
      const productId = item.product._id || item.product;
      const quantity = parseInt(item.quantity) || 0;

      if (branchId) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: productId, 'branchStocks.branchId': branchId },
          { $inc: { 'branchStocks.$.stock': quantity } },
          { new: true }
        );

        if (updatedProduct) {
          const currentBS = updatedProduct.branchStocks.find(bs => bs.branchId.toString() === branchId.toString());
          await InventoryLog.create({
            product: productId,
            branchId: branchId,
            changeAmount: quantity,
            previousStock: (currentBS?.stock || 0) - quantity,
            newStock: currentBS?.stock || 0,
            type: 'Addition',
            reason: `Order Reversal (Cancel/Return) #${order.orderId}`,
            orderId: order._id
          });
        }
      } else if (vendor) {
        // Restore to top-level stock
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: productId },
          { $inc: { stock: quantity } },
          { new: true }
        );

        if (updatedProduct) {
          await InventoryLog.create({
            product: productId,
            vendorId: vendor,
            changeAmount: quantity,
            previousStock: (updatedProduct.stock || 0) - quantity,
            newStock: updatedProduct.stock || 0,
            type: 'Addition',
            reason: `Order Reversal (Cancel/Return) #${order.orderId}`,
            orderId: order._id
          });
        }
      }
    } catch (err) {
      console.error(`[STOCK-INCREMENT-FAIL] Order: ${order.orderId}, Product: ${item.product}`, err);
    }
  }
};

/**
 * HELPER: Credit Vendor Wallet on Delivery
 */
export const creditVendorWallet = async (order) => {
  if (!order.vendor || order.status !== 'delivered') return;

  try {
    const payoutAmount = order.vendorPayoutAmount || 0;
    if (payoutAmount <= 0) return;

    let wallet = await Wallet.findOne({ owner: order.vendor, ownerModel: 'Vendor' });
    if (!wallet) {
      wallet = await Wallet.create({
        owner: order.vendor,
        ownerModel: 'Vendor',
        balance: 0,
        totalEarnings: 0
      });
    }

    // Check if transaction already exists to prevent double credit
    const existingTx = await Transaction.findOne({
      wallet: wallet._id,
      referenceId: order._id,
      category: 'order_revenue'
    });

    if (existingTx) return;

    wallet.balance += payoutAmount;
    wallet.totalEarnings += payoutAmount;
    await wallet.save();

    await Transaction.create({
      wallet: wallet._id,
      amount: payoutAmount,
      type: 'credit',
      category: 'order_revenue',
      referenceId: order._id,
      referenceModel: 'Order',
      description: `Revenue for Order #${order.orderId} (Net of commission)`
    });
  } catch (error) {
    console.error('Error crediting vendor wallet:', error);
  }
};

/**
 * HELPER: Debit Vendor Wallet on Return
 */
export const debitVendorWallet = async (order) => {
  if (!order.vendor || order.status !== 'returned') return;

  try {
    const payoutAmount = order.vendorPayoutAmount || 0;
    if (payoutAmount <= 0) return;

    let wallet = await Wallet.findOne({ owner: order.vendor, ownerModel: 'Vendor' });
    if (!wallet) return; // No wallet, nothing to debit (shouldn't happen if delivered)

    // Check if debit transaction already exists to prevent double debit
    const existingTx = await Transaction.findOne({
      wallet: wallet._id,
      referenceId: order._id,
      type: 'debit',
      category: 'adjustment'
    });

    if (existingTx) return;

    wallet.balance -= payoutAmount;
    // We also reduce totalEarnings to keep stats accurate for the period
    wallet.totalEarnings = Math.max(0, wallet.totalEarnings - payoutAmount);
    await wallet.save();

    await Transaction.create({
      wallet: wallet._id,
      amount: payoutAmount,
      type: 'debit',
      category: 'adjustment',
      referenceId: order._id,
      referenceModel: 'Order',
      description: `Refund Debit for Return #${order.orderId}`
    });
  } catch (error) {
    console.error('Error debiting vendor wallet:', error);
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

    // RANGE VALIDATION (Store-First Architecture Safeguard)
    if (orderData.storeId) {
      await validateStoreDistance(orderData.storeId, orderData.storeType, orderData.shippingAddress.location);
    }

    // SLOT VALIDATION
    await validateSlotAvailability(orderData.deliverySlotId, orderData.isImmediate);

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
      deliverySlot: orderData.deliverySlot,        // legacy label
      deliverySlotId: orderData.deliverySlotId || null, // Sprint 2: ObjectId ref
      isImmediate: orderData.isImmediate ?? true,       // Sprint 2: ASAP flag
    });

    // Priority 1: Use specific Store if provided by Frontend (Store-First Architecture)
    if (orderData.storeId && orderData.storeType) {
      if (orderData.storeType === 'branch') {
        order.branchId = orderData.storeId;
      } else {
        order.vendor = orderData.storeId;
      }
    }
    // Legacy/Fallback Logic
    else if (coords) {
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

    // SLOT VALIDATION
    await validateSlotAvailability(orderData.deliverySlotId, orderData.isImmediate);

    // Strip empty location bounds
    if (orderData.shippingAddress && (!orderData.shippingAddress.location || !orderData.shippingAddress.location.coordinates || orderData.shippingAddress.location.coordinates.length < 2)) {
      delete orderData.shippingAddress.location;
    }

    // RANGE VALIDATION (Store-First Architecture Safeguard)
    if (orderData.storeId) {
      await validateStoreDistance(orderData.storeId, orderData.storeType, orderData.shippingAddress.location);
    }

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
      deliverySlot: orderData.deliverySlot,        // legacy label
      deliverySlotId: orderData.deliverySlotId || null, // Sprint 2: ObjectId ref
      isImmediate: orderData.isImmediate ?? true,       // Sprint 2: ASAP flag
    });

    // Priority 1: Use specific Store if provided by Frontend (Store-First Architecture)
    if (orderData.storeId && orderData.storeType) {
      if (orderData.storeType === 'branch') {
        order.branchId = orderData.storeId;
      } else {
        order.vendor = orderData.storeId;
      }
    }
    // Legacy/Fallback Logic
    else {
      let coords = orderData.shippingAddress?.location?.coordinates;
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
    }

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
    const { items, storeId, storeType } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const bill = await computeBillDetails(items, { storeId, storeType });
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
    const orders = await Order.find({ user: req.user._id })
      .select('orderId status items totalAmount createdAt paymentStatus cancellation paymentMethod deliveryOTP')
      .sort({ createdAt: -1 });
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
    const { origin: clientOrigin } = req.query;
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

    // Origin priority:
    // 1. Client provided 'origin' (via query param)
    // 2. Rider's current location from DB
    // 3. Fallback to store/branch location
    let originStr = "";

    if (clientOrigin) {
      originStr = clientOrigin;
    } else if (order.deliveryPartnerId?.currentLocation?.coordinates) {
      const riderLoc = order.deliveryPartnerId.currentLocation.coordinates;
      originStr = `${riderLoc[1]},${riderLoc[0]}`;
    } else {
      // Fallback to store if rider not assigned or location missing
      // Fix: Branch/Vendor location is nested under .address
      const storeLoc = order.branchId?.address?.location?.coordinates || order.vendor?.address?.location?.coordinates;
      if (storeLoc) originStr = `${storeLoc[1]},${storeLoc[0]}`;
    }

    if (!originStr) return res.status(400).json({ message: 'Rider or Store location not detected' });

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API;
    if (!apiKey) return res.status(500).json({ message: 'Maps logic restricted on server currently' });

    console.log(`🗺️ Order Route Request: Origin ${originStr}, Destination ${destination}`);
    const mapUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destination}&key=${apiKey}`;
    const response = await axios.get(mapUrl);

    if (response.data.status !== "OK") {
      console.error('❌ Google Maps Order Route Error:', response.data.status, response.data.error_message);
      return res.status(400).json({ message: response.data.error_message || "Maps engine responded with error" });
    }

    console.log(`✅ Order Route fetched successfully`);
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
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      paymentMethod,
      paymentStatus,
      startDate,
      endDate,
      branchId
    } = req.query;

    let query = {};

    // Branch Scoping: If not Super Admin, only show orders for their branch
    if (req.admin.role !== 'Admin') {
      if (!req.admin.branchId) {
        return res.status(403).json({ message: 'No branch assigned' });
      }
      query.branchId = req.admin.branchId;
    } else if (branchId) {
      // Super Admin filtering by branch
      query.branchId = branchId;
    }

    // Search logic
    if (search) {
      const searchRegex = new RegExp(search, 'i');

      // We need to search by orderId and also by user name/email.
      // Since user is a ref, we first find matching users.
      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      }).select('_id');
      const userIds = matchingUsers.map(user => user._id);

      query.$or = [
        { orderId: searchRegex },
        { user: { $in: userIds } }
      ];
    }

    // Filters
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Pagination
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Run paginated results, total count, AND full-dataset aggregate stats in parallel
    const [orders, totalOrders, statsAgg] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .populate('branchId', 'name')
        .populate('vendor', 'storeName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      Order.countDocuments(query),
      // Aggregate across ALL matching docs (no pagination) for accurate stats
      Order.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalPaid: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
            },
            totalPendingPayment: {
              $sum: { $cond: [{ $ne: ['$paymentStatus', 'paid'] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const aggResult = statsAgg[0] || {};

    res.json({
      orders,
      pagination: {
        total: totalOrders,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalOrders / limitNumber)
      },
      stats: {
        totalOrders,
        totalPaid: aggResult.totalPaid || 0,
        totalPendingPayment: aggResult.totalPendingPayment || 0,
        totalRevenue: parseFloat((aggResult.totalRevenue || 0).toFixed(2))
      }
    });
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

    if ((status === 'cancelled' || status === 'returned') && oldStatus !== 'cancelled' && oldStatus !== 'returned') {
      order.cancellation = {
        isCancelled: true,
        reason: status === 'cancelled' ? 'Cancelled by Admin/Staff' : 'Returned',
        cancelledAt: new Date()
      };
      // Restore Stock
      await incrementStock(order);
    }

    const updatedOrder = await order.save();

    // Trigger Wallet Credit if status is delivered
    if (status === 'delivered') {
      await creditVendorWallet(updatedOrder);
    }

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

// @desc    Get all orders for a specific vendor
// @route   GET /api/vendors/orders
// @access  Private (Vendor)
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { status, search } = req.query;

    let query = { vendor: vendorId };

    if (status && status !== 'All') {
      query.status = status.toLowerCase();
    }

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name image unitValue unitType')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status by vendor
// @route   PUT /api/vendors/orders/:id/status
// @access  Private (Vendor)
export const updateVendorOrderStatus = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { status } = req.body;

    const allowedStatuses = ['preparing', 'ready_for_pickup', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update for vendor' });
    }

    const order = await Order.findOne({ _id: req.params.id, vendor: vendorId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({ message: `Order status updated to ${status}`, order });
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
