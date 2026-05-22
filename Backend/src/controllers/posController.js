import Order from '../models/Order.js';
import Product from '../models/Product.js';
import GlobalSetting from '../models/GlobalSetting.js';
import Vendor from '../models/Vendor.js';
import Branch from '../models/Branch.js';
import Admin from '../models/Admin.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import { computeBillDetails, decrementStock, enrichItemsWithLocations } from './orderController.js';
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
    // Super Admins/Admin role is allowed only if they select/provide a valid branch/storeId.
    if (req.admin && req.admin.role === 'Admin' && !storeId) {
      return res.status(403).json({
        message: 'Admin role is restricted to viewing status/history only unless a store/branch is explicitly selected.'
      });
    }

    // POS Permission Check for Staff/Branch Managers
    if (req.admin && !['Admin', 'Branch Manager'].includes(req.admin.role) && (!req.admin.permissions || !req.admin.permissions.includes('MANAGE_POS_BILLING'))) {
      return res.status(403).json({
        message: 'Access Denied: You do not have permission to handle POS billing.'
      });
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

    // Enrich items with physicalLocation for picking
    const enrichedItems = await enrichItemsWithLocations(items);

    const order = new Order({
      orderId: 'POS-' + Math.floor(10000000 + Math.random() * 90000000).toString(),
      items: enrichedItems.map(item => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        physicalLocation: item.physicalLocation
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

    // ─── POS Wallet Logic ───────────────────────────────────────────────
    const adminUser = await Admin.findOne({ role: 'Admin' });
    if (adminUser) {
      if (storeType === 'vendor') {
        // Business Rule (Vendor In-Store Cash Sale):
        //   • Customer pays vendor DIRECTLY in cash
        //   • Vendor KEEPS the full cash payment physically
        //   • Platform DEDUCTS its share (Commission + Taxes + Fees) from vendor wallet balance
        //   • This creates a "debt" or reduces vendor's digital balance
        const platformCut = (bill.totalAmount || 0) - (bill.vendorPayoutAmount || 0);

        const vendorWallet = await Wallet.findOneAndUpdate(
          { owner: storeId, ownerModel: 'Vendor' },
          { $setOnInsert: { balance: 0, totalEarnings: 0, pendingPayouts: 0 } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const adminWallet = await Wallet.findOneAndUpdate(
          { owner: adminUser._id, ownerModel: 'Admin' },
          { $setOnInsert: { balance: 0, totalEarnings: 0, pendingPayouts: 0 } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 1. Record Sale as Informational Earnings (Vendor stats)
        await Wallet.findByIdAndUpdate(vendorWallet._id, {
          $inc: { totalEarnings: bill.subTotal }
        });

        await Transaction.create({
          wallet: vendorWallet._id,
          amount: bill.subTotal,
          type: 'credit',
          category: 'order_revenue',
          description: `POS Cash Sale Earned (Received In-Store): ${createdOrder.orderId}`,
          referenceId: createdOrder._id,
          referenceModel: 'Order'
        });

        // 2. Deduct Platform share from vendor
        if (platformCut > 0) {
          await Wallet.findByIdAndUpdate(vendorWallet._id, {
            $inc: { balance: -platformCut }
          });

          await Transaction.create({
            wallet: vendorWallet._id,
            amount: platformCut,
            type: 'debit',
            category: 'platform_commission',
            description: `POS Platform Share Deducted: ${createdOrder.orderId}`,
            referenceId: createdOrder._id,
            referenceModel: 'Order'
          });

          // 3. Credit Platform share to Admin treasury
          await Wallet.findByIdAndUpdate(adminWallet._id, {
            $inc: { balance: platformCut, totalEarnings: platformCut }
          });

          await Transaction.create({
            wallet: adminWallet._id,
            amount: platformCut,
            type: 'credit',
            category: 'platform_commission',
            description: `POS Share Collected from Vendor: ${createdOrder.orderId}`,
            referenceId: createdOrder._id,
            referenceModel: 'Order'
          });
        }
      } else if (storeType === 'branch') {
        // Business Rule (Branch In-Store Cash Sale):
        //   • Admin's own branch collects cash
        //   • Total revenue belongs to Admin Treasury
        const revenue = bill.totalAmount;

        const adminWallet = await Wallet.findOneAndUpdate(
          { owner: adminUser._id, ownerModel: 'Admin' },
          { $setOnInsert: { balance: 0, totalEarnings: 0, pendingPayouts: 0 } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await Wallet.findByIdAndUpdate(adminWallet._id, {
          $inc: { balance: revenue, totalEarnings: revenue }
        });

        await Transaction.create({
          wallet: adminWallet._id,
          amount: revenue,
          type: 'credit',
          category: 'order_revenue',
          description: `Internal POS Branch Sales Revenue: ${createdOrder.orderId}`,
          referenceId: createdOrder._id,
          referenceModel: 'Order'
        });
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
    } else if (req.admin && !['Admin', 'Branch Manager'].includes(req.admin.role)) {
      // Check Permission for Staff/Store Manager
      if (!req.admin.permissions || !req.admin.permissions.includes('MANAGE_POS_BILLING')) {
        return res.status(403).json({ message: 'Access Denied: You do not have permission to view POS history.' });
      }
      query.branchId = req.admin.branchId;
    } else if (req.admin && req.admin.role === 'Branch Manager') {
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
