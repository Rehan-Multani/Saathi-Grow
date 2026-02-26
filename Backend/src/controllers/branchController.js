import Branch from '../models/Branch.js';
import Admin from '../models/Admin.js';
import { geocodeAddress } from '../services/locationService.js';

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

    let finalAddress = { ...address };
    if ((!finalAddress.location || !finalAddress.location.coordinates || (finalAddress.location.coordinates[0] === 0 && finalAddress.location.coordinates[1] === 0)) && address.street) {
      const coords = await geocodeAddress(`${address.street}, ${address.city}`);
      if (coords) {
        finalAddress.location = { type: 'Point', coordinates: coords };
      }
    }

    const branch = await Branch.create({
      name,
      code,
      address: finalAddress,
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

// @desc    Get current manager's branch
// @route   GET /api/admin/branches/my-branch
// @access  Private (Branch Manager)
export const getMyBranch = async (req, res) => {
  try {
    if (!req.admin.branchId) {
      return res.status(403).json({ message: 'No branch assigned to this manager' });
    }
    const branch = await Branch.findById(req.admin.branchId);
    if (!branch) return res.status(404).json({ message: 'Branch record not found' });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update current manager's branch
// @route   PUT /api/admin/branches/my-branch
// @access  Private (Branch Manager)
export const updateMyBranch = async (req, res) => {
  try {
    if (!req.admin.branchId) {
      return res.status(403).json({ message: 'No branch assigned to this manager' });
    }

    const { phone, email, address, isActive } = req.body;
    const branch = await Branch.findById(req.admin.branchId);

    if (branch) {
      branch.phone = phone || branch.phone;
      branch.email = email || branch.email;
      branch.isActive = isActive ?? branch.isActive;

      if (address) {
        // Limited address update for managers (maybe just street/phone)
        branch.address = { ...branch.address, ...address };
      }

      await branch.save();
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
      if (address) {
        let finalAddress = { ...address };
        // If street/city changed or location is missing, re-geocode
        const addressChanged = address.street !== branch.address.street || address.city !== branch.address.city;
        const locationMissing = !address.location || !address.location.coordinates || (address.location.coordinates[0] === 0 && address.location.coordinates[1] === 0);

        if ((locationMissing || addressChanged) && address.street) {
          const coords = await geocodeAddress(`${address.street}, ${address.city}`);
          if (coords) {
            finalAddress.location = { type: 'Point', coordinates: coords };
          }
        }
        branch.address = finalAddress;
      }
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
