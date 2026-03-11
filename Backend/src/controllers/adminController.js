import Admin from '../models/Admin.js';
import generateToken from '../utils/generateToken.js';

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');

  if (admin && (await admin.comparePassword(password, admin.password))) {
    if (!admin.isActive) {
      return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
    }

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      profileImage: admin.profileImage,
      branchId: admin.branchId, // Added branchId
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
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const includeMeta = req.query.includeMeta === 'true';
    const pageNumber = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const search = (req.query.search || '').trim();
    let query = { _id: { $ne: req.admin._id } };

    // Hierarchy Logic:
    if (req.admin.role === 'Admin') {
      // Admins can see all 'Branch Manager' and 'Staff' across all branches
      query.role = { $in: ['Branch Manager', 'Staff'] };
    } else {
      // Branch Managers and allowed Staff can see all team members in THEIR branch
      // (Excluding Super Admins)
      query.role = { $in: ['Branch Manager', 'Staff'] };
      query.branchId = req.admin.branchId;

      if (!req.admin.branchId) {
        return res.status(403).json({ message: 'Not authorized to view staff list (No branch assigned)' });
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
      ];
    }

    const listQuery = Admin.find(query)
      .select('name email phone role permissions branchId isActive createdAt updatedAt profileImage')
      .populate('branchId', 'name code')
      .sort('-createdAt')
      .lean();

    if (hasPagination) {
      const total = await Admin.countDocuments(query);
      const admins = await listQuery
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      res.set('X-Total-Count', String(total));
      res.set('X-Page', String(pageNumber));
      res.set('X-Limit', String(limitNumber));
      res.set('X-Total-Pages', String(Math.ceil(total / limitNumber) || 1));
      if (includeMeta) {
        return res.json({
          success: true,
          admins,
          pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber) || 1
          }
        });
      }
      return res.json(admins);
    }

    const admins = await listQuery;

    if (includeMeta) {
      return res.json({
        success: true,
        admins
      });
    }
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

    // Restricted permissions for Staff and Branch Managers
    const RESTRICTED_PERMISSIONS = [
      'VIEW_DASHBOARD',
      'MANAGE_PRODUCTS',
      'MANAGE_CATEGORIES_BRANDS',
      'MANAGE_DELIVERY',
      'MANAGE_DELIVERY_BOYS',
      'MANAGE_CUSTOMERS',
      'MANAGE_BRANCHES',
      'MANAGE_VENDORS',
      'MANAGE_SETTINGS'
    ];

    let finalPermissions = permissions || [];

    // Hierarchy Enforcement:
    if (req.admin.role === 'Admin') {
      // Admins can create Branch Managers or Staff
      // Don't allow creating 'Admin' role via this endpoint for security
      if (role === 'Admin') {
        return res.status(403).json({ message: 'Cannot create other Admin accounts via this module' });
      }
    } else {
      // Branch Managers and Staff can ONLY create Staff for their own branch
      finalRole = 'Staff';
      finalBranchId = req.admin.branchId;

      if (!finalBranchId) {
        return res.status(403).json({ message: 'Cannot create staff without a branch assignment' });
      }
    }

    // Only Admin can have restricted permissions. 
    // If creating Branch Manager or Staff, strip restricted permissions
    if (finalRole === 'Branch Manager' || finalRole === 'Staff') {
      finalPermissions = finalPermissions.filter(p => !RESTRICTED_PERMISSIONS.includes(p));
    }

    const admin = await Admin.create({
      name,
      email,
      phone,
      password,
      role: finalRole,
      permissions: finalPermissions,
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

    // Restricted permissions for Staff and Branch Managers
    const RESTRICTED_PERMISSIONS = [
      'VIEW_DASHBOARD',
      'MANAGE_PRODUCTS',
      'MANAGE_CATEGORIES_BRANDS',
      'MANAGE_DELIVERY',
      'MANAGE_DELIVERY_BOYS',
      'MANAGE_CUSTOMERS',
      'MANAGE_BRANCHES',
      'MANAGE_VENDORS',
      'MANAGE_SETTINGS'
    ];

    // Hierarchy Enforcement:
    if (req.admin.role !== 'Admin') {
      // Non-Admins can only edit staff in THEIR branch
      if (admin.role !== 'Staff' || admin.branchId?.toString() !== req.admin.branchId?.toString()) {
        return res.status(403).json({ message: 'Not authorized to edit staff from other branches or higher roles' });
      }

      // Non-Admins can't change roles or branches
      delete req.body.role;
      delete req.body.branchId;
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.phone = req.body.phone || admin.phone;
    admin.role = req.body.role || admin.role;

    // Only Admin can have restricted permissions.
    if (req.body.permissions) {
      let finalPermissions = req.body.permissions;
      if (admin.role === 'Branch Manager' || admin.role === 'Staff') {
        finalPermissions = finalPermissions.filter(p => !RESTRICTED_PERMISSIONS.includes(p));
      }
      admin.permissions = finalPermissions;
    }

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

    // Hierarchy Enforcement for Non-Admins
    if (req.admin.role !== 'Admin') {
      if (admin.role !== 'Staff' || admin.branchId?.toString() !== req.admin.branchId?.toString()) {
        return res.status(403).json({ message: 'Not authorized to remove staff from other branches or higher roles' });
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
        branchId: updatedAdmin.branchId, // Added branchId
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
