import Order from '../models/Order.js';
import Product from '../models/Product.js';
import GlobalSetting from '../models/GlobalSetting.js';
import Vendor from '../models/Vendor.js';
import Branch from '../models/Branch.js';
import Admin from '../models/Admin.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import { computeBillDetails, decrementStock } from './orderController.js';
import { sendInvoiceEmail } from '../services/emailService.js';

/**
 * @desc    Create a new POS order for walk-in customers
 * @route   POST /api/pos/create
 * @access  Private (Admin/Staff/Vendor)
 */
export const createPOSOrder = async (req, res) => {
  try {
    const { items, customerDetails, storeId, storeType } = req.body;

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

    // Fetch Store Details for Location/Address accuracy
    let store;
    if (storeType === 'branch') {
      store = await Branch.findById(storeId);
    } else {
      store = await Vendor.findById(storeId);
    }

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
      platformCommission: bill.platformCommission,
      vendorPayoutAmount: bill.vendorPayoutAmount,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      status: 'delivered', // POS orders are instant delivery
      orderSource: 'pos',
      posCustomer: customerDetails, // { name, email, phone }
      vendor: storeType === 'vendor' ? storeId : null,
      branchId: storeType === 'branch' ? storeId : null,
      shippingAddress: {
        name: customerDetails?.name || 'Walk-in Customer',
        phone: customerDetails?.phone || '',
        street: store?.address?.street || '',
        city: store?.address?.city || 'Local Store',
        state: store?.address?.state || '',
        zipCode: store?.address?.zipCode || ''
      }
    });

    const createdOrder = await order.save();

    // Wallet Logic: If Vendor POS, deduct Total Amount from Vendor Wallet and add to Admin Wallet
    if (storeType === 'vendor') {
      const amountToDeduct = bill.totalAmount;

      if (amountToDeduct > 0) {
        // Find Super Admin to receive the balance
        const adminUser = await Admin.findOne({ role: 'Admin' });
        if (adminUser) {
          // Update Vendor Wallet
          let vendorWallet = await Wallet.findOne({ owner: storeId, ownerModel: 'Vendor' });
          if (!vendorWallet) {
            vendorWallet = await Wallet.create({ owner: storeId, ownerModel: 'Vendor', balance: 0 });
          }

          // Update Admin Wallet
          let adminWallet = await Wallet.findOne({ owner: adminUser._id, ownerModel: 'Admin' });
          if (!adminWallet) {
            adminWallet = await Wallet.create({ owner: adminUser._id, ownerModel: 'Admin', balance: 0 });
          }

          vendorWallet.balance -= amountToDeduct;
          await vendorWallet.save();

          adminWallet.balance += amountToDeduct;
          await adminWallet.save();

          // Record formal transactions for accounting
          await Transaction.create({
            wallet: vendorWallet._id,
            amount: amountToDeduct,
            type: 'debit',
            category: 'order_revenue',
            description: `POS Order Value Deduction: ${createdOrder.orderId}`,
            referenceId: createdOrder._id,
            referenceModel: 'Order'
          });

          await Transaction.create({
            wallet: adminWallet._id,
            amount: amountToDeduct,
            type: 'credit',
            category: 'order_revenue',
            description: `POS Order Revenue from Vendor: ${createdOrder.orderId}`,
            referenceId: createdOrder._id,
            referenceModel: 'Order'
          });
        }
      }
    }

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
