import Brand from '../models/Brand.js';

// @desc    Create new brand
// @route   POST /api/admin/brands
// @access  Private (Admin/Staff)
export const createBrand = async (req, res) => {
  try {
    const { name, category, website, description, status } = req.body;

    const brandExists = await Brand.findOne({ name });
    if (brandExists) {
      return res.status(400).json({ message: 'Brand already exists' });
    }

    let logo = '';
    if (req.file) {
      logo = req.file.path;
    }

    const brand = await Brand.create({
      name,
      category,
      website,
      description,
      status: status || 'Active',
      logo,
      createdBy: req.admin._id
    });

    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all brands
// @route   GET /api/admin/brands
// @access  Private (Admin/Staff)
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}).sort('-createdAt');
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get brand by ID
// @route   GET /api/admin/brands/:id
// @access  Private (Admin/Staff)
export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (brand) {
      res.json(brand);
    } else {
      res.status(404).json({ message: 'Brand not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update brand
// @route   PUT /api/admin/brands/:id
// @access  Private (Admin/Staff)
export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (brand) {
      brand.name = req.body.name || brand.name;
      brand.category = req.body.category || brand.category;
      brand.website = req.body.website || brand.website;
      brand.description = req.body.description || brand.description;
      brand.status = req.body.status || brand.status;

      if (req.file) {
        brand.logo = req.file.path;
      }

      const updatedBrand = await brand.save();
      res.json(updatedBrand);
    } else {
      res.status(404).json({ message: 'Brand not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete brand
// @route   DELETE /api/admin/brands/:id
// @access  Private (Admin)
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (brand) {
      await brand.deleteOne();
      res.json({ message: 'Brand removed' });
    } else {
      res.status(404).json({ message: 'Brand not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
