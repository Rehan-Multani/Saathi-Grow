import mongoose from 'mongoose';
import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';
import CampaignSection from '../models/CampaignSection.js';
import Branch from '../models/Branch.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import Brand from '../models/Brand.js';
import { generateProductDescription, generateProductTags, analyzeSearchQuery } from '../utils/aiService.js';
import QRCode from 'qrcode';
import { sendPushNotification } from '../services/notificationService.js';

// Helper to determine status based on total stock
const determineProductStatus = (branchStocks, vendorStock = null, vendorThreshold = null) => {
  let totalStock = 0;
  let totalThreshold = 0;

  if (vendorStock !== null) {
    const normalizedStock = Number(vendorStock);
    const normalizedThreshold = Number(vendorThreshold);
    totalStock = Number.isFinite(normalizedStock) ? normalizedStock : 0;
    totalThreshold = Number.isFinite(normalizedThreshold) ? normalizedThreshold : 10;
  } else {
    if (!branchStocks || branchStocks.length === 0) return 'Draft';
    totalStock = branchStocks.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
    totalThreshold = branchStocks.reduce((sum, item) => sum + (Number(item.lowStockThreshold) || 0), 0);
  }

  if (totalStock <= 0) return 'Out of Stock';
  if (totalStock <= totalThreshold) return 'Low Stock';
  return 'Active';
};

