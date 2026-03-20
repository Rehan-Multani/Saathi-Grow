import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';
import VendorPayout from '../models/VendorPayout.js';
import { notifyByBranchAndPermission } from '../services/notificationService.js';

// @desc    Get vendor wallet balance and paginated transactions
// @route   GET /api/vendors/wallet?page=1&limit=10
// @access  Private (Vendor)
export const getVendorWallet = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const page    = Math.max(parseInt(req.query.page  || '1',  10), 1);
    const limit   = Math.min(parseInt(req.query.limit || '10', 10), 50);

    const wallet = await Wallet.findOneAndUpdate(
      { owner: vendorId, ownerModel: 'Vendor' },
      { $setOnInsert: { balance: 0, totalEarnings: 0, pendingPayouts: 0 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Paginated transactions
    const [total, transactions] = await Promise.all([
      Transaction.countDocuments({ wallet: wallet._id }),
      Transaction.find({ wallet: wallet._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
    ]);

    // Load vendor's saved bank account
    const Vendor = (await import('../models/Vendor.js')).default;
    const vendor = await Vendor.findById(vendorId).select('bankAccount');

    res.json({
      balance:        wallet.balance,
      totalEarnings:  wallet.totalEarnings,
      pendingPayouts: wallet.pendingPayouts,
      bankAccount:    vendor?.bankAccount || null,
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a withdrawal request
// @route   POST /api/vendors/wallet/withdraw
// @access  Private (Vendor)
export const requestWithdrawal = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { amount } = req.body;

    if (!amount || isNaN(amount) || Number(amount) < 500) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₹500' });
    }

    const withdrawAmount = Number(amount);

    // Load vendor's saved bank account
    const VendorModel = (await import('../models/Vendor.js')).default;
    const vendorDoc = await VendorModel.findById(vendorId).select('bankAccount');
    const savedAccount = vendorDoc?.bankAccount;

    // Must have a saved account
    const hasUpi = savedAccount?.upiId;
    const hasBankDetails = savedAccount?.accountNumber && savedAccount?.ifscCode;
    if (!hasUpi && !hasBankDetails) {
      return res.status(400).json({
        message: 'Please add your bank account / UPI ID in the Earnings page before requesting a withdrawal'
      });
    }

    const resolvedUpiId = savedAccount.upiId || `${savedAccount.accountNumber} (${savedAccount.bankName})`;
    const paymentMethod = savedAccount.upiId ? 'UPI' : 'Bank Transfer';

    // Get or create vendor wallet
    const wallet = await Wallet.findOneAndUpdate(
      { owner: vendorId, ownerModel: 'Vendor' },
      { $setOnInsert: { balance: 0, totalEarnings: 0, pendingPayouts: 0 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Available balance = balance - pendingPayouts
    const availableBalance = wallet.balance - (wallet.pendingPayouts || 0);
    if (availableBalance < withdrawAmount) {
      return res.status(400).json({
        message: `Insufficient available balance. Available: ₹${availableBalance.toFixed(2)}, Requested: ₹${withdrawAmount}`
      });
    }

    // Create the payout request with full bank details
    const payoutRequest = await VendorPayout.create({
      vendor: vendorId,
      amount: withdrawAmount,
      upiId: resolvedUpiId,
      paymentMethod,
      status: 'Pending',
      requestType: 'vendor_request',
      note: hasBankDetails
        ? `Bank: ${savedAccount.bankName} | Acc: ${savedAccount.accountNumber} | IFSC: ${savedAccount.ifscCode} | Holder: ${savedAccount.accountHolderName}`
        : ''
    });

    // Hold the amount in pendingPayouts
    await Wallet.findByIdAndUpdate(wallet._id, {
      $inc: { pendingPayouts: withdrawAmount }
    });

    // Record a pending withdrawal transaction for display in earnings
    await Transaction.create({
      wallet: wallet._id,
      amount: withdrawAmount,
      type: 'debit',
      category: 'withdrawal',
      status: 'pending',
      description: `Withdrawal Request Submitted (₹${withdrawAmount} to ${resolvedUpiId})`,
      referenceId: payoutRequest._id,
      referenceModel: 'VendorPayout'
    });

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully. Admin will process it shortly.',
      request: payoutRequest
    });

    // Notify Admins of the new withdrawal request
    await notifyByBranchAndPermission('MANAGE_FINANCE', null, {
      title: 'New Withdrawal Request',
      body: `Vendor ${req.vendor.storeName} has requested a withdrawal of ₹${withdrawAmount}.`
    }, { type: 'withdrawal_request', payoutId: payoutRequest._id.toString() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor's own withdrawal requests (paginated)
// @route   GET /api/vendors/wallet/withdrawals?page=1&limit=10
// @access  Private (Vendor)
export const getWithdrawalRequests = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);

    const [total, requests] = await Promise.all([
      VendorPayout.countDocuments({ vendor: vendorId }),
      VendorPayout.find({ vendor: vendorId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
    ]);

    res.json({
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor earnings performance stats
// @route   GET /api/vendors/wallet/stats
// @access  Private (Vendor)
export const getVendorEarningsStats = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    // Regular delivered orders (online/COD) — use vendorPayoutAmount
    const deliveredOrders = await Order.find({
      vendor: vendorId,
      status: 'delivered',
      orderSource: { $ne: 'pos' } // Exclude POS orders from regular orders
    });

    // POS delivered orders — vendor received subTotal as physical cash
    const posOrders = await Order.find({
      vendor: vendorId,
      status: 'delivered',
      orderSource: 'pos'
    });

    const regularSales = deliveredOrders.reduce((sum, order) => sum + (order.vendorPayoutAmount || order.totalAmount), 0);
    const posSales = posOrders.reduce((sum, order) => sum + (order.subTotal || order.totalAmount), 0);
    const totalSales = regularSales + posSales;

    // Returns
    const returnedOrders = await Order.find({
      vendor: vendorId,
      'returnRequest.isRequested': true,
      status: 'returned'
    });

    const totalReturns = returnedOrders.reduce((sum, order) => sum + (order.vendorPayoutAmount || order.totalAmount), 0);

    res.json({
      totalSales,
      regularSales,
      posSales,
      totalReturns,
      orderCount: deliveredOrders.length,
      posOrderCount: posOrders.length,
      returnCount: returnedOrders.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

