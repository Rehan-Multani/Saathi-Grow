import Product from '../models/Product.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Get products belonging to the logged-in vendor
// @route   GET /api/vendors/products
// @access  Private (Vendor)
export const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.vendor._id })
      .populate('category', 'name')
      .populate('brand', 'name')
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
    const { name, description, price, category, brand, sku, stock, unit } = req.body;

    // Logic to calculate initial stock across branches might be needed, 
    // but for now, we'll just create the product.

    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      sku,
      unit: unit || 'pcs',
      vendor: req.vendor._id,
      image: req.file ? req.file.path : '',
      status: 'Pending Approval', // Vendors products usually need admin approval
      createdBy: req.vendor._id // Can store ID here as well if we adjust model to allow Vendor ref or just store ID
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
      product.price = req.body.price || product.price;
      product.category = req.body.category || product.category;
      product.brand = req.body.brand || product.brand;
      product.unit = req.body.unit || product.unit;

      if (req.file) {
        product.image = req.file.path;
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
