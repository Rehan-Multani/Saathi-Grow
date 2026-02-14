import Category from '../models/Category.js';

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private (Admin/Staff)
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, status, bgColor } = req.body;

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    let image = '';
    if (req.file) {
      image = req.file.path;
    }

    const category = await Category.create({
      name,
      slug: slug || name.toLowerCase().split(' ').join('-'),
      description,
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
    const categories = await Category.find({}).sort('-createdAt');
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
      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
