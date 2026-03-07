import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';

// @desc    Get vendor wallet balance and recent transactions
// @route   GET /api/vendors/wallet
// @access  Private (Vendor)
export const getVendorWallet = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    let wallet = await Wallet.findOne({ owner: vendorId, ownerModel: 'Vendor' });
    if (!wallet) {
      wallet = await Wallet.create({
        owner: vendorId,
        ownerModel: 'Vendor',
        balance: 0,
        totalEarnings: 0
      });
    }

    const transactions = await Transaction.find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      balance: wallet.balance,
      totalEarnings: wallet.totalEarnings,
      pendingPayouts: wallet.pendingPayouts,
      transactions
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

    // Total active orders revenue (delivered)
    const deliveredOrders = await Order.find({
      vendor: vendorId,
      status: 'delivered'
    });

    const totalSales = deliveredOrders.reduce((sum, order) => sum + (order.vendorPayoutAmount || order.totalAmount), 0);

    // Returns (placeholder for now, filter orders with returnRequested)
    const returnedOrders = await Order.find({
      vendor: vendorId,
      'returnRequest.isRequested': true,
      status: 'returned'
    });

    const totalReturns = returnedOrders.reduce((sum, order) => sum + (order.vendorPayoutAmount || order.totalAmount), 0);

    res.json({
      totalSales,
      totalReturns,
      orderCount: deliveredOrders.length,
      returnCount: returnedOrders.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
