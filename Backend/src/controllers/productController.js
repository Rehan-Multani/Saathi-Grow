import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';
import { generateProductDescription, generateProductTags } from '../utils/aiService.js';
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
      vendor
    } = req.body;

    const productExists = await Product.findOne({ sku });
    if (productExists) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    let image = '';
    if (req.file) {
      image = req.file.path;
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
      physicalLocation,
      category,
      brandName,
      isAllBranches: isAllBranches === 'true' || isAllBranches === true,
      specificBranches: typeof specificBranches === 'string' ? specificBranches.split(',') : specificBranches,
      sku,
      qrCode: qrCodeDataUrl,
      status: finalStatus,
      image,
      vendor: vendor || null,
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
// @access  Private (Admin/Staff)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('branchStocks.branchId', 'name code')
      .populate('vendor', 'storeName logo')
      .sort('-createdAt');
    res.json(products);
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
      product.physicalLocation = req.body.physicalLocation || product.physicalLocation;
      product.category = req.body.category || product.category;
      product.brandName = req.body.brandName || product.brandName;
      product.vendor = req.body.vendor !== undefined ? (req.body.vendor || null) : product.vendor;

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

      if (req.file) {
        product.image = req.file.path;
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
    const { amount, type, reason, branchId } = req.body;

    if (!branchId) {
      return res.status(400).json({ message: 'Branch ID is required for inventory adjustment' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const branchStockIndex = product.branchStocks.findIndex(bs => bs.branchId.toString() === branchId.toString());

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

