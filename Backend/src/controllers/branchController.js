import Branch from '../models/Branch.js';
import Admin from '../models/Admin.js';

// @desc    Create new branch
// @route   POST /api/admin/branches
// @access  Private (Admin)
export const createBranch = async (req, res) => {
  try {
    const { name, code, address, phone, email } = req.body;

    const branchExists = await Branch.findOne({ $or: [{ name }, { code }] });
    if (branchExists) {
      return res.status(400).json({ message: 'Branch with this name or code already exists' });
    }

    const branch = await Branch.create({
      name,
      code,
      address,
      phone,
      email
    });

    res.status(201).json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all branches
// @route   GET /api/admin/branches
// @access  Private (Admin/Staff)
export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({});
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get branch by ID
// @route   GET /api/admin/branches/:id
// @access  Private (Admin/Staff)
export const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (branch) {
      res.json(branch);
    } else {
      res.status(404).json({ message: 'Branch not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update branch
// @route   PUT /api/admin/branches/:id
// @access  Private (Admin)
export const updateBranch = async (req, res) => {
  try {
    const { name, code, address, phone, email, isActive } = req.body;
    const branch = await Branch.findById(req.params.id);

    if (branch) {
      branch.name = name || branch.name;
      branch.code = code || branch.code;
      branch.address = address || branch.address;
      branch.phone = phone || branch.phone;
      branch.email = email || branch.email;
      branch.isActive = isActive ?? branch.isActive;

      const updatedBranch = await branch.save();
      res.json(updatedBranch);
    } else {
      res.status(404).json({ message: 'Branch not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete branch
// @route   DELETE /api/admin/branches/:id
// @access  Private (Admin)
export const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (branch) {
      // Unlink admins
      await Admin.updateMany({ branchId: branch._id }, { branchId: null });
      await branch.deleteOne();
      res.json({ message: 'Branch removed' });
    } else {
      res.status(404).json({ message: 'Branch not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
