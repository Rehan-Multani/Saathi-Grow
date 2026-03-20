import DemandRequest from '../models/DemandRequest.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { sendPushNotification, notifyByBranchAndPermission } from '../services/notificationService.js';

/**
 * @desc Create a new demand request
 * @route POST /api/demand
 * @access Public
 */
export const createDemandRequest = async (req, res) => {
  try {
    const { productId, storeId, storeType, location, requestType, contactInfo } = req.body;

    if (!productId || !requestType || !location?.coordinates) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newDemand = await DemandRequest.create({
      user: req.user?._id || null, // req.user comes from protect (optional)
      product: productId,
      store: storeId || null,
      storeModel: storeType === 'vendor' ? 'Vendor' : 'Branch',
      location: {
        type: 'Point',
        coordinates: location.coordinates, // [lng, lat]
        address: location.address
      },
      requestType,
      contactInfo: contactInfo || null
    });

    res.status(201).json({
      success: true,
      data: newDemand,
      message: 'Demand request recorded successfully. We will monitor this.'
    });

    // Notify Managers/Admins of new demand
    const product = await Product.findById(productId);
    const productName = product ? product.name : 'Unknown Product';
    
    if (requestType === 'OUT_OF_STOCK' && storeId) {
      // Notify specifically the store
      await sendPushNotification(storeId, storeType === 'vendor' ? 'Vendor' : 'Staff', {
        title: 'New Product Demand!',
        body: `A customer requested ${productName} which is out of stock in your store.`
      }, { type: 'demand_alert', productId: productId.toString(), requestType });
    } else {
      // Notify Admins for zone expansion
      await notifyByBranchAndPermission('MANAGE_STORES', null, {
        title: 'Out of Zone Demand',
        body: `A customer in ${location.address || 'Unknown'} requested ${productName}. Consider extending your zone.`
      }, { type: 'demand_alert', requestType });
    }
  } catch (error) {
    console.error('Create Demand Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all demand requests for admin with analytics
 * @route GET /api/admin/demand
 * @access Private (Admin)
 */
export const getDemandAnalytics = async (req, res) => {
  try {
    const { page = 1, limit = 50, requestType, storeId } = req.query;

    const query = {};
    if (requestType) query.requestType = requestType;
    if (storeId) query.store = storeId;

    const demands = await DemandRequest.find(query)
      .populate('product', 'name sku image basePrice')
      .populate('store', 'name storeName branchName')
      .populate('user', 'name phone')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await DemandRequest.countDocuments(query);

    // Grouping by product for top demand list
    const topDemandedProducts = await DemandRequest.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$product',
          count: { $sum: 1 },
          oosCount: { $sum: { $cond: [{ $eq: ['$requestType', 'OUT_OF_STOCK'] }, 1, 0] } },
          oozCount: { $sum: { $cond: [{ $eq: ['$requestType', 'OUT_OF_ZONE'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' }
    ]);

    // Grouping for heatmap data (Geo aggregations can be added here)
    const heatmapData = await DemandRequest.aggregate([
      { $match: query },
      {
        $project: {
          lat: { $arrayElemAt: ['$location.coordinates', 1] },
          lng: { $arrayElemAt: ['$location.coordinates', 0] },
          requestType: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: demands,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      },
      analytics: {
        topDemandedProducts,
        heatmapData
      }
    });
  } catch (error) {
    console.error('Get Demand Analytics Error:', error);
    res.status(500).json({ message: error.message });
  }
};
