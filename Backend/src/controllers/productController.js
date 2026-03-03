import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';
import CampaignSection from '../models/CampaignSection.js';
import { generateProductDescription, generateProductTags, analyzeSearchQuery } from '../utils/aiService.js';
import QRCode from 'qrcode';

// Helper to determine status based on total stock
const determineProductStatus = (branchStocks) => {
  if (!branchStocks || branchStocks.length === 0) return 'Draft';

  const totalStock = branchStocks.reduce((sum, item) => sum + Number(item.stock || 0), 0);
  const totalThreshold = branchStocks.reduce((sum, item) => sum + Number(item.lowStockThreshold || 0), 0);

  if (totalStock <= 0) return 'Out of Stock';
  if (totalStock <= totalThreshold) return 'Low Stock';
  return 'Active';
};

// Helper to escape regex special characters
const escapeRegExp = (string) => {
  if (!string) return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
      mrp,
      isVeg,
      variants,
      unitValue
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

    // Determine initial status if not Draft
    let finalStatus = status || 'Active';
    if (finalStatus !== 'Draft') {
      finalStatus = determineProductStatus(parsedBranchStocks);
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
      specificBranches: typeof specificBranches === 'string' ? specificBranches.split(',') : specificBranches,
      sku,
      qrCode: qrCodeDataUrl,
      status: finalStatus,
      image,
      gallery,
      vendor: vendor || null,
      mrp: Number(mrp) || Number(basePrice),
      isVeg: isVeg === 'true' || isVeg === true,
      variants: typeof variants === 'string' ? JSON.parse(variants) : (variants || []),
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
      campaignId
    } = req.query;

    // Build query object
    let query = {};

    // Campaign filtering
    if (campaignId) {
      const campaign = await CampaignSection.findById(campaignId);
      if (campaign) {
        const productIds = campaign.products.map(p => p.productId);
        query._id = { $in: productIds };
      } else {
        return res.json({ products: [], total: 0, pages: 0 });
      }
    }

    // Status filtering
    if (status) {
      const statusList = parseStatus(status);
      query.status = { $in: statusList };
    } else if (!req.admin) {
      query.status = 'Active';
    }

    if (category) {
      const categoryList = Array.isArray(category) ? category : [category];
      query.category = { $in: categoryList.map(c => new RegExp(`^${escapeRegExp(c.trim())}$`, 'i')) };
    }

    if (subCategory) {
      const subCategoryList = Array.isArray(subCategory) ? subCategory : [subCategory];
      query.subCategory = { $in: subCategoryList.map(s => new RegExp(`^${escapeRegExp(s.trim())}$`, 'i')) };
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
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Branch Scoping
    if (req.admin && req.admin.role !== 'Admin') {
      if (req.admin.branchId) {
        query['branchStocks.branchId'] = req.admin.branchId;
      } else {
        return res.json({ products: [], total: 0, pages: 0 });
      }
    }

    // Pagination logic
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    let productQuery = Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // If it's a public/user request (no admin), select only necessary fields
    if (!req.admin) {
      productQuery = productQuery.select('name image basePrice mrp category status brandName unitType unitValue isVeg sku');
    }

    const products = await productQuery
      .populate('branchStocks.branchId', 'name code')
      .populate('vendor', 'storeName logo');

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
    const { q } = req.query;
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

    // Build Regex array for multiple keywords
    const regexArray = searchKeywords.map(k => {
      // Escape special characters so they don't break regex
      const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // For very short words (<= 3 chars like "dal", "oil"), enforce word boundaries 
      // so "dal" doesn't accidentally match "pedal" or "oil" doesn't match "spoil"
      if (escaped.length <= 3) {
        return new RegExp(`\\b${escaped}\\b`, 'i');
      }

      // For longer words, allow partial matching (e.g. "tomat" catches "tomato")
      return new RegExp(escaped, 'i');
    });

    // Find products matching ANY of the keywords in name, tags, or description
    // using $or combined with $in pattern matching
    const searchQuery = {
      status: 'Active',
      $or: [
        { name: { $in: regexArray } },
        { tags: { $in: regexArray } },
        { description: { $in: regexArray } },
        { brandName: { $in: regexArray } },
        { category: { $in: regexArray } }
      ]
    };

    // Branch Scoping for Search
    if (req.admin && req.admin.role !== 'Admin') {
      if (req.admin.branchId) {
        searchQuery['branchStocks.branchId'] = req.admin.branchId;
      } else {
        return res.json([]);
      }
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(searchQuery);

    const products = await Product.find(searchQuery)
      .select('name image basePrice mrp category status brandName unitType unitValue isVeg sku')
      .populate('vendor', 'storeName logo')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

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
      .populate('vendor', 'storeName logo');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
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
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      if (req.body.tags) {
        product.tags = typeof req.body.tags === 'string' ? req.body.tags.split(',') : req.body.tags;
      }
      product.basePrice = req.body.basePrice || product.basePrice;
      product.unitType = req.body.unitType || product.unitType;
      product.unitValue = req.body.unitValue !== undefined ? Number(req.body.unitValue) : product.unitValue;
      product.physicalLocation = req.body.physicalLocation || product.physicalLocation;
      product.category = req.body.category || product.category;
      product.brandName = req.body.brandName || product.brandName;
      product.vendor = req.body.vendor !== undefined ? (req.body.vendor || null) : product.vendor;
      product.mrp = req.body.mrp !== undefined ? Number(req.body.mrp) : product.mrp;
      product.isVeg = req.body.isVeg !== undefined ? (req.body.isVeg === 'true' || req.body.isVeg === true) : product.isVeg;

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
        product.specificBranches = typeof req.body.specificBranches === 'string' ? req.body.specificBranches.split(',') : req.body.specificBranches;
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

      // Automatically update status if it's not Draft
      if (product.status !== 'Draft') {
        product.status = determineProductStatus(product.branchStocks);
      } else if (req.body.status && req.body.status !== 'Draft') {
        product.status = determineProductStatus(product.branchStocks);
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
    const { branchId, amount, type, reason } = req.body;
    let finalBranchId = branchId;

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

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const branchStockIndex = product.branchStocks.findIndex(bs => bs.branchId.toString() === finalBranchId.toString());

    if (branchStockIndex === -1) {
      // Branch not found in product stocks, add it
      const previousStock = 0;
      let newStock = amount;

      product.branchStocks.push({
        branchId,
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
        branchId,
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
      branchId,
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

// @desc    Get all inventory logs (Global)
// @route   GET /api/admin/products/inventory-logs
// @access  Private (Admin/Staff)
export const getAllInventoryLogs = async (req, res) => {
  try {
    const logs = await InventoryLog.find({})
      .populate('product', 'name sku image')
      .populate('admin', 'name email')
      .populate('branchId', 'name code')
      .sort('-createdAt')
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inventory logs for a product
// @route   GET /api/admin/products/:id/inventory-logs
// @access  Private (Admin/Staff)
export const getInventoryLogs = async (req, res) => {
  try {
    const logs = await InventoryLog.find({ product: req.params.id })
      .populate('admin', 'name email')
      .populate('branchId', 'name code')
      .sort('-createdAt')
      .limit(50);
    res.json(logs);
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
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

