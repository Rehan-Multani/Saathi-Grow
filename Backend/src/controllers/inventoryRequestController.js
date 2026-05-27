import InventoryUpdateRequest from '../models/InventoryUpdateRequest.js';
import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';
import mongoose from 'mongoose';
import { sendPushNotification, notifyByBranchAndPermission } from '../services/notificationService.js';
import { sendSystemNotificationEmail } from '../services/emailService.js';

// @desc    Store Manager requests inventory change
// @route   POST /api/inventory-requests
// @access  Private (Branch Manager)
export const createRequest = async (req, res) => {
  try {
    const { productId, currentStock, adjustment, type, notes } = req.body;

    const branchId = req.admin.branchId;
    if (!branchId) {
      return res.status(400).json({ message: 'No branch assigned to this manager' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.vendor) {
      return res.status(400).json({ message: 'Inventory requests are not allowed for vendor products. Please contact the vendor partner.' });
    }

    const amount = Number(adjustment);
    const newStock = type === 'add' ? currentStock + amount : Math.max(0, currentStock - amount);

    const request = await InventoryUpdateRequest.create({
      product: productId,
      branchId,
      managerId: req.admin._id,
      currentStock,
      requestedStock: newStock,
      adjustmentType: type,
      notes
    });

    res.status(201).json(request);

    // Notify Admins of the new inventory request
    await notifyByBranchAndPermission('MANAGE_INVENTORY', null, {
      title: 'New Inventory Request',
      body: `New request from ${req.admin.name} for ${product.name}. Adjustment: ${type} ${adjustment}`
    }, { type: 'inventory_request', requestId: request._id.toString() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inventory requests
// @route   GET /api/inventory-requests
// @access  Private (Admin, Branch Manager)
export const getRequests = async (req, res) => {
  try {
    let query = {};

    if (req.admin.role === 'Branch Manager' || req.admin.role === 'Staff' || req.admin.role === 'Store Manager') {
      query.branchId = req.admin.branchId;
    }

    const requests = await InventoryUpdateRequest.find(query)
      .populate('product', 'name sku image branchStocks')
      .populate('branchId', 'name')
      .populate('managerId', 'name email profileImage')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin approves request
// @route   PUT /api/inventory-requests/:id/approve
// @access  Private (Admin)
export const approveRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const request = await InventoryUpdateRequest.findById(id).session(session);

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'Pending') {
      throw new Error('Request has already been processed');
    }

    const product = await Product.findById(request.product).session(session);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.vendor) {
      throw new Error('Approval denied. This is a vendor product and cannot be updated via branch inventory requests.');
    }

    // Apply to specific branch
    const branchStockIndex = product.branchStocks.findIndex(
      bs => bs.branchId.toString() === request.branchId.toString()
    );

    let previousStock = 0;
    if (branchStockIndex >= 0) {
      previousStock = product.branchStocks[branchStockIndex].stock;
      product.branchStocks[branchStockIndex].stock = request.requestedStock;
    } else {
      product.branchStocks.push({
        branchId: request.branchId,
        stock: request.requestedStock
      });
    }

    await product.save({ session });

    // Create log
    await InventoryLog.create([{
      product: product._id,
      admin: request.managerId, // Changed by the request of this manager
      branchId: request.branchId,
      previousStock,
      newStock: request.requestedStock,
      changeAmount: Math.abs(request.requestedStock - previousStock),
      type: request.requestedStock > previousStock ? 'Addition' : 'Deduction',
      reason: `Approved Admin Request: ${request.notes}`
    }], { session });

    request.status = 'Approved';
    request.reviewedBy = req.admin._id;
    request.reviewedAt = new Date();
    await request.save({ session });

    await session.commitTransaction();
    res.json(request);

    // Notify Manager of Approval
    const manager = await mongoose.model('Admin').findById(request.managerId);
    if (manager) {
      const title = 'Inventory Request Approved';
      const body = `Your inventory request for ${product.name} has been approved. Stock updated.`;
      await sendPushNotification(manager._id, 'Staff', { title, body }, { type: 'inventory_update', status: 'Approved' });
    }
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Admin rejects request
// @route   PUT /api/inventory-requests/:id/reject
// @access  Private (Admin)
export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await InventoryUpdateRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = 'Rejected';
    request.reviewedBy = req.admin._id;
    request.reviewedAt = new Date();
    await request.save();

    res.json(request);

    // Notify Manager of Rejection
    const manager = await mongoose.model('Admin').findById(request.managerId);
    if (manager) {
      const title = 'Inventory Request Rejected';
      const body = `Your inventory request for product ID ${request.product} was rejected by admin.`;
      await sendPushNotification(manager._id, 'Staff', { title, body }, { type: 'inventory_update', status: 'Rejected' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
