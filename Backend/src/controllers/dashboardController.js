import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
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

    // Determine the "store" filter for complaints
    const complaintStoreFilter = role === 'Admin' ? {} : { store: branchId };

    // 1. STATS: Revenue, Orders, Products, Users, Low Stock, Riders
    const [
      revenueResult,
      prevRevenueResult,
      totalOrders,
      prevTotalOrders,
      pendingOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      pendingTickets,
      lowStockCount,
      activeRiders,
      channelSplit
    ] = await Promise.all([
      // Total Revenue (Current 30 Days)
      Order.aggregate([
        { $match: { ...query, $or: [{ paymentStatus: 'paid' }, { status: 'delivered' }], createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      // Prev Revenue (Previous 30 Days)
      Order.aggregate([
        { $match: { ...query, $or: [{ paymentStatus: 'paid' }, { status: 'delivered' }], createdAt: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      // Total Orders (Current 30 Days)
      Order.countDocuments({ ...query, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      // Prev Total Orders
      Order.countDocuments({ ...query, createdAt: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      // Pending Orders
      Order.countDocuments({ ...query, status: { $in: ['pending', 'confirmed', 'preparing', 'out_for_delivery'] } }),
      // Total Products
      role === 'Admin' ? Product.countDocuments() : Product.countDocuments({ 'branchStocks.branchId': branchId }),
      // Users
      User.countDocuments({ role: 'user' }),
      // Recent Orders
      Order.find(query)
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      // Tickets
      Complaint.countDocuments({ ...complaintStoreFilter, status: 'ESCALATED_TO_STORE' }),
      // Low Stock
      role === 'Admin' 
        ? Product.aggregate([
            { $match: { status: { $ne: 'Draft' } } },
            { $project: {
                isLow: {
                  $or: [
                    { $and: [
                        { $gt: ["$vendor", null] }, 
                        { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 10] }] }
                    ] },
                    { $gt: [
                      { $size: { 
                        $filter: { 
                          input: { $ifNull: ["$branchStocks", []] }, 
                          as: "bs", 
                          cond: { $lte: ["$$bs.stock", { $ifNull: ["$$bs.lowStockThreshold", 10] }] } 
                        } 
                      } }, 0
                    ] }
                  ]
                }
            } },
            { $match: { isLow: true } },
            { $count: "count" }
          ])
        : Product.aggregate([
            { $match: { status: { $ne: 'Draft' } } },
            { $unwind: "$branchStocks" },
            { $match: { 
                "branchStocks.branchId": new mongoose.Types.ObjectId(branchId),
                $expr: { $lte: ["$branchStocks.stock", { $ifNull: ["$branchStocks.lowStockThreshold", 10] }] }
              } 
            },
            { $count: "count" }
          ]),
      // Active Riders
      DeliveryPartner.countDocuments({ status: 'Online', assignmentStatus: 'Free' }),
      // Channel Split
      Order.aggregate([
        { $match: { ...query, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: '$orderSource', count: { $sum: 1 } } }
      ])
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const prevRevenue = prevRevenueResult.length > 0 ? prevRevenueResult[0].total : 0;
    
    // Growth Calculations
    const revenueGrowth = prevRevenue === 0 ? 100 : ((totalRevenue - prevRevenue) / prevRevenue) * 100;
    const orderGrowth = prevTotalOrders === 0 ? 100 : ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100;

    // 2. REVENUE CHART DATA (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
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

    const finalRevenueHistory = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const match = revenueHistory.find(h => h._id === dateStr);
        finalRevenueHistory.push({
            name: d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: dateStr,
            revenue: match ? match.revenue : 0,
            orders: match ? match.orders : 0
        });
    }

    const finalLowStockCount = lowStockCount[0]?.count || 0;

    res.json({
      success: true,
      stats: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
        totalOrders,
        orderGrowth: parseFloat(orderGrowth.toFixed(1)),
        pendingOrders,
        totalProducts,
        totalUsers: role === 'Admin' ? totalUsers : null,
        pendingTickets,
        lowStockCount: finalLowStockCount,
        activeRiders
      },
      channels: {
        pos: channelSplit.find(c => c._id === 'pos')?.count || 0,
        online: channelSplit.find(c => c._id === 'online')?.count || 0
      },
      recentOrders: recentOrders.map(o => ({
        id: o.orderId,
        customer: o.user?.name || o.posCustomer?.name || 'Guest',
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