// Helper to escape regex special characters
const escapeRegExp = (string) => {
  if (!string) return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Build a bounded, literal search regex to avoid malformed/expensive patterns.
const buildSafeSearchRegex = (value, maxLen = 80) => {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim().slice(0, maxLen);
  if (!normalized) return null;
  return new RegExp(escapeRegExp(normalized), 'i');
};

// Helper to handle comma-separated strings or arrays
const parseParam = (val) => {
  if (!val) return null;
  if (Array.isArray(val)) return val;
  return val.split(',').map(s => s.trim());
};

// Help parse status list which we specifically send as arrays/comma-lists
const parseStatus = (val) => {
  if (!val) return [];
  const arr = Array.isArray(val) ? val : val.split(',');
  return arr.map(s => s.trim()).filter(Boolean);
};

// @desc    Get AI suggestions for product description and tags
// @route   POST /api/admin/products/ai-suggestions
// @access  Private (Admin/Staff)
export const getAISuggestions = async (req, res) => {
  try {
    const { productName, type } = req.body;
    console.log(`Received AI suggestion request for: ${productName}, type: ${type}`);

    if (!productName) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    let suggestion = '';

    if (type === 'description') {
      suggestion = await generateProductDescription(productName);
    } else if (type === 'tags') {
      suggestion = await generateProductTags(productName);
    } else {
      return res.status(400).json({ message: 'Invalid suggestion type' });
    }

    res.json({ suggestion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private (Admin/Staff)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      tags,
      basePrice,
      branchStocks, // Expected: [{ branchId, stock, lowStockThreshold }]
      unitType,
      physicalLocation,
      category,
      brandName,
      isAllBranches,
      specificBranches,
      sku,
      status,
      vendor,
      stock,
      lowStockThreshold,
      mrp,
      isVeg,
      variants,
      unitValue,
      isSaathiGrow
    } = req.body;

    const productExists = await Product.findOne({ sku });
    if (productExists) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    let image = '';
    let gallery = [];
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        image = req.files.image[0].path;
      }
      if (req.files.gallery) {
        gallery = req.files.gallery.map(file => file.path);
      }
    }

    // Parse branchStocks if it's sent as a string (from FormData)
    let parsedBranchStocks = branchStocks;
    if (typeof branchStocks === 'string') {
      try {
        parsedBranchStocks = JSON.parse(branchStocks);
      } catch (e) {
        parsedBranchStocks = [];
      }
    }

    const normalizedVendorStock = Number.isFinite(Number(stock)) ? Number(stock) : 0;
    const normalizedVendorThreshold = Number.isFinite(Number(lowStockThreshold)) ? Number(lowStockThreshold) : 10;

    // Determine initial status if not Draft
    let finalStatus = status || 'Active';
    if (finalStatus !== 'Draft') {
      if (vendor) {
        finalStatus = determineProductStatus([], req.body.stock || 0, req.body.lowStockThreshold || 10);
      } else {
        finalStatus = determineProductStatus(parsedBranchStocks);
      }
    }

    // Generate QR Code from SKU
    const qrCodeDataUrl = await QRCode.toDataURL(sku, {
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      margin: 1
    });

    const product = await Product.create({
      name,
      description,
      tags: typeof tags === 'string' ? tags.split(',') : tags,
      basePrice,
      branchStocks: parsedBranchStocks,
      unitType: unitType || 'pcs',
      unitValue: Number(unitValue) || 1,
      physicalLocation,
      category,
      brandName,
      isAllBranches: isAllBranches === 'true' || isAllBranches === true,
      specificBranches: typeof specificBranches === 'string'
        ? specificBranches.split(',').map(s => s.trim()).filter(Boolean)
        : (specificBranches || []).filter(Boolean),
      sku,
      qrCode: qrCodeDataUrl,
      status: finalStatus,
      image,
      gallery,
      vendor: vendor || null,
      mrp: Number(mrp) || Number(basePrice),
      isVeg: isVeg === 'true' || isVeg === true,
      variants: typeof variants === 'string' ? JSON.parse(variants) : (variants || []),
      isSaathiGrow: isSaathiGrow === 'true' || isSaathiGrow === true,
      stock: vendor ? normalizedVendorStock : 0,
      lowStockThreshold: vendor ? normalizedVendorThreshold : 10,
      createdBy: req.admin._id
    });

    // Create Initial Inventory Logs for each branch
    if (parsedBranchStocks && parsedBranchStocks.length > 0) {
      const logs = parsedBranchStocks.map(item => ({
        product: product._id,
        admin: req.admin._id,
        branchId: item.branchId,
        changeAmount: item.stock,
        previousStock: 0,
        newStock: item.stock,
        type: 'Addition',
        reason: 'Initial Product Creation'
      }));
      await InventoryLog.insertMany(logs);
    }

    if (vendor) {
      await InventoryLog.create({
        product: product._id,
        admin: req.admin._id,
        vendorId: vendor,
        changeAmount: normalizedVendorStock,
        previousStock: 0,
        newStock: normalizedVendorStock,
        type: 'Addition',
        reason: 'Initial Product Creation'
      });
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Public (Enhanced with filtering)
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      search,
      status,
      brand,
      minPrice,
      maxPrice,
      isVeg,
      sort = '-createdAt',
      page = 1,
      limit = 20,
      campaignId,
      source, // 'vendor' | 'branch' | '' (all)
      storeId,
      storeType
    } = req.query;

    // Sanitize storeId (handle stringified 'null' or 'undefined' from frontend)
    const effectiveStoreId = (storeId && storeId !== 'null' && storeId !== 'undefined') ? storeId : null;
    let effectiveStoreObjectId = null;
    if (effectiveStoreId) {
      try {
        effectiveStoreObjectId = new mongoose.Types.ObjectId(effectiveStoreId);
      } catch (e) {
        console.error('Invalid storeId format:', effectiveStoreId);
      }
    }

    // Build query object
    let query = {};

    // 1. Store Status & Context Validation (Production Level Security)
    // If not admin/vendor, exclude products from inactive sources
    if (!req.admin && !req.vendor) {
      if (effectiveStoreId && storeType) {
        // Verify current selected store status
        if (storeType === 'branch') {
          const branch = await Branch.findById(effectiveStoreId).select('isActive');
          if (!branch || !branch.isActive) {
            return res.json({ products: [], total: 0, pages: 0, message: 'Selected store is currently inactive' });
          }
        } else if (storeType === 'vendor') {
          const v = await mongoose.model('Vendor').findById(effectiveStoreId).select('status');
          if (!v || v.status !== 'Active') {
            return res.json({ products: [], total: 0, pages: 0, message: 'Selected vendor is currently inactive' });
          }
        }
      }

      // Globally exclude inactive vendors from all public listings
      const inactiveVendors = await mongoose.model('Vendor').find({ status: { $ne: 'Active' } }).distinct('_id');
      if (inactiveVendors.length > 0) {
        query.vendor = { $nin: inactiveVendors };
      }
    }

    // Campaign filtering
    if (campaignId) {
      const campaign = await CampaignSection.findById(campaignId);
      if (campaign) {
        const productIds = (campaign.products || []).map(p => p.productId).filter(id => id);
        query._id = { $in: productIds };
      } else {
        return res.json({ products: [], total: 0, pages: 0 });
      }
    }

    // Offer filtering
    if (req.query.offerId) {
      const OfferDeal = mongoose.model('OfferDeal');
      const offer = await OfferDeal.findById(req.query.offerId);
      if (offer) {
        const productIds = (offer.products || []).map(p => p.productId).filter(id => id);
        query._id = { $in: productIds };
      } else {
        return res.json({ products: [], total: 0, pages: 0 });
      }
    }

    // Status filtering
    if (status) {
      const statusList = parseStatus(status);
      if (req.admin && req.admin.role !== 'Admin' && req.admin.branchId) {
        const statusOr = [];
        if (statusList.includes('Out of Stock')) {
          statusOr.push({ branchStocks: { $elemMatch: { branchId: req.admin.branchId, stock: { $lte: 0 } } } });
        }
        if (statusList.includes('Low Stock')) {
          statusOr.push({ branchStocks: { $elemMatch: { branchId: req.admin.branchId, stock: { $gt: 0, $lte: 10 } } } });
        }
        if (statusList.includes('Active')) {
          statusOr.push({ branchStocks: { $elemMatch: { branchId: req.admin.branchId, stock: { $gt: 10 } } } });
        }
        if (statusList.includes('Draft')) {
          statusOr.push({ status: 'Draft' });
        }
        if (statusOr.length > 0) {
          query.$and = query.$and || [];
          query.$and.push({ $or: statusOr });
        }
      } else {
        // For public users, even if they request 'Active', we show out of stock items
        // to support the 'Out of Stock' display logic.
        if (!req.admin && statusList.length === 1 && statusList[0] === 'Active') {
          query.status = { $in: ['Active', 'Out of Stock', 'Low Stock'] };
        } else {
          query.status = { $in: statusList };
        }
      }
    } else if (!req.admin) {
      query.status = { $in: ['Active', 'Out of Stock', 'Low Stock'] };
    }

    if (category) {
      const categoryList = Array.isArray(category) ? category : [category];
      // Build a regex that matches if ANY of the category keywords match 
      // This helps with typos like "Breakast" vs "Breakfast"
      const categoryRegexes = categoryList.map(cat => {
        const words = cat.trim().split(/[\s&\-_]+/).filter(w => w.length > 2);
        if (words.length > 0) {
          return new RegExp(words.map(w => escapeRegExp(w)).join('|'), 'i');
        }
        return new RegExp(escapeRegExp(cat.trim()), 'i');
      });
      query.category = { $in: categoryRegexes };
    }

    if (subCategory) {
      const subCategoryList = Array.isArray(subCategory) ? subCategory : [subCategory];
      query.subCategory = { $in: subCategoryList.map(s => new RegExp(escapeRegExp(s.trim()), 'i')) };
    }

    if (brand) {
      const brandList = Array.isArray(brand) ? brand : brand.split(',').map(s => s.trim());
      // Create exact match regex for each brand with escaping
      query.brandName = {
        $in: brandList.map(b => new RegExp(`^${escapeRegExp(b)}$`, 'i'))
      };
    }

    if (isVeg !== undefined) {
      query.isVeg = isVeg === 'true';
    }

    // Price filtering
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    if (search) {
      const safeSearchRegex = buildSafeSearchRegex(search);
      if (!safeSearchRegex) {
        return res.status(400).json({ message: 'Invalid search query' });
      }

      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: safeSearchRegex } },
          { description: { $regex: safeSearchRegex } },
          { tags: { $in: [safeSearchRegex] } }
        ]
      });
    }

    // Source filtering: vendor products vs branch products
    if (source === 'vendor') {
      query.vendor = { $exists: true, $ne: null };
    } else if (source === 'branch') {
      query.vendor = { $in: [null, undefined] };
    }

    // 2. Branch/Store Scoping Filter (Database Level)
    // Priority 1: Auth-based scoping (req.admin/req.vendor)
    if (req.admin && req.admin.role !== 'Admin' && req.admin.branchId) {
      query['branchStocks.branchId'] = req.admin.branchId;
    } else if (req.vendor) {
      query.vendor = req.vendor._id;
    }
    // Priority 2: Explicit parameter scoping (for POS/Admin requests)
    // For Public User Frontend (req.admin/req.vendor is null), we DON'T hard-filter by storeId
    // to allow global visibility with store-specific status flags.
    else if ((req.admin || req.vendor) && effectiveStoreId) {
      if (storeType === 'branch') {
        query['branchStocks.branchId'] = effectiveStoreId;
      } else if (storeType === 'vendor') {
        query.vendor = effectiveStoreId;
      }
    }

    // Pagination logic
    const skip = (Number(page) - 1) * Number(limit);

    console.log("DEBUG: getProducts query:", JSON.stringify(query));
    console.log("DEBUG: req.vendor:", req.vendor ? req.vendor._id : null);

    const total = await Product.countDocuments(query);

    // Build Sort Object: Prioritize Saathi Grow, then apply user sort
    let sortObj = { isSaathiGrow: -1 };
    if (sort) {
      if (typeof sort === 'string') {
        const parts = sort.split(' ');
        parts.forEach(p => {
          const field = p.startsWith('-') ? p.substring(1) : p;
          const order = p.startsWith('-') ? -1 : 1;
          sortObj[field] = order;
        });
      }
    } else {
      sortObj.createdAt = -1;
    }

    let productQuery = Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    // If it's a public/user request (no admin/vendor), select only necessary fields
    if (!req.admin && !req.vendor) {
      productQuery = productQuery.select('name image description basePrice mrp category status brandName unitType unitValue isVeg sku branchStocks vendor stock lowStockThreshold averageRating ratingCount');
    }

    let products = await productQuery
      .populate('branchStocks.branchId', 'name code logo phone email address')
      .populate('vendor', 'storeName logo businessType phone email address')
      .lean();

    // Store-Aware logic: Inject isDeliverable flag and specific stock info
    if (effectiveStoreId && storeType) {
      products = products.map(p => {
        const pObj = p.toObject ? p.toObject() : p;
        let isDeliverable = false;
        let availableStock = 0;
        let lowStockThreshold = 10;
        let inStore = false;

        if (storeType === 'branch') {
          // Check if product is in stock at this branch
          const branchStock = pObj.branchStocks?.find(bs => {
            const bId = bs.branchId?._id || bs.branchId;
            return bId && bId.toString() === effectiveStoreId.toString();
          });
          if (branchStock) {
            inStore = true;
            availableStock = branchStock.stock || 0;
            lowStockThreshold = branchStock.lowStockThreshold || 10;
            // Deliverable if stock > 0
            if (availableStock > 0) {
              isDeliverable = true;
            }
          }
        } else if (storeType === 'vendor') {
          // Check if product belongs to this vendor
          const vId = pObj.vendor?._id || pObj.vendor;
          if (vId && vId.toString() === effectiveStoreId.toString()) {
            inStore = true;
            availableStock = pObj.stock || 0;
            lowStockThreshold = pObj.lowStockThreshold || 10;
            if (availableStock > 0) {
              isDeliverable = true;
            }
          }
        }

        return { ...pObj, isDeliverable, availableStock, lowStockThreshold, inStore };
      });
    }

    // If Branch Manager/Staff, transform products to only show their branch details and local status
    if (req.admin && req.admin.role !== 'Admin' && req.admin.branchId) {
      products = products.map(p => {
        const pObj = p.toObject ? p.toObject() : p;
        pObj.branchStocks = pObj.branchStocks.filter(bs => {
          const bsBranchId = bs.branchId?._id || bs.branchId;
          return bsBranchId && bsBranchId.toString() === req.admin.branchId.toString();
        });
        if (pObj.status !== 'Draft') {
          if (pObj.vendor) {
            pObj.status = determineProductStatus([], pObj.stock, pObj.lowStockThreshold);
          } else {
            pObj.status = determineProductStatus(pObj.branchStocks);
          }
        }
        return pObj;
      });
    }

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Smart Search (AI-Powered)
// @route   GET /api/admin/products/search/ai
// @access  Public
export const searchProductsWithAI = async (req, res) => {
  try {
    const { q, storeId, storeType } = req.query;
    const effectiveStoreId = (storeId && storeId !== 'null' && storeId !== 'undefined') ? storeId : null;
    if (!q) {
      return res.json([]);
    }

    let searchKeywords = [];

    // Attempt AI Analysis to extract ingredients/components
    try {
      const aiResponse = await analyzeSearchQuery(q);
      if (aiResponse) {
        // Strip out any weird characters and split by comma
        const cleaned = aiResponse.replace(/[^a-zA-Z0-9,\s]/g, '');
        searchKeywords = cleaned.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
      }
    } catch (aiError) {
      console.error('[AI-SEARCH] Failed to analyze query, falling back to standard search:', aiError.message);
    }

    // Always include the original query's words as base keywords to ensure direct matches work too
    const originalWords = q.split(' ').map(s => s.trim().toLowerCase()).filter(s => s);
    searchKeywords = [...new Set([...searchKeywords, ...originalWords])];

    // Filter out common short noise words to prevent false-positive substring matches
    const stopWords = ['is', 'ki', 'ka', 'ke', 'ko', 'me', 'se', 'the', 'a', 'an', 'and', 'for', 'with', 'in', 'of', 'to', 'on'];
    searchKeywords = searchKeywords.filter(k => !stopWords.includes(k) && k.length > 1);

    if (searchKeywords.length === 0 && q) {
      searchKeywords = [q.toLowerCase()];
    }

    console.log(`[SMART-SEARCH] Keywords for "${q}":`, searchKeywords);

    // Build a single Regex pattern for all keywords
    const searchPattern = searchKeywords.map(k => {
      // Escape special characters so they don't break regex
      const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // For very short words (<= 3 chars like "dal", "oil"), enforce word boundaries 
      // so "dal" doesn't accidentally match "pedal" or "oil" doesn't match "spoil"
      if (escaped.length <= 3) {
        return `\\b${escaped}\\b`;
      }

      // For longer words, allow partial matching
      return escaped;
    }).join('|');

    const combinedRegex = new RegExp(searchPattern, 'i');

    // Find products matching the combined pattern in name, tags, or description
    const searchQuery = {
      status: { $in: ['Active', 'Out of Stock', 'Low Stock'] },
      $or: [
        { name: { $regex: combinedRegex } },
        { tags: { $regex: combinedRegex } },
        { description: { $regex: combinedRegex } },
        { brandName: { $regex: combinedRegex } },
        { category: { $regex: combinedRegex } }
      ]
    };

    // 2. Branch/Store Scoping Filter (Database Level)
    if (req.admin && req.admin.role !== 'Admin' && req.admin.branchId) {
      searchQuery['branchStocks.branchId'] = req.admin.branchId;
    } else if (req.vendor) {
      searchQuery.vendor = req.vendor._id;
    } else if ((req.admin || req.vendor) && effectiveStoreId) {
      if (storeType === 'branch') {
        searchQuery['branchStocks.branchId'] = effectiveStoreId;
      } else if (storeType === 'vendor') {
        searchQuery.vendor = effectiveStoreId;
      }
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(searchQuery);

    let products = await Product.find(searchQuery)
      .select('name image description basePrice mrp category status brandName unitType unitValue isVeg sku branchStocks vendor stock lowStockThreshold averageRating ratingCount')
      .populate('branchStocks.branchId', 'name code logo phone email address')
      .populate('vendor', 'storeName logo businessType phone email address')
      .sort({ isSaathiGrow: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Store-Aware logic for search results
    if (effectiveStoreId && storeType) {
      products = products.map(p => {
        const pObj = p.toObject ? p.toObject() : p;
        let isDeliverable = false;
        let availableStock = 0;
        let lowStockThreshold = 10;
        let inStore = false;

        if (storeType === 'branch') {
          const branchStock = pObj.branchStocks?.find(bs => {
            const bId = bs.branchId?._id || bs.branchId;
            return bId && bId.toString() === effectiveStoreId.toString();
          });
          if (branchStock) {
            inStore = true;
            availableStock = branchStock.stock || 0;
            lowStockThreshold = branchStock.lowStockThreshold || 10;
            if (availableStock > 0) {
              isDeliverable = true;
            }
          }
        } else if (storeType === 'vendor') {
          const vId = pObj.vendor?._id || pObj.vendor;
          if (vId && vId.toString() === effectiveStoreId.toString()) {
            inStore = true;
            availableStock = pObj.stock || 0;
            lowStockThreshold = pObj.lowStockThreshold || 10;
            if (availableStock > 0) {
              isDeliverable = true;
            }
          }
        }

        return { ...pObj, isDeliverable, availableStock, lowStockThreshold, inStore };
      });
    }

    // If Branch Manager/Staff, transform products to only show their branch details and local status
    if (req.admin && req.admin.role !== 'Admin' && req.admin.branchId) {
      products = products.map(p => {
        const pObj = p.toObject ? p.toObject() : p;
        pObj.branchStocks = pObj.branchStocks.filter(bs => {
          const bsBranchId = bs.branchId?._id || bs.branchId;
          return bsBranchId && bsBranchId.toString() === req.admin.branchId.toString();
        });
        if (pObj.status !== 'Draft') {
          if (pObj.vendor) {
            pObj.status = determineProductStatus([], pObj.stock, pObj.lowStockThreshold);
          } else {
            pObj.status = determineProductStatus(pObj.branchStocks);
          }
        }
        return pObj;
      });
    }

    res.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/admin/products/:id
// @access  Private (Admin/Staff)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('branchStocks.branchId', 'name code logo phone email address')
      .populate('vendor', 'storeName logo businessType phone email address');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const pObj = product.toObject();

    // Store-Aware logic for single product view
    const { storeId, storeType } = req.query;
    const effectiveStoreId = (storeId && storeId !== 'null' && storeId !== 'undefined') ? storeId : null;
    if (effectiveStoreId && storeType) {
      // Security Check: Verify store status before returning store-specific stock
      if (storeType === 'branch') {
        const branch = await Branch.findById(effectiveStoreId).select('isActive');
        if (!branch || !branch.isActive) {
          return res.status(403).json({ message: 'This store is currently inactive' });
        }
      } else {
        const v = await mongoose.model('Vendor').findById(effectiveStoreId).select('status');
        if (!v || v.status !== 'Active') {
          return res.status(403).json({ message: 'This vendor is currently inactive' });
        }
      }

      let isDeliverable = false;
      let availableStock = 0;
      let lowStockThreshold = 10;
      let inStore = false;

      if (storeType === 'branch') {
        const branchStock = pObj.branchStocks?.find(bs => {
          const bId = bs.branchId?._id || bs.branchId;
          return bId && bId.toString() === effectiveStoreId.toString();
        });
        if (branchStock) {
          inStore = true;
          availableStock = branchStock.stock || 0;
          lowStockThreshold = branchStock.lowStockThreshold || 10;
          if (availableStock > 0) {
            isDeliverable = true;
          }
        }
      } else if (storeType === 'vendor') {
        const vId = pObj.vendor?._id || pObj.vendor;
        if (vId && vId.toString() === effectiveStoreId.toString()) {
          inStore = true;
          availableStock = pObj.stock || 0;
          lowStockThreshold = pObj.lowStockThreshold || 10;
          if (availableStock > 0) {
            isDeliverable = true;
          }
        }
      }
      pObj.isDeliverable = isDeliverable;
      pObj.availableStock = availableStock;
      pObj.lowStockThreshold = lowStockThreshold;
      pObj.maxAllowed = Math.max(0, availableStock - lowStockThreshold);
      pObj.inStore = inStore;

      // Enrich sourceInfo
      if (storeType === 'branch') {
        const targetBranch = pObj.branchStocks?.find(bs => (bs.branchId?._id || bs.branchId)?.toString() === effectiveStoreId.toString());
        if (targetBranch) {
          pObj.sourceInfo = {
            type: 'Branch',
            name: targetBranch.branchId?.name,
            logo: targetBranch.branchId?.logo,
            code: targetBranch.branchId?.code,
            phone: targetBranch.branchId?.phone,
            email: targetBranch.branchId?.email,
            address: targetBranch.branchId?.address
          };
        }
      } else if (storeType === 'vendor' && pObj.vendor) {
        pObj.sourceInfo = {
          type: 'Vendor',
          name: pObj.vendor.storeName,
          logo: pObj.vendor.logo,
          phone: pObj.vendor.phone,
          email: pObj.vendor.email,
          address: pObj.vendor.address
        };
      }
    }

    // Enrich Brand Info
    if (pObj.brandName) {
      const brandDoc = await Brand.findOne({ name: new RegExp(`^${escapeRegExp(pObj.brandName)}$`, 'i') }).lean();
      if (brandDoc) {
        pObj.brandInfo = {
          name: brandDoc.name,
          logo: brandDoc.logo,
          description: brandDoc.description
        };
      }
    }

    res.json(pObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private (Admin/Staff)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Restriction: Admin/Staff/Store Managers cannot edit vendor products via this controller
      if (product.vendor) {
        return res.status(403).json({ message: 'Only vendors can manage their own products. Admin/Staff editing is restricted for vendor partners.' });
      }

      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      if (req.body.tags) {
        product.tags = typeof req.body.tags === 'string' ? req.body.tags.split(',') : req.body.tags;
      }
      
      const oldPrice = product.basePrice;
      product.basePrice = req.body.basePrice || product.basePrice;

      // Price Drop Notification
      if (oldPrice > 0 && product.basePrice < oldPrice) {
        const interestedUsers = await User.find({ wishlist: product._id });
        for (const user of interestedUsers) {
          sendPushNotification(user._id, 'User', {
            title: 'Price Drop Alert! 📉',
            body: `Great news! ${product.name} in your wishlist is now available at a lower price: ₹${product.basePrice}`
          }, { productId: product._id.toString(), type: 'price_drop' });
        }
      }

      product.unitType = req.body.unitType || product.unitType;
      product.unitValue = req.body.unitValue !== undefined ? Number(req.body.unitValue) : product.unitValue;
      product.physicalLocation = req.body.physicalLocation || product.physicalLocation;
      product.category = req.body.category || product.category;
      product.brandName = req.body.brandName || product.brandName;
      product.vendor = req.body.vendor !== undefined ? (req.body.vendor || null) : product.vendor;
      
      // Update vendor stock/threshold if it's a vendor product
      if (product.vendor) {
        if (req.body.stock !== undefined) product.stock = Number(req.body.stock);
        if (req.body.lowStockThreshold !== undefined) product.lowStockThreshold = Number(req.body.lowStockThreshold);
      }

      product.mrp = req.body.mrp !== undefined ? Number(req.body.mrp) : product.mrp;
      product.isVeg = req.body.isVeg !== undefined ? (req.body.isVeg === 'true' || req.body.isVeg === true) : product.isVeg;
      product.isSaathiGrow = req.body.isSaathiGrow !== undefined ? (req.body.isSaathiGrow === 'true' || req.body.isSaathiGrow === true) : product.isSaathiGrow;
      if (req.body.stock !== undefined) {
        const parsedStock = Number(req.body.stock);
        if (Number.isFinite(parsedStock)) {
          product.stock = parsedStock;
        }
      }
      if (req.body.lowStockThreshold !== undefined) {
        const parsedThreshold = Number(req.body.lowStockThreshold);
        if (Number.isFinite(parsedThreshold)) {
          product.lowStockThreshold = parsedThreshold;
        }
      }

      if (req.body.variants) {
        product.variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
      }

      if (req.body.sku && req.body.sku !== product.sku) {
        product.sku = req.body.sku;
        // Regenerate QR Code if SKU changed
        product.qrCode = await QRCode.toDataURL(product.sku, {
          color: { dark: '#000000', light: '#ffffff' },
          margin: 1
        });
      }

      if (req.body.isAllBranches !== undefined) {
        product.isAllBranches = req.body.isAllBranches === 'true' || req.body.isAllBranches === true;
      }
      if (req.body.specificBranches) {
        product.specificBranches = typeof req.body.specificBranches === 'string'
          ? req.body.specificBranches.split(',').map(s => s.trim()).filter(Boolean)
          : (req.body.specificBranches || []).filter(Boolean);
      }
      product.sku = req.body.sku || product.sku;

      // Handle Branch Stock Updates
      if (req.body.branchStocks) {
        let parsedBranchStocks = req.body.branchStocks;
        if (typeof req.body.branchStocks === 'string') {
          try {
            parsedBranchStocks = JSON.parse(req.body.branchStocks);
          } catch (e) {
            parsedBranchStocks = product.branchStocks;
          }
        }

        const newBranchIds = parsedBranchStocks.map(bs => bs.branchId.toString());

        // Remove branches that are no longer present
        product.branchStocks = product.branchStocks.filter(bs =>
          newBranchIds.includes(bs.branchId.toString())
        );

        // Update or Add branches
        for (const newBranchStock of parsedBranchStocks) {
          const existingIndex = product.branchStocks.findIndex(bs => bs.branchId.toString() === newBranchStock.branchId.toString());

          if (existingIndex !== -1) {
            const oldStock = product.branchStocks[existingIndex].stock;
            if (oldStock !== Number(newBranchStock.stock)) {
              await InventoryLog.create({
                product: product._id,
                admin: req.admin._id,
                branchId: newBranchStock.branchId,
                changeAmount: Number(newBranchStock.stock) - oldStock,
                previousStock: oldStock,
                newStock: newBranchStock.stock,
                type: Number(newBranchStock.stock) > oldStock ? 'Addition' : 'Deduction',
                reason: req.body.reason || 'Manual Update'
              });
            }
            product.branchStocks[existingIndex].stock = newBranchStock.stock;
            product.branchStocks[existingIndex].lowStockThreshold = newBranchStock.lowStockThreshold || product.branchStocks[existingIndex].lowStockThreshold;
          } else {
            // New branch added to product
            product.branchStocks.push(newBranchStock);
            await InventoryLog.create({
              product: product._id,
              admin: req.admin._id,
              branchId: newBranchStock.branchId,
              changeAmount: newBranchStock.stock,
              previousStock: 0,
              newStock: newBranchStock.stock,
              type: 'Addition',
              reason: 'New Branch Added'
            });
          }
        }

        // Keep specificBranches and isAllBranches in sync with branchStocks
        product.specificBranches = newBranchIds;
      }

      if (product.vendor && req.body.stock !== undefined && Number.isFinite(Number(req.body.stock)) && Number(req.body.stock) !== previousVendorStock) {
        await InventoryLog.create({
          product: product._id,
          admin: req.admin._id,
          vendorId: product.vendor,
          changeAmount: Number(req.body.stock) - previousVendorStock,
          previousStock: previousVendorStock,
          newStock: Number(req.body.stock),
          type: Number(req.body.stock) > previousVendorStock ? 'Addition' : 'Deduction',
          reason: req.body.reason || 'Manual Update'
        });
      }

      // Automatically update status if it's not Draft
      if (product.status !== 'Draft') {
        if (product.vendor) {
          product.status = determineProductStatus([], product.stock, product.lowStockThreshold);
        } else {
          product.status = determineProductStatus(product.branchStocks);
        }
      } else if (req.body.status && req.body.status !== 'Draft') {
        if (product.vendor) {
          product.status = determineProductStatus([], product.stock, product.lowStockThreshold);
        } else {
          product.status = determineProductStatus(product.branchStocks);
        }
      } else if (req.body.status === 'Draft') {
        product.status = 'Draft';
      }

      if (req.files) {
        if (req.files.image && req.files.image[0]) {
          product.image = req.files.image[0].path;
        }
        if (req.files.gallery) {
          const newGalleryPaths = req.files.gallery.map(file => file.path);
          // If we want to append or replace: let's replace for now or append if provided
          // Usually in edit, we might want to keep old ones, but if new ones are uploaded via 'gallery' field, 
          // we might want to either replace or append. Let's append for now to be safe, 
          // or replace if the user intends to reset. 
          // Given typical behavior, let's replace if gallery files are present.
          product.gallery = newGalleryPaths;
        }
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Adjust inventory (Restock/Audit) for a specific branch
// @route   POST /api/admin/products/:id/inventory
// @access  Private (Admin/Staff)
export const adjustInventory = async (req, res) => {
  try {
    const { branchId, amount, type, reason, storeType } = req.body;
    let finalBranchId = branchId;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Restriction: Any admin portal user cannot adjust inventory for vendor products
    if (product.vendor) {
      return res.status(403).json({ message: 'Vendor product inventory is managed exclusively by the vendor. Admin/Staff access is restricted.' });
    }

    // 1. Handle Vendor Products (Direct Stock)
    if (product.vendor && (!branchId || branchId === 'vendor')) {
      const previousStock = product.stock || 0;
      let newStock = previousStock;

      if (type === 'Addition' || type === 'Return') {
        newStock += Number(amount);
      } else if (type === 'Deduction' || type === 'Sale' || type === 'Damage') {
        newStock -= Number(amount);
      } else if (type === 'Audit') {
        newStock = Number(amount);
      } else {
        return res.status(400).json({ message: 'Invalid adjustment type' });
      }

      if (newStock < 0) {
        return res.status(400).json({ message: 'Stock cannot be negative' });
      }

      product.stock = newStock;
      if (product.status !== 'Draft') {
        product.status = determineProductStatus([], product.stock, product.lowStockThreshold);
      }
      await product.save();

      const log = await InventoryLog.create({
        product: product._id,
        admin: req.admin._id,
        vendorId: product.vendor,
        changeAmount: type === 'Audit' ? newStock - previousStock : (type === 'Addition' || type === 'Return' ? amount : -amount),
        previousStock,
        newStock,
        type,
        reason: reason || 'Inventory Adjustment (Vendor Direct)'
      });

      return res.json({ product, log });
    }

    // 2. Handle Branch Products
    // Security check: Staff and Branch Managers can ONLY adjust their own branch's inventory
    if (req.admin.role !== 'Admin') {
      if (!req.admin.branchId) {
        return res.status(403).json({ message: 'You are not assigned to any branch. Cannot adjust inventory.' });
      }

      // If they provided a branchId, it MUST match their assigned branch
      if (branchId && branchId.toString() !== req.admin.branchId.toString()) {
        return res.status(403).json({ message: 'You can only adjust inventory for your own branch.' });
      }

      finalBranchId = req.admin.branchId;
    }

    if (!finalBranchId) {
      return res.status(400).json({ message: 'Branch ID is required for inventory adjustment' });
    }

    const branchStockIndex = product.branchStocks.findIndex(bs => bs.branchId.toString() === finalBranchId.toString());

    if (branchStockIndex === -1) {
      // Branch not found in product stocks, add it
      const previousStock = 0;
      let newStock = amount;

      product.branchStocks.push({
        branchId: finalBranchId,
        stock: newStock,
        lowStockThreshold: 10
      });

      if (product.status !== 'Draft') {
        product.status = determineProductStatus(product.branchStocks);
      }
      await product.save();

      const log = await InventoryLog.create({
        product: product._id,
        admin: req.admin._id,
        branchId: finalBranchId,
        changeAmount: amount,
        previousStock,
        newStock,
        type,
        reason: reason || 'Inventory Adjustment (New Branch)'
      });

      return res.json({ product, log });
    }

    const previousStock = product.branchStocks[branchStockIndex].stock;
    let newStock = previousStock;

    if (type === 'Addition' || type === 'Return') {
      newStock += Number(amount);
    } else if (type === 'Deduction' || type === 'Sale' || type === 'Damage') {
      newStock -= Number(amount);
    } else if (type === 'Audit') {
      newStock = Number(amount);
    } else {
      return res.status(400).json({ message: 'Invalid adjustment type' });
    }

    if (newStock < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    product.branchStocks[branchStockIndex].stock = newStock;
    if (product.status !== 'Draft') {
      product.status = determineProductStatus(product.branchStocks);
    }
    await product.save();

    const log = await InventoryLog.create({
      product: product._id,
      admin: req.admin._id,
      branchId: finalBranchId,
      changeAmount: type === 'Audit' ? newStock - previousStock : (type === 'Addition' || type === 'Return' ? amount : -amount),
      previousStock,
      newStock,
      type,
      reason: reason || 'Inventory Adjustment'
    });

    res.json({ product, log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk Adjust inventory
// @route   POST /api/admin/products/inventory/bulk-adjust
// @access  Private (Admin/Staff)
export const bulkAdjustInventory = async (req, res) => {
  try {
    const { adjustments, commonData } = req.body; // adjustments: [{ productId, branchId, amount }], commonData: { type, reason, notes }

    if (!adjustments || !Array.isArray(adjustments) || adjustments.length === 0) {
      return res.status(400).json({ message: 'Invalid adjustments data' });
    }

    const { type, reason, notes } = commonData || {};
    const finalReason = (reason || 'Inventory Adjustment') + (notes ? ` - ${notes}` : '');
    const results = [];

    for (const adj of adjustments) {
      const { productId, branchId, amount } = adj;
      const product = await Product.findById(productId);
      
      if (!product) continue;
      
      // Skip vendor products
      if (product.vendor) continue;

      let finalBranchId = branchId;
      if (req.admin.role !== 'Admin') {
        if (!req.admin.branchId) continue;
        finalBranchId = req.admin.branchId;
      }

      if (!finalBranchId) continue;

      const branchStockIndex = product.branchStocks.findIndex(bs => bs.branchId.toString() === finalBranchId.toString());

      if (branchStockIndex === -1) {
        const previousStock = 0;
        let newStock = Number(amount);
        product.branchStocks.push({
          branchId: finalBranchId,
          stock: newStock,
          lowStockThreshold: 10
        });
        if (product.status !== 'Draft') {
          product.status = determineProductStatus(product.branchStocks);
        }
        await product.save();
        await InventoryLog.create({
          product: product._id,
          admin: req.admin._id,
          branchId: finalBranchId,
          changeAmount: amount,
          previousStock,
          newStock,
          type: type || 'Addition',
          reason: finalReason || 'Bulk Inventory Adjustment (New Branch)'
        });
      } else {
        const previousStock = product.branchStocks[branchStockIndex].stock;
        let newStock = previousStock;

        if (type === 'Addition' || type === 'Return') {
          newStock += Number(amount);
        } else if (type === 'Deduction' || type === 'Sale' || type === 'Damage') {
          newStock -= Number(amount);
        } else if (type === 'Audit') {
          newStock = Number(amount);
        } else {
          newStock += Number(amount); // Default to addition
        }

        if (newStock < 0) newStock = 0;

        product.branchStocks[branchStockIndex].stock = newStock;
        if (product.status !== 'Draft') {
          product.status = determineProductStatus(product.branchStocks);
        }
        await product.save();
        await InventoryLog.create({
          product: product._id,
          admin: req.admin._id,
          branchId: finalBranchId,
          changeAmount: type === 'Audit' ? newStock - previousStock : (type === 'Addition' || type === 'Return' ? amount : -amount),
          previousStock,
          newStock,
          type: type || 'Addition',
          reason: finalReason || 'Bulk Inventory Adjustment'
        });
      }
      results.push(productId);
    }

    res.json({ success: true, message: `Successfully adjusted ${results.length} products`, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inventory logs (Global)
// @route   GET /api/admin/products/inventory-logs
// @access  Private (Admin/Staff)
export const getAllInventoryLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.admin && req.admin.role !== 'Admin') {
      if (req.admin.branchId) {
        query.branchId = req.admin.branchId;
      } else {
        return res.json({ logs: [], total: 0, page, totalPages: 0 });
      }
    }

    const total = await InventoryLog.countDocuments(query);
    const logs = await InventoryLog.find(query)
      .select('product admin branchId vendorId changeAmount previousStock newStock type reason createdAt')
      .populate('product', 'name sku image')
      .populate('admin', 'name email')
      .populate('branchId', 'name code')
      .populate('vendorId', 'storeName logo')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      logs,
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

// @desc    Get inventory logs for a product
// @route   GET /api/admin/products/:id/inventory-logs
// @access  Private (Admin/Staff)
export const getInventoryLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { product: req.params.id };
    
    if (req.admin && req.admin.role !== 'Admin') {
      if (req.admin.branchId) {
        query.branchId = req.admin.branchId;
      } else {
        return res.json({ logs: [], total: 0 });
      }
    }

    const total = await InventoryLog.countDocuments(query);
    const logs = await InventoryLog.find(query)
      .select('admin branchId vendorId changeAmount previousStock newStock type reason createdAt')
      .populate('admin', 'name email')
      .populate('branchId', 'name code')
      .populate('vendorId', 'storeName logo')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.json({
      logs,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unique brand names
// @route   GET /api/admin/products/brands
// @access  Public
export const getUniqueBrands = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { status: 'Active' };

    if (category) {
      query.category = new RegExp(`^${escapeRegExp(category.trim())}$`, 'i');
    }

    const brands = await Product.distinct('brandName', query);
    res.json(brands.filter(Boolean).sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Restriction: Only Super Admins can delete vendor products. Other portal roles (Staff/Managers) are blocked.
    if (product.vendor && req.admin.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Only Super Admins or the vendor partner can delete this product.' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inventory analytical stats
// @route   GET /api/admin/products/inventory/stats
// @access  Private (Admin/Staff)
export const getInventoryStats = async (req, res) => {
  try {
    const { branchId, role } = req.admin;
    const targetBranchId = (role !== 'Admin') ? branchId : req.query.branchId;

    let matchQuery = {};
    if (targetBranchId && targetBranchId !== 'vendor' && mongoose.Types.ObjectId.isValid(targetBranchId)) {
      matchQuery['branchStocks.branchId'] = new mongoose.Types.ObjectId(targetBranchId);
    }

    // 1. Basic KPI Stats
    const statsResult = await Product.aggregate([
      { $match: { status: { $ne: 'Draft' } } },
      {
        $facet: {
          branchMetrics: [
            { $match: matchQuery },
            { $unwind: "$branchStocks" },
            {
              $match: (targetBranchId && targetBranchId !== 'vendor' && mongoose.Types.ObjectId.isValid(targetBranchId))
                ? { "branchStocks.branchId": new mongoose.Types.ObjectId(targetBranchId) }
                : {}
            },
            {
              $group: {
                _id: null,
                totalStock: { $sum: "$branchStocks.stock" },
                inventoryValue: { $sum: { $multiply: ["$branchStocks.stock", "$basePrice"] } },
                lowStockCount: {
                  $sum: {
                    $cond: [
                      { $and: [
                        { $gt: ["$branchStocks.stock", 0] },
                        { $lte: ["$branchStocks.stock", { $ifNull: ["$branchStocks.lowStockThreshold", 10] }] }
                      ]}, 1, 0]
                  }
                },
                outOfStockCount: {
                  $sum: { $cond: [{ $lte: ["$branchStocks.stock", 0] }, 1, 0] }
                }
              }
            }
          ],
          vendorMetrics: [
            { 
              $match: (targetBranchId && targetBranchId !== 'all') 
                ? { _id: null } // Skip if filtering by a specific branch
                : { vendor: { $exists: true, $ne: null } } 
            },
            {
              $group: {
                _id: null,
                totalStock: { $sum: "$stock" },
                inventoryValue: { $sum: { $multiply: ["$stock", "$basePrice"] } },
                lowStockCount: {
                  $sum: {
                    $cond: [
                      { $and: [
                        { $gt: ["$stock", 0] },
                        { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 10] }] }
                      ]}, 1, 0]
                  }
                },
                outOfStockCount: {
                  $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] }
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          totalStock: { $add: [{ $ifNull: [{ $arrayElemAt: ["$branchMetrics.totalStock", 0] }, 0] }, { $ifNull: [{ $arrayElemAt: ["$vendorMetrics.totalStock", 0] }, 0] }] },
          inventoryValue: { $add: [{ $ifNull: [{ $arrayElemAt: ["$branchMetrics.inventoryValue", 0] }, 0] }, { $ifNull: [{ $arrayElemAt: ["$vendorMetrics.inventoryValue", 0] }, 0] }] },
          lowStockCount: { $add: [{ $ifNull: [{ $arrayElemAt: ["$branchMetrics.lowStockCount", 0] }, 0] }, { $ifNull: [{ $arrayElemAt: ["$vendorMetrics.lowStockCount", 0] }, 0] }] },
          outOfStockCount: { $add: [{ $ifNull: [{ $arrayElemAt: ["$branchMetrics.outOfStockCount", 0] }, 0] }, { $ifNull: [{ $arrayElemAt: ["$vendorMetrics.outOfStockCount", 0] }, 0] }] }
        }
      }
    ]);

    const stats = statsResult[0] || { totalStock: 0, inventoryValue: 0, lowStockCount: 0, outOfStockCount: 0 };

    // 2. Category Distribution
    const categoryDistribution = await Product.aggregate([
      { $match: matchQuery },
      { $unwind: "$branchStocks" },
      {
        $match: (targetBranchId && targetBranchId !== 'vendor' && mongoose.Types.ObjectId.isValid(targetBranchId))
          ? { "branchStocks.branchId": new mongoose.Types.ObjectId(targetBranchId) } 
          : {}
      },
      {
        $group: {
          _id: "$category",
          stock: { $sum: "$branchStocks.stock" }
        }
      },
      { $sort: { stock: -1 } },
      { $limit: 10 }
    ]);

    // 3. Branch Health (If Super Admin)
    let branchHealth = [];
    if (!targetBranchId) {
      branchHealth = await Product.aggregate([
        { $unwind: "$branchStocks" },
        {
          $group: {
            _id: "$branchStocks.branchId",
            totalProducts: { $sum: 1 },
            lowStock: {
              $sum: { 
                $cond: [
                  { $and: [
                    { $gt: ["$branchStocks.stock", 0] },
                    { $lte: ["$branchStocks.stock", "$branchStocks.lowStockThreshold"] }
                  ]}, 1, 0] 
              }
            },
            outOfStock: {
              $sum: { $cond: [{ $lte: ["$branchStocks.stock", 0] }, 1, 0] }
            },
            totalStock: { $sum: "$branchStocks.stock" }
          }
        },
        {
          $lookup: {
            from: 'branches',
            localField: '_id',
            foreignField: '_id',
            as: 'branchInfo'
          }
        },
        { $unwind: "$branchInfo" },
        {
          $project: {
            name: "$branchInfo.name",
            code: "$branchInfo.branchCode",
            totalProducts: 1,
            lowStock: 1,
            outOfStock: 1,
            totalStock: 1,
            healthScore: {
              $subtract: [
                100, 
                { 
                  $multiply: [
                    { $divide: [{ $add: ["$lowStock", "$outOfStock"] }, "$totalProducts"] }, 
                    100
                  ] 
                }
              ]
            }
          }
        }
      ]);
    }

    // 4. Critical Items (Top 5 Low Stock)
    const criticalItems = await Product.aggregate([
        { $match: matchQuery },
        { $unwind: "$branchStocks" },
        {
          $match: (targetBranchId && targetBranchId !== 'vendor' && mongoose.Types.ObjectId.isValid(targetBranchId))
            ? { "branchStocks.branchId": new mongoose.Types.ObjectId(targetBranchId) } 
            : {}
        },
        { 
          $match: { 
            $expr: { $lte: ["$branchStocks.stock", "$branchStocks.lowStockThreshold"] } 
          } 
        }, 
        { $sort: { "branchStocks.stock": 1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'branches',
                localField: 'branchStocks.branchId',
                foreignField: '_id',
                as: 'branch'
            }
        },
        { $unwind: "$branch" },
        {
            $project: {
                name: 1,
                sku: 1,
                image: 1,
                stock: "$branchStocks.stock",
                threshold: "$branchStocks.lowStockThreshold",
                branchName: "$branch.name"
            }
        }
    ]);

    res.json({
      success: true,
      stats,
      categoryDistribution: categoryDistribution.map(c => ({ name: c._id, stock: c.stock })),
      branchHealth,
      criticalItems
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get branch-wise stock with filtering and pagination
// @route   GET /api/admin/products/inventory/branch-wise
// @access  Private (Admin/Staff)
export const getBranchWiseStock = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      branchId, 
      status, // 'Low Stock', 'Out of Stock', 'In Stock'
      category 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    let initialMatch = { vendor: { $exists: false } }; // Exclude vendor products as they don't have branchStocks

    // Aggregation Pipeline
    const pipeline = [
      { $match: initialMatch },
      { $unwind: "$branchStocks" }
    ];

    // Branch Scoping
    if (req.admin.role !== 'Admin' && req.admin.branchId) {
      pipeline.push({ $match: { "branchStocks.branchId": new mongoose.Types.ObjectId(req.admin.branchId) } });
    } else if (branchId && branchId !== 'vendor' && mongoose.Types.ObjectId.isValid(branchId)) {
      pipeline.push({ $match: { "branchStocks.branchId": new mongoose.Types.ObjectId(branchId) } });
    }

    // Status Filtering
    if (status) {
      if (status === 'Out of Stock') {
        pipeline.push({ $match: { "branchStocks.stock": { $lte: 0 } } });
      } else if (status === 'Low Stock') {
        pipeline.push({
            $match: {
                $expr: {
                    $and: [
                        { $gt: ["$branchStocks.stock", 0] },
                        { $lte: ["$branchStocks.stock", "$branchStocks.lowStockThreshold"] }
                    ]
                }
            }
        });
      } else if (status === 'In Stock') {
        pipeline.push({
            $match: {
                $expr: { $gt: ["$branchStocks.stock", "$branchStocks.lowStockThreshold"] }
            }
        });
      }
    }

    // Category Filtering
    if (category) {
      pipeline.push({ $match: { category: new RegExp(escapeRegExp(category), 'i') } });
    }

    // Search (Needs Branch Name too, so lookup first if searching by the name)
    pipeline.push({
      $lookup: {
        from: 'branches',
        localField: 'branchStocks.branchId',
        foreignField: '_id',
        as: 'branchInfo'
      }
    });
    pipeline.push({ $unwind: "$branchInfo" });

    if (search) {
      const escapedSearch = escapeRegExp(search);
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: escapedSearch, $options: 'i' } },
            { sku: { $regex: escapedSearch, $options: 'i' } },
            { "branchInfo.name": { $regex: escapedSearch, $options: 'i' } },
            { "branchInfo.branchCode": { $regex: escapedSearch, $options: 'i' } }
          ]
        }
      });
    }

    // Project only necessary fields
    pipeline.push({
      $project: {
        _id: 0,
        productId: "$_id",
        productName: "$name",
        sku: 1,
        image: 1,
        branchName: "$branchInfo.name",
        branchCode: "$branchInfo.code", // In Branch.js it is 'code', but in previous logs it was sometimes 'branchCode'
        branchId: "$branchStocks.branchId",
        stock: "$branchStocks.stock",
        lowStockThreshold: "$branchStocks.lowStockThreshold",
        status: {
          $cond: {
            if: { $lte: ["$branchStocks.stock", 0] },
            then: "Out of Stock",
            else: {
              $cond: {
                if: { $lte: ["$branchStocks.stock", "$branchStocks.lowStockThreshold"] },
                then: "Low Stock",
                else: "In Stock"
              }
            }
          }
        }
      }
    });

    // Sort: Lowest stock first for visibility
    pipeline.push({ $sort: { stock: 1, productName: 1 } });

    // Pagination via $facet
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limitNum }]
      }
    });

    const result = await Product.aggregate(pipeline);
    const total = result[0].metadata[0]?.total || 0;
    const data = result[0].data;

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get low stock alerts with filtering and pagination
// @route   GET /api/admin/products/inventory/low-stock
// @access  Private (Admin/Staff)
export const getLowStockAlerts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      branchId, 
      category,
      severity // 'Critical', 'Warning'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Initial Match: exclude Drafts
    const baseMatch = { status: { $ne: 'Draft' } };

    const pipeline = [
      {
        $facet: {
          internalStock: [
            { 
              $match: { 
                ...baseMatch, 
                vendor: { $exists: false } 
              } 
            },
            { $unwind: "$branchStocks" },
            { 
              $match: { 
                $expr: { $lte: ["$branchStocks.stock", "$branchStocks.lowStockThreshold"] } 
              } 
            },
            { 
              $lookup: {
                from: 'branches',
                localField: 'branchStocks.branchId',
                foreignField: '_id',
                as: 'branchInfo'
              }
            },
            { $unwind: "$branchInfo" },
            {
              $project: {
                productId: "$_id",
                productName: "$name",
                sku: 1,
                image: 1,
                category: 1,
                branchName: "$branchInfo.name",
                branchId: "$branchStocks.branchId",
                stock: "$branchStocks.stock",
                threshold: "$branchStocks.lowStockThreshold",
                isVendor: { $literal: false },
                severity: { $cond: [{ $lte: ["$branchStocks.stock", 0] }, "Critical", "Warning"] }
              }
            }
          ],
          vendorStock: [
            { 
              $match: { 
                ...baseMatch, 
                vendor: { $exists: true } 
              } 
            },
            { 
              $match: { 
                $expr: { $lte: ["$stock", "$lowStockThreshold"] } 
              } 
            },
            { 
              $lookup: {
                from: 'vendors',
                localField: 'vendor',
                foreignField: '_id',
                as: 'vendorInfo'
              }
            },
            { $unwind: "$vendorInfo" },
            {
              $project: {
                productId: "$_id",
                productName: "$name",
                sku: 1,
                image: 1,
                category: 1,
                branchName: "Vendor Managed",
                storeName: "$vendorInfo.storeName",
                stock: "$stock",
                threshold: "$lowStockThreshold",
                isVendor: { $literal: true },
                severity: { $cond: [{ $lte: ["$stock", 0] }, "Critical", "Warning"] }
              }
            }
          ]
        }
      },
      {
        $project: {
          combined: { $concatArrays: ["$internalStock", "$vendorStock"] }
        }
      },
      { $unwind: "$combined" },
      { $replaceRoot: { newRoot: "$combined" } }
    ];

    // Branch Scoping (Staff only see their own branch, omit vendor products for staff)
    if (req.admin.role !== 'Admin' && req.admin.branchId) {
      pipeline.push({ 
        $match: { 
            isVendor: false,
            branchId: new mongoose.Types.ObjectId(req.admin.branchId) 
        } 
      });
    } else if (branchId) {
        if (branchId === 'vendor') {
            pipeline.push({ $match: { isVendor: true } });
        } else if (mongoose.Types.ObjectId.isValid(branchId)) {
            pipeline.push({ 
                $match: { 
                    branchId: new mongoose.Types.ObjectId(branchId) 
                } 
            });
        }
    }

    // Category Filter
    if (category) {
      pipeline.push({ $match: { category: new RegExp(escapeRegExp(category), 'i') } });
    }

    // Severity Filter
    if (severity) {
      pipeline.push({ $match: { severity: severity } });
    }

    // Search
    if (search) {
      const escapedSearch = escapeRegExp(search);
      pipeline.push({
        $match: {
          $or: [
            { productName: { $regex: escapedSearch, $options: 'i' } },
            { sku: { $regex: escapedSearch, $options: 'i' } },
            { branchName: { $regex: escapedSearch, $options: 'i' } }
          ]
        }
      });
    }

    // Sort: Critical first, then stock ascending
    pipeline.push({ $sort: { stock: 1, productName: 1 } });

    // Pagination
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limitNum }]
      }
    });

    const result = await Product.aggregate(pipeline);
    const total = result[0]?.metadata[0]?.total || 0;
    const data = result[0]?.data || [];

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

