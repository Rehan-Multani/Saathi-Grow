import Admin from '../models/Admin.js';
import generateToken from '../utils/generateToken.js';
import { sendWelcomeEmail, sendResetPasswordEmail } from '../services/emailService.js';
import crypto from 'crypto';

const STAFF_ALLOWED_PERMISSIONS = [
  'VIEW_DASHBOARD',
  'VIEW_ORDERS',
  'MANAGE_ORDERS',
  'MANAGE_REFUNDS_RETURNS',
  'VIEW_PRODUCTS',
  'MANAGE_PRODUCTS',
  'MANAGE_INVENTORY',
  'VIEW_CUSTOMERS',
  'VIEW_REPORTS',
  'MANAGE_STAFF',
  'MANAGE_POS_BILLING',
];

const filterStaffPermissions = (permissions = []) =>
  permissions.filter((p) => STAFF_ALLOWED_PERMISSIONS.includes(p));

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');

  if (admin && (await admin.comparePassword(password, admin.password))) {
    if (!admin.isActive) {
      // Only Super Admins (no branchId and 'Admin' role) get the English message
      const isSuperAdmin = admin.role === 'Admin' && !admin.branchId;
      const msg = isSuperAdmin ? 'Account is inactive. Please contact support.' : 'This branch has been deleted. Please contact admin.';
      return res.status(403).json({ message: msg });
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

// @desc    Forgot Password
// @route   POST /api/admin/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email, portal } = req.body;
  const portalPrefix = portal || 'admin';

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await admin.save();

    // Create reset URL
    const resetUrl = `${process.env.ADMIN_URL || 'http://localhost:5173'}/${portalPrefix}/reset-password/${resetToken}`;

    // Send Email
    const emailSent = await sendResetPasswordEmail(admin.email, admin.name, resetUrl);

    if (emailSent) {
      res.json({ message: 'Reset link dispatched to your registered email' });
    } else {
      admin.resetPasswordToken = undefined;
      admin.resetPasswordExpires = undefined;
      await admin.save();
      res.status(500).json({ message: 'Transmission failure: Could not send email' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/admin/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ message: 'Security token is invalid or has expired' });
    }

    // Set new password
    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;

    await admin.save();

    res.json({ message: 'Security credentials updated successfully. Please login with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- STAFF MANAGEMENT (CRUD for 'Admin' Role) ---

// @desc    Get all staff/managers (excluding other Admins)
// @route   GET /api/admin/staff
// @access  Private (Admin/Store Manager)
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
      // Admins can see all 'Store Manager', 'Store Manager' and 'Staff' across all branches
      query.role = { $in: ['Store Manager', 'Store Manager', 'Staff'] };
    } else {
      // Store Managers and allowed Staff can see all team members in THEIR branch
      // (Excluding Super Admins)
      query.role = { $in: ['Store Manager', 'Store Manager', 'Staff'] };
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
// @access  Private (Admin/Store Manager)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, role, permissions, branchId } = req.body;

    const adminExists = await Admin.findOne({ $or: [{ email }, { phone }] });
    if (adminExists) {
      const field = adminExists.email === email ? 'Email' : 'Phone number';
      return res.status(400).json({ message: `${field} is already registered with another staff member` });
    }

    let finalRole = role;
    if (role === 'Store Manager') finalRole = 'Store Manager';
    let finalBranchId = branchId;

    // Allowed permissions for non-Super Admin roles
    let finalPermissions = permissions || [];

    // Hierarchy Enforcement:
    if (req.admin.role === 'Admin') {
      // Admins can create Store Managers or Staff
      // Don't allow creating 'Admin' role via this endpoint for security
      if (role === 'Admin') {
        return res.status(403).json({ message: 'Cannot create other Admin accounts via this module' });
      }

      if (!finalBranchId) {
        return res.status(400).json({ message: 'Branch assignment is required for staff and managers' });
      }
    } else {
      // Store Managers and Staff can ONLY create Staff for their own branch
      finalRole = 'Staff';
      finalBranchId = req.admin.branchId;

      if (!finalBranchId) {
        return res.status(403).json({ message: 'Cannot create staff without a branch assignment' });
      }
    }

    finalPermissions = filterStaffPermissions(finalPermissions);

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

    // Send Welcome Email to staff
    await sendWelcomeEmail(admin.email, admin.name, admin.role, password);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Staff/Manager
// @route   PUT /api/admin/staff/:id
// @access  Private (Admin/Store Manager)
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

    // Filter and update permissions
    if (req.body.permissions) {
      admin.permissions = filterStaffPermissions(req.body.permissions);
    }
    if (req.admin.role !== 'Admin') {
      // Non-Admins can only edit staff in THEIR branch
      if (admin.role !== 'Staff' || admin.branchId?.toString() !== req.admin.branchId?.toString()) {
        return res.status(403).json({ message: 'Not authorized to edit staff from other branches or higher roles' });
      }

      // Non-Admins can't change roles or branches
      delete req.body.role;
      delete req.body.branchId;
    }

    // Check if new email/phone is already taken
    if (req.body.email && req.body.email !== admin.email) {
      const emailExists = await Admin.findOne({ email: req.body.email, _id: { $ne: admin._id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already registered with another staff member' });
      }
    }

    if (req.body.phone && req.body.phone !== admin.phone) {
      const phoneExists = await Admin.findOne({ phone: req.body.phone, _id: { $ne: admin._id } });
      if (phoneExists) {
        return res.status(400).json({ message: 'Phone number is already registered with another staff member' });
      }
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.phone = req.body.phone || admin.phone;

    // Don't allow changing TO 'Admin' role if not already an Admin
    if (req.body.role === 'Admin' && admin.role !== 'Admin') {
      return res.status(403).json({ message: 'Cannot promote to Admin role via this module' });
    }

    admin.role = req.body.role || admin.role;

    // Hierarchy Enforcement:
    if (req.body.branchId !== undefined) {
      const willBeActive = req.body.isActive ?? admin.isActive;
      if ((req.body.branchId === '' || req.body.branchId === null) && willBeActive) {
        if (admin.role !== 'Admin') {
          return res.status(400).json({ message: 'Branch assignment is required to activate a manager/staff account.' });
        }
        admin.branchId = null;
      } else {
        admin.branchId = req.body.branchId || null;
      }
    }

    admin.isActive = req.body.isActive ?? admin.isActive;

    if (req.body.password) {
      admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();
    res.json(updatedAdmin);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'email';
      const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
      return res.status(400).json({ message: `${capitalizedField === 'Phone' ? 'Phone number' : capitalizedField} is already registered with another staff member` });
    }
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
      // Check if new email/phone is already taken
      if (req.body.email && req.body.email !== admin.email) {
        const emailExists = await Admin.findOne({ email: req.body.email, _id: { $ne: admin._id } });
        if (emailExists) {
          return res.status(400).json({ message: 'Email is already registered with another staff member' });
        }
      }

      if (req.body.phone && req.body.phone !== admin.phone) {
        const phoneExists = await Admin.findOne({ phone: req.body.phone, _id: { $ne: admin._id } });
        if (phoneExists) {
          return res.status(400).json({ message: 'Phone number is already registered with another staff member' });
        }
      }

      admin.name = req.body.name || admin.name;
      admin.email = req.body.email || admin.email;
      admin.phone = req.body.phone || admin.phone;

      if (req.body.password) {
        admin.password = req.body.password;
      }

      if (req.body.settlementPin) {
        admin.settlementPin = req.body.settlementPin;
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
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'email';
      const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
      return res.status(400).json({ message: `${capitalizedField === 'Phone' ? 'Phone number' : capitalizedField} is already registered with another staff member` });
    }
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};
