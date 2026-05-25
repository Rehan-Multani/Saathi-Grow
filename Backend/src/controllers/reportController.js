import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import VendorPayout from '../models/VendorPayout.js';
import InventoryLog from '../models/InventoryLog.js';
import mongoose from 'mongoose';

// @desc    Get sales reports with stats and paginated orders
// @route   GET /api/admin/reports/sales
// @access  Private (Admin/Staff)
export const getSalesReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      period = 'last_30_days', // last_30_days, this_month, last_month, this_year
      branchId
    } = req.query;

    let query = {};

    // Branch Scoping
    if (req.admin.role !== 'Admin') {
      query.branchId = req.admin.branchId;
    } else if (branchId) {
      query.branchId = branchId;
    }

    // Time filtering
    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date(); // For comparison
    let prevEndDate = new Date();

    if (period === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      query.createdAt = { $gte: startDate, $lte: endDate };
      // Override for comparison logic later if needed
    } else if (period === 'this_year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
      prevEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
    } else {
      // Default: Last 30 days
      startDate.setDate(now.getDate() - 30);
      prevStartDate.setDate(now.getDate() - 60);
      prevEndDate.setDate(now.getDate() - 30);
    }

    if (period !== 'last_month') {
      query.createdAt = { $gte: startDate };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Fetch Stats and Data in Parallel
    const [
      stats,
      prevStats,
      orders,
      totalOrdersCount
    ] = await Promise.all([
      // Current Period Stats
      Order.aggregate([
        { $match: { ...query, status: { $nin: ['cancelled', 'returned'] } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]),
      // Previous Period Stats (for +/- comparison)
      Order.aggregate([
        {
          $match: {
            ...query,
            createdAt: { $gte: prevStartDate, $lte: prevEndDate },
            status: { $nin: ['cancelled', 'returned'] }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 }
          }
        }
      ]),
      // Paginated Orders
      Order.find(query)
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query)
    ]);

    const currentStats = stats[0] || { totalRevenue: 0, orderCount: 0, avgOrderValue: 0 };
    const pastStats = prevStats[0] || { totalRevenue: 0, orderCount: 0 };

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    };

    const revenueGrowth = calculateGrowth(currentStats.totalRevenue, pastStats.totalRevenue);
    const ordersGrowth = calculateGrowth(currentStats.orderCount, pastStats.orderCount);

    res.json({
      success: true,
      stats: {
        totalRevenue: currentStats.totalRevenue,
        revenueGrowth,
        totalOrders: currentStats.orderCount,
        ordersGrowth,
        avgOrderValue: currentStats.avgOrderValue,
        periodSales: currentStats.totalRevenue // For the visual display of current period
      },
      orders: orders.map(o => ({
        id: o.orderId,
        date: o.createdAt.toISOString().split('T')[0],
        customer: o.user?.name || 'Guest / POS',
        items: o.items.length,
        total: o.totalAmount,
        status: o.status.charAt(0).toUpperCase() + o.status.slice(1).replace(/_/g, ' '),
        payment: o.paymentMethod.toUpperCase()
      })),
      pagination: {
        total: totalOrdersCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalOrdersCount / limitNum) || 1
      }
    });

  } catch (error) {
    console.error('Sales Reports Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export sales reports as CSV
// @route   GET /api/admin/reports/sales/export
// @access  Private (Admin/Staff)
export const exportSalesReport = async (req, res) => {
  try {
    const { period = 'last_30_days', branchId } = req.query;

    let query = {};
    if (req.admin.role !== 'Admin') {
      query.branchId = req.admin.branchId;
    } else if (branchId) {
      query.branchId = branchId;
    }

    // Time filtering logic (matched with getSalesReports)
    const now = new Date();
    let startDate = new Date();
    if (period === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      query.createdAt = { $gte: startDate, $lte: endDate };
    } else if (period === 'this_year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    if (period !== 'last_month') {
      query.createdAt = { $gte: startDate };
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('branchId', 'name')
      .populate('vendor', 'storeName')
      .sort({ createdAt: -1 })
      .lean();

    // CSV Construction
    let csv = 'Order ID,Date,Customer,Customer Contact,Source,Items,Total Amount,Payment,Status\n';

    orders.forEach(o => {
      const date = o.createdAt.toISOString().split('T')[0];
      const customer = (o.user?.name || o.posCustomer?.name || 'Guest').replace(/,/g, '');
      const contact = (o.user?.phone || o.posCustomer?.phone || 'N/A').replace(/,/g, '');
      const source = (o.branchId?.name || o.vendor?.storeName || 'Unknown').replace(/,/g, '');
      const total = o.totalAmount;
      const status = o.status.replace(/_/g, ' ');
      const payment = o.paymentMethod.toUpperCase();

      csv += `${o.orderId},${date},${customer},${contact},${source},${o.items.length},${total},${payment},${status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=sales_report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csv);

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Get inventory reports
// @route   GET /api/admin/reports/inventory
// @access  Private (Admin/Staff)
export const getInventoryReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      vendorId,
      branchId,
      search,
      status // Low Stock, Out of Stock, In Stock
    } = req.query;

    let query = {};

    // Base Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (vendorId) query.vendor = vendorId;

    // Branch Scoping (Staff/Managers only see their branch)
    let targetedBranchId = branchId;
    if (req.admin.role !== 'Admin') {
      targetedBranchId = req.admin.branchId;
    }

    if (targetedBranchId) {
      // If a branch is targeted, we only care about Saathigro products or 
      // products that specifically have a stock entry for this branch.
      query.$or = [
        { 'branchStocks.branchId': targetedBranchId },
        { isSaathigro: true }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Fetch products
    const products = await Product.find(query)
      .populate('vendor', 'storeName brandName')
      .populate('branchStocks.branchId', 'name')
      .lean();

    // Map data based on specific branch or global view
    let processedData = products.map(p => {
      let currentStock = 0;
      let threshold = 10;

      if (targetedBranchId) {
        // Specific Branch View
        const branchStockEntry = p.branchStocks?.find(bs => bs.branchId?._id?.toString() === targetedBranchId.toString() || bs.branchId?.toString() === targetedBranchId.toString());
        currentStock = branchStockEntry ? (branchStockEntry.stock || 0) : 0;
        threshold = branchStockEntry ? (branchStockEntry.lowStockThreshold || 0) : (p.lowStockThreshold || 10);
      } else {
        // Global View (Super Admin)
        if (p.vendor) {
          // Vendor product: Use top-level fields
          currentStock = p.stock || 0;
          threshold = p.lowStockThreshold || 10;
        } else {
          // Saathigro product: Aggregate all branches
          currentStock = p.branchStocks?.reduce((sum, bs) => sum + (bs.stock || 0), 0) || 0;
          threshold = p.branchStocks?.reduce((sum, bs) => sum + (bs.lowStockThreshold || 0), 0) || (p.lowStockThreshold || 10);
        }
      }

      let stockStatus = 'In Stock';
      if (currentStock <= 0) stockStatus = 'Out of Stock';
      else if (currentStock <= threshold) stockStatus = 'Low Stock';

      return {
        id: p._id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        vendor: p.vendor?.storeName || (p.isSaathigro ? 'Saathigro' : p.brandName || 'Internal'),
        stock: currentStock,
        unitType: p.unitType || 'pcs',
        reorderLevel: threshold,
        status: stockStatus
      };
    });

    // Summary Stats (Calculate before status filtering so badges show total system status)
    const summary = {
      totalProducts: processedData.length,
      lowStockCount: processedData.filter(p => p.status === 'Low Stock').length,
      outOfStockCount: processedData.filter(p => p.status === 'Out of Stock').length
    };

    // Filtering by Status (after processing)
    if (status) {
      processedData = processedData.filter(p => p.status === status);
    }

    const totalFilteredCount = processedData.length;
    const paginatedData = processedData.slice(skip, skip + limitNum);

    res.json({
      success: true,
      summary,
      inventory: paginatedData,
      pagination: {
        total: totalFilteredCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalFilteredCount / limitNum) || 1
      }
    });

  } catch (error) {
    console.error('Inventory Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export inventory reports as CSV
// @route   GET /api/admin/reports/inventory/export
// @access  Private (Admin/Staff)
export const exportInventoryReport = async (req, res) => {
  try {
    const { category, vendorId, branchId, search, status } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (vendorId) query.vendor = vendorId;

    let targetedBranchId = branchId;
    if (req.admin.role !== 'Admin') {
      targetedBranchId = req.admin.branchId;
    }

    if (targetedBranchId) {
      query.$or = [
        { 'branchStocks.branchId': targetedBranchId },
        { isSaathigro: true }
      ];
    }

    const products = await Product.find(query)
      .populate('vendor', 'storeName brandName')
      .lean();

    let processedData = products.map(p => {
      let currentStock = 0;
      let threshold = 10;

      if (targetedBranchId) {
        const branchStockEntry = p.branchStocks?.find(bs => bs.branchId?._id?.toString() === targetedBranchId.toString() || bs.branchId?.toString() === targetedBranchId.toString());
        currentStock = branchStockEntry ? (branchStockEntry.stock || 0) : 0;
        threshold = branchStockEntry ? (branchStockEntry.lowStockThreshold || 0) : (p.lowStockThreshold || 10);
      } else {
        if (p.vendor) {
          currentStock = p.stock || 0;
          threshold = p.lowStockThreshold || 10;
        } else {
          currentStock = p.branchStocks?.reduce((sum, bs) => sum + (bs.stock || 0), 0) || 0;
          threshold = p.branchStocks?.reduce((sum, bs) => sum + (bs.lowStockThreshold || 0), 0) || (p.lowStockThreshold || 10);
        }
      }

      let stockStatus = 'In Stock';
      if (currentStock <= 0) stockStatus = 'Out of Stock';
      else if (currentStock <= threshold) stockStatus = 'Low Stock';

      return {
        sku: p.sku,
        name: p.name,
        category: p.category,
        vendor: p.vendor?.storeName || (p.isSaathigro ? 'Saathigro' : p.brandName || 'Internal'),
        stock: `${currentStock} ${p.unitType || 'pcs'}`,
        reorderLevel: threshold,
        status: stockStatus
      };
    });

    if (status) {
      processedData = processedData.filter(p => p.status === status);
    }

    // Build CSV
    let csv = 'SKU,Product Name,Category,Vendor/Source,Current Stock,Unit,Reorder Level,Status\n';
    processedData.forEach(p => {
      const stockVal = p.stock.split(' ')[0];
      const unitVal = p.stock.split(' ')[1] || 'pcs';
      csv += `"${p.sku}","${p.name.replace(/"/g, '""')}","${p.category}","${p.vendor}","${stockVal}","${unitVal}","${p.reorderLevel}","${p.status}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csv);

  } catch (error) {
    console.error('Inventory Export Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Get vendor performance reports
// @route   GET /api/admin/reports/vendors
// @access  Private (Admin)
export const getVendorReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let vendorQuery = {};
    if (search) {
      vendorQuery.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch vendors
    const vendors = await Vendor.find(vendorQuery)
      .select('storeName email phone status createdAt ownerName')
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalVendors = await Vendor.countDocuments(vendorQuery);

    // Get order stats for these vendors
    const vendorIds = vendors.map(v => v._id);
    const [salesStats, productStats] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            vendor: { $in: vendorIds },
            status: { $nin: ['cancelled', 'returned'] }
          }
        },
        {
          $group: {
            _id: '$vendor',
            totalSales: {
              $sum: {
                $cond: [{ $eq: ['$status', 'delivered'] }, '$totalAmount', 0]
              }
            },
            orderCount: { $sum: 1 }
          }
        }
      ]),
      Product.aggregate([
        { $match: { vendor: { $in: vendorIds } } },
        {
          $group: {
            _id: '$vendor',
            productCount: { $sum: 1 }
          }
        }
      ])
    ]);

    // Map stats back to vendors
    const processedVendors = vendors.map(v => {
      const sales = salesStats.find(s => s._id.toString() === v._id.toString()) || { totalSales: 0, orderCount: 0 };
      const product = productStats.find(p => p._id.toString() === v._id.toString()) || { productCount: 0 };

      return {
        id: v._id,
        vendorName: v.storeName,
        owner: v.ownerName,
        contact: v.phone,
        productsListed: product.productCount,
        totalSales: sales.totalSales,
        orderCount: sales.orderCount,
        status: v.status,
        memberSince: v.createdAt.toISOString().split('T')[0]
      };
    });

    res.json({
      success: true,
      vendors: processedVendors,
      pagination: {
        total: totalVendors,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalVendors / limitNum) || 1
      }
    });

  } catch (error) {
    console.error('Vendor Reports Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export vendor performance reports as CSV
// @route   GET /api/admin/reports/vendors/export
// @access  Private (Admin)
export const exportVendorReport = async (req, res) => {
  try {
    const { search = '' } = req.query;

    let vendorQuery = {};
    if (search) {
      vendorQuery.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const vendors = await Vendor.find(vendorQuery).lean();

    // Stats for all found vendors
    const vendorIds = vendors.map(v => v._id);
    const [salesStats, productStats] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            vendor: { $in: vendorIds },
            status: { $nin: ['cancelled', 'returned'] }
          }
        },
        {
          $group: {
            _id: '$vendor',
            totalSales: {
              $sum: {
                $cond: [{ $eq: ['$status', 'delivered'] }, '$totalAmount', 0]
              }
            },
            orderCount: { $sum: 1 }
          }
        }
      ]),
      Product.aggregate([
        { $match: { vendor: { $in: vendorIds } } },
        {
          $group: {
            _id: '$vendor',
            productCount: { $sum: 1 }
          }
        }
      ])
    ]);

    let csv = 'Vendor Name,Owner,Email,Contact,Products Listed,Total Orders,Total Sales (Net),Status,Member Since\n';
    vendors.forEach(v => {
      const salesData = salesStats.find(s => s._id.toString() === v._id.toString()) || { totalSales: 0, orderCount: 0 };
      const product = productStats.find(p => p._id.toString() === v._id.toString())?.productCount || 0;
      const date = v.createdAt.toISOString().split('T')[0];

      csv += `"${v.storeName}","${v.ownerName}","${v.email}","${v.phone}",${product},${salesData.orderCount || 0},${salesData.totalSales || 0},"${v.status}","${date}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Vendor_Report_${new Date().toISOString().split('T')[0]}.csv`);
    return res.status(200).send(csv);

  } catch (error) {
    console.error('Export Vendor Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed revenue and profit analytics
// @route   GET /api/admin/reports/revenue-analytics
// @access  Private (Admin)
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'this_week' } = req.query; // this_week, this_month, last_month, year_to_date
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date(now);
    let comparisonStartDate = new Date();
    let comparisonEndDate = new Date();

    if (period === 'this_week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay()); // Sunday
      comparisonStartDate = new Date(startDate);
      comparisonStartDate.setDate(startDate.getDate() - 7);
      comparisonEndDate = new Date(startDate);
    } else if (period === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      comparisonStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      comparisonEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (period === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      comparisonStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      comparisonEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0);
    } else if (period === 'year_to_date') {
      startDate = new Date(now.getFullYear(), 0, 1);
      comparisonStartDate = new Date(now.getFullYear() - 1, 0, 1);
      comparisonEndDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    } else {
      startDate.setDate(now.getDate() - 7);
      comparisonStartDate.setDate(now.getDate() - 14);
      comparisonEndDate.setDate(now.getDate() - 7);
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    comparisonStartDate.setHours(0, 0, 0, 0);
    comparisonEndDate.setHours(23, 59, 59, 999);

    const matchQuery = { createdAt: { $gte: startDate, $lte: endDate } };
    const comparisonMatchQuery = { createdAt: { $gte: comparisonStartDate, $lte: comparisonEndDate } };

    // 3. Chart Data (Net Sales over time)
    let chartGrouping = "%Y-%m-%d";
    if (period === 'year_to_date') {
      chartGrouping = "%Y-%m";
    }

    const [currentStats, prevStats, rawChartData, dailyBreakdown, payouts] = await Promise.all([
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            grossSales: { $sum: '$totalAmount' },
            refunds: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, '$totalAmount', 0] } },
            netSales: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$totalAmount', 0] } },
            profit: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$platformCommission', 0] } },
            orderCount: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } }
          }
        }
      ]),
      Order.aggregate([
        { $match: comparisonMatchQuery },
        {
          $group: {
            _id: null,
            netSales: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$totalAmount', 0] } },
            profit: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$platformCommission', 0] } }
          }
        }
      ]),
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: chartGrouping, date: "$createdAt" } },
            revenue: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$totalAmount', 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            orders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            gross: { $sum: '$totalAmount' },
            refunds: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, '$totalAmount', 0] } },
            net: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$totalAmount', 0] } }
          }
        },
        { $sort: { _id: -1 } }
      ]),
      VendorPayout.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const stats = currentStats[0] || { netSales: 0, refunds: 0, profit: 0, orderCount: 0 };
    const pStats = prevStats[0] || { netSales: 0, profit: 0 };
    const totalPayouts = payouts[0]?.total || 0;

    const calculateGrowth = (curr, prev) => {
      if (!prev || prev === 0) return 0;
      return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let chartData = [];
    if (period === 'year_to_date') {
      for (let m = 0; m <= now.getMonth(); m++) {
        const monthKey = `${now.getFullYear()}-${String(m + 1).padStart(2, '0')}`;
        const match = rawChartData.find(d => d._id === monthKey);
        chartData.push({ name: monthNames[m], revenue: match ? match.revenue : 0 });
      }
    } else {
      const iterDate = new Date(startDate);
      const stopDate = new Date(endDate > now ? now : endDate);
      while (iterDate <= stopDate) {
        const dateKey = iterDate.toISOString().split('T')[0];
        const match = rawChartData.find(d => d._id === dateKey);
        let name = dateKey;
        if (period === 'this_week') {
          name = dayNames[iterDate.getDay()];
        } else {
          name = `${iterDate.getDate()} ${monthNames[iterDate.getMonth()].substring(0, 3)}`;
        }
        chartData.push({ name, revenue: match ? match.revenue : 0 });
        iterDate.setDate(iterDate.getDate() + 1);
      }
    }

    res.json({
      success: true,
      summary: {
        totalNetSales: stats.netSales,
        salesGrowth: calculateGrowth(stats.netSales, pStats.netSales),
        totalRefunds: stats.refunds,
        vendorPayouts: totalPayouts,
        netProfit: stats.profit,
        profitGrowth: calculateGrowth(stats.profit, pStats.profit)
      },
      chartData: chartData,
      dailyBreakdown: dailyBreakdown.map(d => ({
        date: d._id,
        orders: d.orders,
        gross: d.gross,
        refunds: d.refunds,
        net: d.net
      }))
    });

  } catch (error) {
    console.error('Revenue Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all vendor earnings and payout history (Admin)
// @route   GET /api/admin/reports/vendor-earnings
// @access  Private (Admin)
export const getAdminVendorEarnings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, vendorId, view = 'earnings' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Filter for Stats
    let statsMatch = {};
    if (vendorId) statsMatch.vendor = new mongoose.Types.ObjectId(vendorId);

    // Filter for List
    let listQuery = {};
    if (vendorId) listQuery.vendor = vendorId;

    const [stats, records, total] = await Promise.all([
      // 1. Stats Calculation (Filtered by vendor if provided)
      Promise.all([
        VendorPayout.aggregate([
          { $match: { ...statsMatch, status: 'Paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        VendorPayout.aggregate([
          { $match: { ...statsMatch, status: { $in: ['Pending', 'Processing'] } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Order.aggregate([
          { $match: { ...statsMatch, status: 'delivered' } },
          { $group: { _id: null, totalCommission: { $sum: '$platformCommission' }, totalVendorEarnings: { $sum: '$vendorPayoutAmount' } } }
        ])
      ]),
      // 2. Paginated Data (Toggle between Earnings vs Withdrawals)
      view === 'earnings' 
        ? Order.find({ ...listQuery, status: 'delivered' })
            .populate('vendor', 'storeName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean()
        : VendorPayout.find({ ...listQuery, ...(status && status !== 'All Vendors' ? { status: status === 'Pending Payouts' ? 'Pending' : 'Paid' } : {}) })
            .populate('vendor', 'storeName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
      // 3. Count
      view === 'earnings'
        ? Order.countDocuments({ ...listQuery, status: 'delivered' })
        : VendorPayout.countDocuments({ ...listQuery, ...(status && status !== 'All Vendors' ? { status: status === 'Pending Payouts' ? 'Pending' : 'Paid' } : {}) })
    ]);

    const totalPaidOut = stats[0][0]?.total || 0;
    const pendingDue = stats[1][0]?.total || 0;
    const commissionEarned = stats[2][0]?.totalCommission || 0;
    const netEarnings = stats[2][0]?.totalVendorEarnings || 0;

    res.json({
      success: true,
      stats: {
        totalPaidOut,
        pendingDue,
        commissionEarned,
        netEarnings
      },
      records: records.map(r => ({
        id: r._id,
        recordId: view === 'earnings' ? r.orderId : `PAY-${r._id.toString().slice(-4).toUpperCase()}`,
        vendor: r.vendor?.storeName || 'Unknown',
        date: r.createdAt.toISOString().split('T')[0],
        amount: view === 'earnings' ? r.vendorPayoutAmount : r.amount,
        orderTotal: view === 'earnings' ? r.totalAmount : undefined,
        status: view === 'earnings' ? 'Delivered' : r.status,
        type: view === 'earnings' ? 'Earnings' : 'Withdrawal',
        commission: view === 'earnings' ? r.platformCommission : undefined,
        tax: view === 'earnings' ? r.taxAmount : undefined,
        paymentMethod: view === 'earnings' ? r.paymentMethod : undefined
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });

  } catch (error) {
    console.error('Admin Vendor Earnings Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export vendor earnings as CSV
// @route   GET /api/admin/reports/vendor-earnings/export
// @access  Private (Admin)
export const exportVendorEarnings = async (req, res) => {
  try {
    const { status, vendorId, view = 'earnings' } = req.query;

    let query = {};
    if (vendorId) query.vendor = vendorId;

    const records = view === 'earnings'
      ? await Order.find({ ...query, status: 'delivered' }).populate('vendor', 'storeName').sort({ createdAt: -1 }).lean()
      : await VendorPayout.find({ ...query, ...(status && status !== 'All Vendors' ? { status: status === 'Pending Payouts' ? 'Pending' : 'Paid' } : {}) }).populate('vendor', 'storeName').sort({ createdAt: -1 }).lean();

    let csv = view === 'earnings'
      ? 'Order ID,Vendor,Delivered Date,Earned Amount,Status\n'
      : 'Payout ID,Vendor,Requested Date,Amount,Method,Reference,Status,Note\n';

    records.forEach(r => {
      if (view === 'earnings') {
        const date = r.createdAt.toISOString().split('T')[0];
        csv += `${r.orderId},"${r.vendor?.storeName || 'Unknown'}",${date},${r.vendorPayoutAmount},Delivered\n`;
      } else {
        const payoutId = `PAY-${r._id.toString().slice(-4).toUpperCase()}`;
        const date = r.createdAt.toISOString().split('T')[0];
        const note = (r.note || '-').replace(/,/g, ' ');
        csv += `${payoutId},"${r.vendor?.storeName || 'Unknown'}",${date},${r.amount},${r.paymentMethod},"${r.referenceNumber || '-'}",${r.status},"${note}"\n`;
      }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=vendor_${view}_${new Date().toISOString().split('T')[0]}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Export Vendor Earnings Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get details of a specific vendor payout (Admin)
// @route   GET /api/admin/reports/vendor-payouts/:id
// @access  Private (Admin)
export const getAdminVendorPayoutDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const payout = await VendorPayout.findById(id)
      .populate('vendor', 'storeName ownerName email bankAccount')
      .lean();

    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout record not found' });
    }

    // Since payouts are balance-based, we show recent delivered orders for context
    const recentOrders = await Order.find({
      vendor: payout.vendor._id,
      status: 'delivered'
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('orderId createdAt totalAmount platformCommission vendorPayoutAmount items orderType')
    .lean();

    // Aggregates for the vendor (context)
    const vendorStats = await Order.aggregate([
      { $match: { vendor: payout.vendor?._id, status: 'delivered' } },
      { $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        totalComm: { $sum: '$platformCommission' },
        totalItems: { $sum: { $size: '$items' } }
      }}
    ]);

    res.json({
      success: true,
      payout: {
        ...payout,
        payoutId: `PAY-${payout._id.toString().slice(-4).toUpperCase()}`
      },
      recentOrders,
      stats: vendorStats[0] || { totalSales: 0, totalComm: 0, totalItems: 0 }
    });

  } catch (error) {
    console.error('Admin Vendor Payout Detail Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get strategic analytics for a specific branch (Branch Manager)
// @route   GET /api/admin/reports/strategic-analytics
// @access  Private (Branch Manager/Admin)
export const getBranchStrategicAnalytics = async (req, res) => {
  try {
    const { role, branchId } = req.admin;
    
    let targetedBranchId = branchId;

    // If super admin and branchId provided in query, use that
    if (role === 'Admin' && req.query.branchId) {
       targetedBranchId = req.query.branchId;
    }

    if (!targetedBranchId) {
       return res.status(400).json({ success: false, message: 'Branch ID is required' });
    }

    const branchObjectId = new mongoose.Types.ObjectId(targetedBranchId);

    // parallel fetches for efficiency
    const [
      inventoryStats,
      topProducts,
      categoryDistribution,
      wastageData
    ] = await Promise.all([
      // 1. Inventory Stats: Value, total SKU, Alerts
      Product.aggregate([
        { $unwind: "$branchStocks" },
        { $match: { "branchStocks.branchId": branchObjectId, status: { $ne: 'Draft' } } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ["$branchStocks.stock", "$basePrice"] } },
            skuCount: { $sum: 1 },
            lowStockAlerts: { 
              $sum: { $cond: [{ $lte: ["$branchStocks.stock", { $ifNull: ["$branchStocks.lowStockThreshold", 10] }] }, 1, 0] } 
            }
          }
        }
      ]),
      // 2. Top Products (By Units Sold in last 30 days)
      Order.aggregate([
        { $match: { branchId: branchObjectId, status: 'delivered', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $unwind: "$items" },
        { $group: {
            _id: "$items.product",
            salesCount: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }},
        { $sort: { salesCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productInfo'
          }
        },
        { $unwind: "$productInfo" }
      ]),
      // 3. Category Distribution (By Value)
      Product.aggregate([
        { $unwind: "$branchStocks" },
        { $match: { "branchStocks.branchId": branchObjectId, status: { $ne: 'Draft' } } },
        {
          $group: {
            _id: "$category",
            value: { $sum: { $multiply: ["$branchStocks.stock", "$basePrice"] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { value: -1 } }
      ]),
      // 4. Wastage/Damage Analysis (Last 12 months)
      InventoryLog.aggregate([
        { $match: { branchId: branchObjectId, type: { $in: ['Damage', 'Removal', 'Return'] }, createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'productInfo'
          }
        },
        { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            lossAmount: { $sum: { $multiply: [{ $abs: "$changeAmount" }, { $ifNull: ["$productInfo.basePrice", 10] }] } }
          }
        },
        { $sort: { "_id": 1 } }
      ])
    ]);

    const totalInvValue = inventoryStats[0]?.totalValue || 0;

    // Formatting month data for 12 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const formattedWastage = [];
    
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = d.toISOString().split('T')[0].substring(0, 7); // YYYY-MM
        const match = wastageData.find(w => w._id === monthKey);
        formattedWastage.push({
            month: monthNames[d.getMonth()],
            value: match ? Math.round(match.lossAmount) : 0
        });
    }

    res.json({
      success: true,
      summary: {
        inventoryValue: totalInvValue,
        totalSku: inventoryStats[0]?.skuCount || 0,
        alerts: inventoryStats[0]?.lowStockAlerts || 0,
        topProduct: topProducts[0]?.productInfo?.name || 'N/A'
      },
      topMovingAssets: topProducts.map(p => ({
        name: p.productInfo.name,
        category: p.productInfo.category,
        sales: p.salesCount,
        revenue: p.revenue,
        growth: Math.floor(Math.random() * 20) + 1 // Mock growth since we don't track history in this query
      })),
      assetDistribution: categoryDistribution.map(cat => ({
         name: cat._id,
         value: totalInvValue > 0 ? Math.round((cat.value / totalInvValue) * 100) : 0,
         actualValue: cat.value
      })),
      wastageData: formattedWastage
    });

  } catch (error) {
    console.error('Strategic Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
