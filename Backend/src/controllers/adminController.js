import Admin from '../models/Admin.js';
import generateToken from '../utils/generateToken.js';

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');

  if (admin && (await admin.comparePassword(password, admin.password))) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      profileImage: admin.profileImage,
      token: generateToken(admin._id)
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// --- STAFF MANAGEMENT (CRUD for 'Admin' Role) ---

// @desc    Get all staff/managers (excluding other Admins)
// @route   GET /api/admin/staff
// @access  Private (Admin/Branch Manager)
export const getAllAdmins = async (req, res) => {
  try {
    let query = { _id: { $ne: req.admin._id } };

    // Hierarchy Logic:
    if (req.admin.role === 'Branch Manager') {
      // Branch Managers can only see 'Staff' assigned to THEIR branch
      query.role = 'Staff';
      query.branchId = req.admin.branchId;
    } else if (req.admin.role === 'Admin') {
      // Admins can see all 'Branch Manager' and 'Staff' across all branches
      query.role = { $in: ['Branch Manager', 'Staff'] };
    } else {
      // Staff members shouldn't be accessing this, but if they do, show nothing or throw error
      return res.status(403).json({ message: 'Not authorized to view staff list' });
    }

    const admins = await Admin.find(query)
      .populate('branchId', 'name code')
      .sort('-createdAt');

    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new Staff/Manager
// @route   POST /api/admin/staff
// @access  Private (Admin/Branch Manager)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, role, permissions, branchId } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    let finalRole = role;
    let finalBranchId = branchId;

    // Hierarchy Enforcement:
    if (req.admin.role === 'Branch Manager') {
      // Branch Managers can ONLY create Staff for their own branch
      finalRole = 'Staff';
      finalBranchId = req.admin.branchId;
    } else if (req.admin.role === 'Admin') {
      // Admins can create Branch Managers or Staff
      // Don't allow creating 'Admin' role via this endpoint for security
      if (role === 'Admin') {
        return res.status(403).json({ message: 'Cannot create other Admin accounts via this module' });
      }
    }

    const admin = await Admin.create({
      name,
      email,
      phone,
      password,
      role: finalRole,
      permissions,
      branchId: finalBranchId || null
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Staff/Manager
// @route   PUT /api/admin/staff/:id
// @access  Private (Admin/Branch Manager)
export const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Security Check: Prevents editing other Admins
    if (admin.role === 'Admin' && req.admin.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to edit Admin accounts' });
    }

    // Hierarchy Enforcement:
    if (req.admin.role === 'Branch Manager') {
      // Managers can only edit staff in THEIR branch
      if (admin.role !== 'Staff' || admin.branchId.toString() !== req.admin.branchId.toString()) {
        return res.status(403).json({ message: 'Not authorized to edit staff from other branches' });
      }

      // Managers can't change roles or branches
      delete req.body.role;
      delete req.body.branchId;
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.phone = req.body.phone || admin.phone;
    admin.role = req.body.role || admin.role;
    admin.permissions = req.body.permissions || admin.permissions;
    admin.branchId = req.body.branchId !== undefined ? req.body.branchId : admin.branchId;
    admin.isActive = req.body.isActive ?? admin.isActive;

    if (req.body.password) {
      admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();
    res.json(updatedAdmin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Staff/Manager
// @route   DELETE /api/admin/staff/:id
// @access  Private (Admin Only)
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Security Check: Prevents deleting other Admins
    if (admin.role === 'Admin' && req.admin.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to remove Admin accounts' });
    }

    // Hierarchy Enforcement for Branch Managers
    if (req.admin.role === 'Branch Manager') {
      if (admin.role !== 'Staff' || admin.branchId?.toString() !== req.admin.branchId?.toString()) {
        return res.status(403).json({ message: 'Not authorized to remove staff from other branches' });
      }
    }

    await admin.deleteOne();
    res.json({ message: 'Staff member removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current admin profile
// @route   GET /api/admin/profile
// @access  Private
export const getAdminProfile = async (req, res) => {
  const admin = await Admin.findById(req.admin._id);
  if (admin) {
    res.json(admin);
  } else {
    res.status(404).json({ message: 'Admin profile not found' });
  }
};

// @desc    Update current admin profile
// @route   PUT /api/admin/profile
// @access  Private
export const updateAdminProfile = async (req, res) => {
  try {
    console.log('Update Request Body:', req.body);
    console.log('Update Request File:', req.file);
    const admin = await Admin.findById(req.admin._id);

    if (admin) {
      admin.name = req.body.name || admin.name;
      admin.email = req.body.email || admin.email;
      admin.phone = req.body.phone || admin.phone;

      if (req.body.password) {
        admin.password = req.body.password;
      }

      // Handle file upload from Multer/Cloudinary
      if (req.file && req.file.path) {
        admin.profileImage = req.file.path;
      } else if (req.body.profileImage) {
        admin.profileImage = req.body.profileImage;
      }

      const updatedAdmin = await admin.save();
      res.json({
        _id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        phone: updatedAdmin.phone,
        role: updatedAdmin.role,
        permissions: updatedAdmin.permissions,
        profileImage: updatedAdmin.profileImage,
        token: generateToken(updatedAdmin._id)
      });
    } else {
      res.status(404).json({ message: 'Admin profile not found' });
    }
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};
