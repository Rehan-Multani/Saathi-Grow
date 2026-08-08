import Product from '../models/Product.js';
import Branch from '../models/Branch.js';
import InventoryLog from '../models/InventoryLog.js';
import User from '../models/User.js';
import { cloudinary } from '../config/cloudinary.js';
import QRCode from 'qrcode';
import { generateProductDescription, generateProductTags } from '../utils/aiService.js';
import { sendPushNotification } from '../services/notificationService.js';
import { syncLocationAssignment } from './physicalLocationController.js';

// Helper to determine status based on stock
const determineProductStatus = (stock, threshold, existingStatus) => {
  if (existingStatus === 'Draft') return 'Draft';
  if (existingStatus === 'Rejected') return 'Rejected';

  if (Number(stock) <= 0) return 'Out of Stock';
  if (Number(stock) <= Number(threshold)) return 'Low Stock';
  return 'Active';
};

// @desc    Get AI suggestions for product description and tags
// @route   POST /api/vendors/products/ai-suggestions
// @access  Private (Vendor)
export const getVendorAISuggestions = async (req, res) => {
  try {
    const { productName, type } = req.body;

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

// @desc    Get products belonging to the logged-in vendor
// @route   GET /api/vendors/products
// @access  Private (Vendor)
export const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.vendor._id })
      .sort('-createdAt');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a product (vendor version)
