import Brand from '../models/Brand.js';

// @desc    Create new brand
// @route   POST /api/admin/brands or /api/vendor/brands
// @access  Private (Admin/Vendor)
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

    const brandData = {
      name,
      category,
      website,
      description,
      status: status || 'Active',
      logo
    };

    if (req.admin) {
      brandData.createdBy = req.admin._id;
    } else if (req.vendor) {
      brandData.vendor = req.vendor._id;
    }

    const brand = await Brand.create(brandData);
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all brands
// @route   GET /api/admin/brands
// @access  Private (Admin/Vendor)
export const getBrands = async (req, res) => {
  try {
    let query = {};
    if (req.vendor) {
      // Return Admin brands (no vendor field) OR brands belonging to this vendor
      query = {
        $or: [
          { vendor: { $exists: false } },
          { vendor: null },
          { vendor: req.vendor._id }
        ]
      };
    }
    const brands = await Brand.find(query).sort('-createdAt');
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get brand by name (Public)
// @route   GET /api/admin/brands/public/name/:name
// @access  Public
export const getBrandByNamePublic = async (req, res) => {
  try {
    const brand = await Brand.findOne({ name: req.params.name, status: 'Active' });
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get brand by ID
// @route   GET /api/admin/brands/:id
// @access  Private (Admin/Vendor)
export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    // If vendor, check if they have access (admin brand or their own)
    if (req.vendor && brand.vendor && brand.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this brand' });
    }

    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update brand
// @route   PUT /api/admin/brands/:id
// @access  Private (Admin/Vendor)
export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    // Authorization check
    if (req.vendor && (!brand.vendor || brand.vendor.toString() !== req.vendor._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to update this brand' });
    }

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete brand
// @route   DELETE /api/admin/brands/:id
// @access  Private (Admin/Vendor)
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    // Authorization check
    if (req.vendor && (!brand.vendor || brand.vendor.toString() !== req.vendor._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to delete this brand' });
    }

    await brand.deleteOne();
    res.json({ message: 'Brand removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
