import Product from '../models/Product.js';
import Branch from '../models/Branch.js';
import { cloudinary } from '../config/cloudinary.js';
import QRCode from 'qrcode';

// @desc    Get products belonging to the logged-in vendor
// @route   GET /api/vendors/products
// @access  Private (Vendor)
export const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.vendor._id })
      .populate('branchStocks.branchId', 'name')
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
    const {
      name,
      description,
      price,
      mrp,
      category,
      brand,
      sku,
      stock,
      unit,
      isVeg,
      variants,
      tags,
      unitValue
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

    // Initialize branch stocks for all active branches
    const activeBranches = await Branch.find({ isActive: true });
    const branchStocks = activeBranches.map(branch => ({
      branchId: branch._id,
      stock: Number(stock) || 0, // For now assigning initial stock to all branches or just first? 
      // Let's just put it in all branches for simplicity in this mvp, or just 0
      lowStockThreshold: 10
    }));

    const product = await Product.create({
      name,
      description,
      basePrice: Number(price),
      mrp: Number(mrp) || Number(price),
      category,
      brandName: brand,
      sku,
      unitType: unit || 'pcs',
      unitValue: Number(unitValue) || 1,
      isVeg: isVeg === 'true' || isVeg === true,
      vendor: req.vendor._id,
      image: req.files?.image ? req.files.image[0].path : '',
      gallery: req.files?.gallery ? req.files.gallery.map(f => f.path) : [],
      qrCode: qrCodeDataUrl,
      status: 'Pending Approval',
      branchStocks,
      variants: typeof variants === 'string' ? JSON.parse(variants) : variants,
      tags: typeof tags === 'string' ? tags.split(',') : tags,
    });

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
      product.basePrice = req.body.price ? Number(req.body.price) : product.basePrice;
      product.mrp = req.body.mrp ? Number(req.body.mrp) : product.mrp;
      product.category = req.body.category || product.category;
      product.brandName = req.body.brand || product.brandName;
      product.unitType = req.body.unit || product.unitType;
      product.unitValue = req.body.unitValue !== undefined ? Number(req.body.unitValue) : product.unitValue;
      product.isVeg = req.body.isVeg !== undefined ? (req.body.isVeg === 'true' || req.body.isVeg === true) : product.isVeg;

      if (req.body.variants) {
        product.variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
      }

      if (req.files) {
        if (req.files.image && req.files.image[0]) {
          product.image = req.files.image[0].path;
        }
        if (req.files.gallery) {
          product.gallery = req.files.gallery.map(f => f.path);
        }
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found or not authorized' });
    }
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
