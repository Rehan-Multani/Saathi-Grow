import Product from '../models/Product.js';
import { generateProductDescription, generateProductTags } from '../utils/aiService.js';

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
      stockQuantity,
      physicalLocation,
      category,
      brandName,
      isAllBranches,
      specificBranches,
      sku,
      status
    } = req.body;

    const productExists = await Product.findOne({ sku });
    if (productExists) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    let image = '';
    if (req.file) {
      image = req.file.path;
    }

    const product = await Product.create({
      name,
      description,
      tags: typeof tags === 'string' ? tags.split(',') : tags,
      basePrice,
      stockQuantity,
      physicalLocation,
      category,
      brandName,
      isAllBranches: isAllBranches === 'true' || isAllBranches === true,
      specificBranches: typeof specificBranches === 'string' ? specificBranches.split(',') : specificBranches,
      sku,
      status: status || 'Active',
      image,
      createdBy: req.admin._id
    });

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
    const products = await Product.find({}).sort('-createdAt');
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
    const product = await Product.findById(req.params.id);
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
      product.stockQuantity = req.body.stockQuantity || product.stockQuantity;
      product.physicalLocation = req.body.physicalLocation || product.physicalLocation;
      product.category = req.body.category || product.category;
      product.brandName = req.body.brandName || product.brandName;
      if (req.body.isAllBranches !== undefined) {
        product.isAllBranches = req.body.isAllBranches === 'true' || req.body.isAllBranches === true;
      }
      if (req.body.specificBranches) {
        product.specificBranches = typeof req.body.specificBranches === 'string' ? req.body.specificBranches.split(',') : req.body.specificBranches;
      }
      product.sku = req.body.sku || product.sku;
      product.status = req.body.status || product.status;

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
