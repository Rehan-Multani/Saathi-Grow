import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import mongoose from 'mongoose';

// @desc    Get dashboard analytics (Global or Branch-scoped)
// @route   GET /api/dashboard/stats
// @access  Private (Admin, Branch Manager, Staff)
export const getDashboardStats = async (req, res) => {
  try {
    const { role, branchId } = req.admin;
    let query = {};

    // Branch Scoping: If not Super Admin, strictly filter by branchId
    if (role !== 'Admin') {
      if (!branchId) {
        return res.status(403).json({ success: false, message: 'You are not assigned to any branch. Access denied to dashboard.' });
      }
      query.branchId = branchId;
    }

    // 1. STATS: Revenue, Orders, Products, Users
    const [
      revenueResult,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalUsers,
      recentOrders
    ] = await Promise.all([
      // Total Revenue (Paid or Delivered)
      Order.aggregate([
        { $match: { ...query, $or: [{ paymentStatus: 'paid' }, { status: 'delivered' }] } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      // Total Orders
      Order.countDocuments(query),
      // Pending Orders
      Order.countDocuments({ ...query, status: { $in: ['pending', 'confirmed', 'preparing', 'out_for_delivery'] } }),
      // Total Products (Global for Admin, or products available in branch)
      role === 'Admin' ? Product.countDocuments() : Product.countDocuments({ 'branchStocks.branchId': branchId }),
      // Global New Users (Always global for analytics usually)
      User.countDocuments({ role: 'user' }),
      // Recent Orders (Last 5)
      Order.find(query)
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 2. REVENUE CHART DATA (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    // Reset hour to 0:00:00
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const revenueHistory = await Order.aggregate([
      {
        $match: {
          ...query,
          $or: [{ paymentStatus: 'paid' }, { status: 'delivered' }],
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Fill missing days with 0
    const finalRevenueHistory = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const match = revenueHistory.find(h => h._id === dateStr);
      finalRevenueHistory.push({
        name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: match ? match.revenue : 0,
        orders: match ? match.orders : 0
      });
    }

    res.json({
      success: true,
      stats: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        pendingOrders,
        totalProducts,
        totalUsers: role === 'Admin' ? totalUsers : null, // Only admin sees global user count
      },
      recentOrders: recentOrders.map(o => ({
        id: o.orderId,
        customer: o.user?.name || 'Guest',
        amount: o.totalAmount,
        status: o.status,
        date: o.createdAt
      })),
      revenueData: finalRevenueHistory
    });

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