// @route   POST /api/vendors/products
// @access  Private (Vendor)
export const addVendorProduct = async (req, res) => {
  try {
    let {
      name,
      description,
      basePrice,
      mrp,
      category,
      brandName,
      sku,
      unitType,
      unitValue,
      physicalLocation,
      tags,
      isVeg,
      stock,
      lowStockThreshold,
      variants,
      isSaathigro,
      status
    } = req.body;

    // Check if product with SKU already exists
    const productExists = await Product.findOne({ sku });
    if (productExists) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    // Generate QR Code from SKU
    const qrCodeDataUrl = await QRCode.toDataURL(sku, {
      color: { dark: '#000000', light: '#ffffff' },
      margin: 1
    });

    // Determine initial status - Vendor products are "Active" by default if listed
    let finalStatus = status || 'Active';
    if (finalStatus !== 'Draft') {
      finalStatus = determineProductStatus(stock, lowStockThreshold, finalStatus);
    }

    const product = await Product.create({
      name,
      description,
      basePrice: Number(basePrice),
      mrp: Number(mrp) || Number(basePrice),
      category,
      brandName,
      sku,
      unitType: unitType || 'pcs',
      unitValue: Number(unitValue) || 1,
      physicalLocation,
      isVeg: isVeg === 'true' || isVeg === true,
      vendor: req.vendor._id,
      image: req.files?.image ? req.files.image[0].path : '',
      gallery: req.files?.gallery ? req.files.gallery.map(f => f.path) : [],
      qrCode: qrCodeDataUrl,
      status: finalStatus,
      stock: Number(stock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 10,
      variants: typeof variants === 'string' ? JSON.parse(variants) : (variants || []),
      tags: typeof tags === 'string' ? tags.split(',') : (tags || []),
      isSaathigro: isSaathigro === 'true' || isSaathigro === true,
      createdByVendor: req.vendor._id
    });

    // Create Initial Inventory Log
    await InventoryLog.create({
      product: product._id,
      vendorId: req.vendor._id,
      changeAmount: product.stock,
      previousStock: 0,
      newStock: product.stock,
      type: 'Addition',
      reason: 'Vendor Product Creation'
    });

    // Sync physical location assignment
    if (physicalLocation) {
      await syncLocationAssignment({
        newLabel: physicalLocation,
        productId: product._id.toString(),
        branchId: null,
        vendorId: req.vendor._id.toString()
      });
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product (vendor version)
// @route   PUT /api/vendors/products/:id
// @access  Private (Vendor)
export const updateVendorProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendor: req.vendor._id });

    if (product) {
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      const oldPrice = product.basePrice;
      product.basePrice = req.body.basePrice ? Number(req.body.basePrice) : product.basePrice;

      // --- Production: Price Drop Notification ---
      if (product.basePrice < oldPrice) {
        const usersToNotify = await User.find({ wishlist: product._id });
        for (const user of usersToNotify) {
          sendPushNotification(user._id, 'User', {
            title: 'Price Drop Alert! 📉',
            body: `Great news! ${product.name} in your wishlist is now available at a lower price: ₹${product.basePrice}`
          }, { productId: product._id.toString(), type: 'price_drop' });
        }
      }

      product.mrp = req.body.mrp !== undefined ? Number(req.body.mrp) : product.mrp;
      product.category = req.body.category || product.category;
      if (req.body.brandName !== undefined) {
        product.brandName = String(req.body.brandName || '').trim();
      }
      product.unitType = req.body.unitType || product.unitType;
      product.unitValue = req.body.unitValue !== undefined ? Number(req.body.unitValue) : product.unitValue;
      product.physicalLocation = req.body.physicalLocation || product.physicalLocation;
      product.isVeg = req.body.isVeg !== undefined ? (req.body.isVeg === 'true' || req.body.isVeg === true) : product.isVeg;
      product.isSaathigro = req.body.isSaathigro !== undefined ? (req.body.isSaathigro === 'true' || req.body.isSaathigro === true) : product.isSaathigro;

      if (req.body.tags) {
        product.tags = typeof req.body.tags === 'string' ? req.body.tags.split(',') : req.body.tags;
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

      // Handle Stock Updates
      if (req.body.stock !== undefined && req.body.stock !== '') {
        const stockValue = Array.isArray(req.body.stock) ? req.body.stock[0] : req.body.stock;
        const newStock = Number(stockValue);
        const oldStock = Number(product.stock) || 0;

        if (!isNaN(newStock) && newStock !== oldStock) {
          await InventoryLog.create({
            product: product._id,
            vendorId: req.vendor._id,
            changeAmount: newStock - oldStock,
            previousStock: oldStock,
            newStock: newStock,
            type: newStock > oldStock ? 'Addition' : 'Deduction',
            reason: req.body.reason || 'Vendor Manual Update'
          });
          product.stock = newStock;
        }
      }

      if (req.body.lowStockThreshold !== undefined && req.body.lowStockThreshold !== '') {
        const thresholdValue = Array.isArray(req.body.lowStockThreshold) ? req.body.lowStockThreshold[0] : req.body.lowStockThreshold;
        const newThreshold = Number(thresholdValue);
        if (!isNaN(newThreshold)) {
          product.lowStockThreshold = newThreshold;
        }
      }

      // Handle Image and Gallery Updates
      if (req.files) {
        if (req.files.image && req.files.image[0]) {
          product.image = req.files.image[0].path;
        }
      }

      // Merge existing gallery with newly uploaded ones
      let finalGallery = [];
      if (req.body.existingGallery) {
        try {
          finalGallery = JSON.parse(req.body.existingGallery);
        } catch (e) {
          finalGallery = [];
        }
      }

      if (req.files?.gallery) {
        const newGalleryPaths = req.files.gallery.map(f => f.path);
        finalGallery = [...finalGallery, ...newGalleryPaths];
      }

      // If at least one of these was provided, update the gallery
      if (req.body.existingGallery || (req.files?.gallery && req.files.gallery.length > 0)) {
        product.gallery = finalGallery;
      }

      // Update overall status
      product.status = determineProductStatus(product.stock, product.lowStockThreshold, product.status);

      const updatedProduct = await product.save();

      // Sync physical location assignment
      await syncLocationAssignment({
        newLabel: updatedProduct.physicalLocation || null,
        productId: updatedProduct._id.toString(),
        branchId: null,
        vendorId: req.vendor._id.toString()
      });

      // --- Production Vendor Stock Alert ---
      if (updatedProduct.stock <= (updatedProduct.lowStockThreshold || 10)) {
        await sendPushNotification(req.vendor._id, 'Vendor', {
          title: 'Low Stock Alert!',
          body: `Inventory check: '${updatedProduct.name}' is currently low (${updatedProduct.stock} left).`
        }, { productId: updatedProduct._id.toString(), type: 'inventory_alert' });
      }

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found or not authorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update specialized stock for a product (vendor version)
// @route   PATCH /api/vendors/products/:id/stock
// @access  Private (Vendor)
export const updateVendorProductStock = async (req, res) => {
  try {
    const { stock, lowStockThreshold, reason } = req.body;
    const product = await Product.findOne({ _id: req.params.id, vendor: req.vendor._id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }

    const oldStock = Number(product.stock) || 0;
    const newStock = Number(stock);

    if (!isNaN(newStock) && newStock !== oldStock) {
      // Create Inventory Log
      await InventoryLog.create({
        product: product._id,
        vendorId: req.vendor._id,
        changeAmount: newStock - oldStock,
        previousStock: oldStock,
        newStock: newStock,
        type: newStock > oldStock ? 'Addition' : 'Deduction',
        reason: reason || 'Vendor Manual Stock Update'
      });
      product.stock = newStock;
    }

    if (lowStockThreshold !== undefined) {
      product.lowStockThreshold = Number(lowStockThreshold);
    }

    // Update overall status
    product.status = determineProductStatus(product.stock, product.lowStockThreshold, product.status);

    await product.save();

    // --- Production Vendor Stock Alert ---
    if (product.stock <= (product.lowStockThreshold || 10)) {
      await sendPushNotification(req.vendor._id, 'Vendor', {
        title: 'Low Stock Alert!',
        body: `Inventory update: '${product.name}' is now at low stock (${product.stock} units remaining).`
      }, { productId: product._id.toString(), type: 'inventory_alert' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product (vendor version)
// @route   DELETE /api/vendors/products/:id
// @access  Private (Vendor)
export const deleteVendorProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendor: req.vendor._id });
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found or not authorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
