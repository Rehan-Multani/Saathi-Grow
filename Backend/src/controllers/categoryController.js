import Category from '../models/Category.js';
import Product from '../models/Product.js';
import SubCategory from '../models/SubCategory.js';

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private (Admin/Staff)
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, status, bgColor, tags } = req.body;

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    let image = '';
    if (req.file) {
      image = req.file.path;
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : String(tags || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

    const category = await Category.create({
      name,
      slug: slug || name.toLowerCase().split(' ').join('-'),
      description,
      tags: [...new Set(parsedTags)],
      status: status || 'Active',
      bgColor: bgColor || '#f8f9fa',
      image,
      createdBy: req.admin._id
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private (Admin/Staff)
export const getCategories = async (req, res) => {
  try {
    const { hasProducts, status, search, page, limit } = req.query;
    const hasPagination = page !== undefined || limit !== undefined;
    let query = {};
    if (status) query.status = { $regex: new RegExp('^' + status + '$', 'i') };
    if (search && String(search).trim()) {
      query.name = { $regex: String(search).trim(), $options: 'i' };
    }

    let categories = await Category.find(query)
      .select('name slug image bgColor status description tags')
      .sort('-createdAt');

    if (hasProducts === 'true') {
      // Find distinct category names that have available products efficiently using native distinct
      const activeCategoryNames = await Product.distinct('category', {
        status: { $in: ['Active', 'Low Stock', 'Out of Stock'] }
      });

      const activeCategoryNamesLower = activeCategoryNames.map(name => name.toLowerCase());

      // Filter categories to only include those in the active distinct list
      categories = categories.filter(category =>
        activeCategoryNamesLower.includes(category.name.toLowerCase())
      );
    }

    if (hasPagination) {
      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
      const total = categories.length;
      const totalPages = Math.ceil(total / limitNumber) || 1;
      const start = (pageNumber - 1) * limitNumber;
      const paginated = categories.slice(start, start + limitNumber);
      return res.json({
        categories: paginated,
        pagination: { total, page: pageNumber, limit: limitNumber, totalPages }
      });
    }

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get category by ID
// @route   GET /api/admin/categories/:id
// @access  Private (Admin/Staff)
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin/Staff)
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = req.body.name || category.name;
      category.slug = req.body.slug || category.slug;
      category.description = req.body.description || category.description;
      category.status = req.body.status || category.status;
      category.bgColor = req.body.bgColor || category.bgColor;

      if (req.body.tags !== undefined) {
        const parsedTags = Array.isArray(req.body.tags)
          ? req.body.tags
          : String(req.body.tags || '')
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean);
        category.tags = [...new Set(parsedTags)];
      }

      if (req.file) {
        category.image = req.file.path;
      }

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      // Cascade: remove all subcategories under this category
      const subResult = await SubCategory.deleteMany({ category: category._id });
      await category.deleteOne();
      res.json({
        message: 'Category removed',
        deletedSubCategories: subResult.deletedCount || 0
      });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
