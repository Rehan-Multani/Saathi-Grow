import PhysicalLocation from '../models/PhysicalLocation.js';
import Product from '../models/Product.js';

// ─── ADMIN — BRANCH LOCATIONS ────────────────────────────────────────────────

// @desc    Get all locations for a specific branch (or all branches for admin)
// @route   GET /api/admin/locations
// @access  Private (Admin/Branch Manager)
export const getAdminLocations = async (req, res) => {
  try {
    const { branchId, available } = req.query;

    // If requester is Branch Manager, scope to their branch
    const effectiveBranchId = (req.admin?.role !== 'Admin' && req.admin?.branchId)
      ? req.admin.branchId
      : branchId;

    const filter = { branchId: effectiveBranchId || { $exists: true }, vendorId: null, isActive: true };

    if (available === 'true') {
      filter.assignedProduct = null; // Only free slots
    }

    const locations = await PhysicalLocation.find(filter)
      .sort('label')
      .populate('assignedProduct', 'name sku image');

    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available locations for a specific branch (for dropdown in product forms)
//          If currentProductId is provided, include its currently-assigned location even if occupied
// @route   GET /api/admin/locations/available
// @access  Private (Admin/Branch Manager/Staff)
export const getAvailableAdminLocations = async (req, res) => {
  try {
    const { branchId, currentProductId } = req.query;

    const effectiveBranchId = (req.admin?.role !== 'Admin' && req.admin?.branchId)
      ? req.admin.branchId.toString()
      : branchId;

    if (!effectiveBranchId) {
      return res.status(400).json({ message: 'branchId is required' });
    }

    // Build: all active locations for branch that are either free OR currently assigned to this product
    const orConditions = [{ assignedProduct: null }];
    if (currentProductId) {
      orConditions.push({ assignedProduct: currentProductId });
    }

    const locations = await PhysicalLocation.find({
      branchId: effectiveBranchId,
      isActive: true,
      $or: orConditions
    }).sort('label').lean();

    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a location for a branch
// @route   POST /api/admin/locations
// @access  Private (Admin/Branch Manager)
export const createAdminLocation = async (req, res) => {
  try {
    const { label, branchId, description } = req.body;

    const effectiveBranchId = (req.admin?.role !== 'Admin' && req.admin?.branchId)
      ? req.admin.branchId
      : branchId;

    if (!effectiveBranchId) {
      return res.status(400).json({ message: 'branchId is required' });
    }

    const exists = await PhysicalLocation.findOne({ label, branchId: effectiveBranchId, vendorId: null });
    if (exists) {
      return res.status(400).json({ message: 'A location with this label already exists for this branch' });
    }

    const location = await PhysicalLocation.create({
      label,
      branchId: effectiveBranchId,
      vendorId: null,
      description
    });
    res.status(201).json(location);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Location label must be unique within a branch' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a location
// @route   PUT /api/admin/locations/:id
// @access  Private (Admin/Branch Manager)
export const updateAdminLocation = async (req, res) => {
  try {
    const location = await PhysicalLocation.findById(req.params.id);
    if (!location) return res.status(404).json({ message: 'Location not found' });

    // Branch Manager can only edit their own branch's locations
    if (req.admin?.role !== 'Admin' && req.admin?.branchId &&
        location.branchId?.toString() !== req.admin.branchId.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this location' });
    }

    const { label, description, isActive } = req.body;
    if (label !== undefined) location.label = label;
    if (description !== undefined) location.description = description;
    if (isActive !== undefined) location.isActive = isActive;

    const updated = await location.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete (or deactivate) a location
// @route   DELETE /api/admin/locations/:id
// @access  Private (Admin/Branch Manager)
export const deleteAdminLocation = async (req, res) => {
  try {
    const location = await PhysicalLocation.findById(req.params.id);
    if (!location) return res.status(404).json({ message: 'Location not found' });

    if (location.assignedProduct) {
      return res.status(400).json({ message: 'Cannot delete an occupied location. Unassign the product first.' });
    }

    await location.deleteOne();
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── BULK CREATE (Admin convenience) ─────────────────────────────────────────

// @desc    Bulk-create locations for a branch (e.g. "A-1" through "A-10")
// @route   POST /api/admin/locations/bulk
// @access  Private (Admin)
export const bulkCreateAdminLocations = async (req, res) => {
  try {
    const { branchId, labels } = req.body; // labels: string[]

    if (!branchId || !Array.isArray(labels) || labels.length === 0) {
      return res.status(400).json({ message: 'branchId and labels[] are required' });
    }

    const docs = labels.map(label => ({
      label: label.trim(),
      branchId,
      vendorId: null
    }));

    const result = await PhysicalLocation.insertMany(docs, { ordered: false });
    res.status(201).json({ created: result.length, locations: result });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Some labels already exist for this branch', details: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// ─── VENDOR — STORE LOCATIONS ─────────────────────────────────────────────────

// @desc    Get all locations for logged-in vendor's store
// @route   GET /api/vendors/locations
// @access  Private (Vendor)
export const getVendorLocations = async (req, res) => {
  try {
    const { available } = req.query;
    const filter = { vendorId: req.vendor._id, branchId: null, isActive: true };

    if (available === 'true') {
      filter.assignedProduct = null;
    }

    const locations = await PhysicalLocation.find(filter)
      .sort('label')
      .populate('assignedProduct', 'name sku image');

    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available vendor locations for dropdown (excludes occupied, includes current product's location)
// @route   GET /api/vendors/locations/available
// @access  Private (Vendor)
export const getAvailableVendorLocations = async (req, res) => {
  try {
    const { currentProductId } = req.query;

    const orConditions = [{ assignedProduct: null }];
    if (currentProductId) {
      orConditions.push({ assignedProduct: currentProductId });
    }

    const locations = await PhysicalLocation.find({
      vendorId: req.vendor._id,
      branchId: null,
      isActive: true,
      $or: orConditions
    }).sort('label').lean();

    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a location for vendor's store
// @route   POST /api/vendors/locations
// @access  Private (Vendor)
export const createVendorLocation = async (req, res) => {
  try {
    const { label, description } = req.body;

    const exists = await PhysicalLocation.findOne({ label, vendorId: req.vendor._id, branchId: null });
    if (exists) {
      return res.status(400).json({ message: 'A location with this label already exists in your store' });
    }

    const location = await PhysicalLocation.create({
      label,
      vendorId: req.vendor._id,
      branchId: null,
      description
    });
    res.status(201).json(location);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Location label must be unique within your store' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a vendor location
// @route   PUT /api/vendors/locations/:id
// @access  Private (Vendor)
export const updateVendorLocation = async (req, res) => {
  try {
    const location = await PhysicalLocation.findOne({ _id: req.params.id, vendorId: req.vendor._id });
    if (!location) return res.status(404).json({ message: 'Location not found or unauthorized' });

    const { label, description, isActive } = req.body;
    if (label !== undefined) location.label = label;
    if (description !== undefined) location.description = description;
    if (isActive !== undefined) location.isActive = isActive;

    const updated = await location.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a vendor location
// @route   DELETE /api/vendors/locations/:id
// @access  Private (Vendor)
export const deleteVendorLocation = async (req, res) => {
  try {
    const location = await PhysicalLocation.findOne({ _id: req.params.id, vendorId: req.vendor._id });
    if (!location) return res.status(404).json({ message: 'Location not found or unauthorized' });

    if (location.assignedProduct) {
      return res.status(400).json({ message: 'Cannot delete an occupied location. Unassign the product first.' });
    }

    await location.deleteOne();
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── SHARED UTILITY: Sync location assignment when product is saved ───────────

/**
 * Call this after saving a product to keep PhysicalLocation.assignedProduct in sync.
 * @param {string|null} newLabel - The new physicalLocation label (string), or null/empty to clear
 * @param {string} productId
 * @param {string|null} branchId - set for admin/branch products
 * @param {string|null} vendorId - set for vendor products
 */
export const syncLocationAssignment = async ({ newLabel, productId, branchId, vendorId }) => {
  try {
    // Clear any previous assignment for this product
    await PhysicalLocation.updateMany(
      { assignedProduct: productId },
      { $set: { assignedProduct: null } }
    );

    if (!newLabel || newLabel.trim() === '') return;

    // Assign the new location
    const filter = { label: newLabel.trim(), isActive: true };
    if (branchId) filter.branchId = branchId;
    else if (vendorId) filter.vendorId = vendorId;

    await PhysicalLocation.findOneAndUpdate(
      filter,
      { $set: { assignedProduct: productId } },
      { new: true }
    );
  } catch (err) {
    // Non-critical: log and continue
    console.warn('[syncLocationAssignment] Failed to sync location:', err.message);
  }
};
