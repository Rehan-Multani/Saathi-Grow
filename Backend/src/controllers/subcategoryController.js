import SubCategory from '../models/SubCategory.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

// Helper to escape regex special characters
const escapeRegExp = (string) => {
  if (!string) return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @desc    Create new subcategory
// @route   POST /api/admin/subcategories
// @access  Private (Admin)
export const createSubCategory = async (req, res) => {
  try {
    const { name, category, description, status, image } = req.body;

    // Check if parent category exists
    const parentCategory = await Category.findById(category);
    if (!parentCategory) {
      return res.status(404).json({ message: 'Parent category not found' });
    }

    const subCategoryExists = await SubCategory.findOne({ name, category });
    if (subCategoryExists) {
      return res.status(400).json({ message: 'Subcategory already exists in this category' });
    }

    let finalImage = image || '';
    if (req.file) {
      finalImage = req.file.path;
    }

    const subCategory = await SubCategory.create({
      name,
      category,
      categoryName: parentCategory.name,
      description,
      status: status || 'Active',
      image: finalImage,
      createdBy: req.admin._id
    });

    res.status(201).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all subcategories
// @route   GET /api/admin/subcategories
// @access  Public (Optional filtering)
export const getSubCategories = async (req, res) => {
  try {
    const { categoryId, categoryName, category, status } = req.query;
    let query = {};
    
    // Support categoryId, categoryName, or category (alias for name)
    if (categoryId) query.category = categoryId;
    
    const effectiveCategoryName = categoryName || category;
    if (effectiveCategoryName) {
      // Use exact match for category name to avoid cross-pollination of subcategories
      query.categoryName = { $regex: new RegExp('^' + escapeRegExp(effectiveCategoryName) + '$', 'i') };
    }
    
    if (status) query.status = status;

    const subCategories = await SubCategory.find(query)
      .populate('category', 'name slug')
      .sort('name'); // Sort by name for better UX

    res.json(subCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get subcategory by ID
// @route   GET /api/admin/subcategories/:id
// @access  Private (Admin/Staff)
export const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id)
      .populate('category', 'name slug');
      
    if (subCategory) {
      res.json(subCategory);
    } else {
      res.status(404).json({ message: 'Subcategory not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update subcategory
// @route   PUT /api/admin/subcategories/:id
// @access  Private (Admin)
export const updateSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);

    if (subCategory) {
      subCategory.name = req.body.name || subCategory.name;
      subCategory.description = req.body.description || subCategory.description;
      subCategory.status = req.body.status || subCategory.status;

      if (req.body.category) {
        const parentCategory = await Category.findById(req.body.category);
        if (parentCategory) {
          subCategory.category = req.body.category;
          subCategory.categoryName = parentCategory.name;
        }
      }

      if (req.file) {
        subCategory.image = req.file.path;
      } else if (req.body.image) {
        subCategory.image = req.body.image;
      }

      const updatedSubCategory = await subCategory.save();
      res.json(updatedSubCategory);
    } else {
      res.status(404).json({ message: 'Subcategory not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete subcategory
// @route   DELETE /api/admin/subcategories/:id
// @access  Private (Admin)
export const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);
    if (subCategory) {
      // Check if any products are using this subcategory name
      const productsCount = await Product.countDocuments({ subCategory: subCategory.name });
      if (productsCount > 0) {
        return res.status(400).json({ message: 'Cannot delete subcategory because products are linked to it' });
      }

      await subCategory.deleteOne();
      res.json({ message: 'Subcategory removed' });
    } else {
      res.status(404).json({ message: 'Subcategory not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
