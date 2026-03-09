import Order from '../models/Order.js';
import Product from '../models/Product.js';
import GlobalSetting from '../models/GlobalSetting.js';
import { computeBillDetails, decrementStock } from './orderController.js';
import { sendInvoiceEmail } from '../services/emailService.js';

/**
 * @desc    Create a new POS order for walk-in customers
 * @route   POST /api/pos/create
 * @access  Private (Admin/Staff/Vendor)
 */
export const createPOSOrder = async (req, res) => {
  try {
    const { items, customerDetails, paymentMethod, storeId, storeType, razorpayDetails } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required' });
    }

    // Role check: Only branch managers/staff or vendors can create POS orders.
    // Super Admins should not create orders directly in the Admin Panel Terminal.
    if (req.admin) {
      if (req.admin.role === 'Admin' && (!storeId || storeId === 'null')) {
        return res.status(403).json({
          message: 'Super Admin terminal is disabled. Please perform POS billing from a specific Store/Branch panel.'
        });
      }

      // POS Permission Check for Staff/Branch Managers
      if (req.admin.role !== 'Admin' && (!req.admin.permissions || !req.admin.permissions.includes('MANAGE_POS_BILLING'))) {
        return res.status(403).json({
          message: 'Access Denied: You do not have permission to handle POS billing.'
        });
      }
    }

    // Recompute bill on backend for security and accuracy (applying latest tax configs)
    const bill = await computeBillDetails(items, { storeId, storeType });

    const order = new Order({
      orderId: 'POS-' + Date.now().toString(),
      items: items.map(item => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      subTotal: bill.subTotal,
      taxAmount: bill.taxAmount,
      totalAmount: bill.totalAmount,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentMethod === 'cash' ? 'paid' : 'pending',
      status: 'delivered', // POS orders are instant delivery
      orderSource: 'pos',
      posCustomer: customerDetails, // { name, email, phone }
      vendor: storeType === 'vendor' ? storeId : null,
      branchId: storeType === 'branch' ? storeId : null,
      razorpayPaymentId: razorpayDetails?.razorpayPaymentId || null,
      razorpayOrderId: razorpayDetails?.razorpayOrderId || null,
      razorpaySignature: razorpayDetails?.razorpaySignature || null
    });

    // If paying via online QR, we expect verification to Have happened or we record details
    if (paymentMethod === 'online' && razorpayDetails) {
      order.paymentStatus = 'paid';
    }

    const createdOrder = await order.save();

    // Immediately deduct stock for the selected products at the specific branch/vendor
    await decrementStock(createdOrder);

    // Notify customer via email if email provided
    if (customerDetails?.email) {
      console.log(`[POS] Triggering invoice email for: ${customerDetails.email}`);
      // Non-blocking email send
      sendInvoiceEmail(customerDetails.email, createdOrder).then(success => {
        if (success) console.log(`[POS] Invoice successfully sent to ${customerDetails.email}`);
      }).catch(e => console.error(`[POS] Failed background email send:`, e));
    }

    res.status(201).json({
      success: true,
      message: 'Order completed successfully',
      order: createdOrder
    });

  } catch (error) {
    console.error('POS System Error:', error);
    res.status(500).json({ message: error.message || 'Internal POS Processing Error' });
  }
};

/**
 * @desc    Get POS specific orders for the requesting entity
 * @route   GET /api/pos/list
 * @access  Private
 */
export const getPOSOrders = async (req, res) => {
  try {
    const { storeId, storeType, page = 1, limit = 10 } = req.query;
    let query = { orderSource: 'pos' };

    // If not Super Admin, strictly filter by branch/vendor
    if (req.vendor) {
      query.vendor = req.vendor._id;
    } else if (req.admin && req.admin.role !== 'Admin') {
      // Check Permission for Staff/Store Manager
      if (!req.admin.permissions || !req.admin.permissions.includes('MANAGE_POS_BILLING')) {
        return res.status(403).json({ message: 'Access Denied: You do not have permission to view POS history.' });
      }
      query.branchId = req.admin.branchId;
    } else if (storeId) {
      // Super Admin manual filtering
      if (storeType === 'branch') query.branchId = storeId;
      else query.vendor = storeId;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('branchId', 'name')
        .populate('vendor', 'storeName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
