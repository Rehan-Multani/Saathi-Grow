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

// @desc    Get all staff/managers
// @route   GET /api/admin/staff
// @access  Private (Admin Only)
export const getAllAdmins = async (req, res) => {
  const admins = await Admin.find({}).sort('-createdAt');
  res.json(admins);
};

// @desc    Create new Staff/Manager
// @route   POST /api/admin/staff
// @access  Private (Admin Only)
export const createAdmin = async (req, res) => {
  const { name, email, phone, password, role, permissions } = req.body;

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const admin = await Admin.create({
    name,
    email,
    phone,
    password,
    role,
    permissions
  });

  if (admin) {
    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });
  } else {
    res.status(400).json({ message: 'Invalid staff data' });
  }
};

// @desc    Update Staff/Manager
// @route   PUT /api/admin/staff/:id
// @access  Private (Admin Only)
export const updateAdmin = async (req, res) => {
  const admin = await Admin.findById(req.params.id);

  if (admin) {
    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.phone = req.body.phone || admin.phone;
    admin.role = req.body.role || admin.role;
    admin.permissions = req.body.permissions || admin.permissions;
    admin.isActive = req.body.isActive ?? admin.isActive;

    if (req.body.password) {
      admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();
    res.json(updatedAdmin);
  } else {
    res.status(404).json({ message: 'Staff member not found' });
  }
};

// @desc    Delete Staff/Manager
// @route   DELETE /api/admin/staff/:id
// @access  Private (Admin Only)
export const deleteAdmin = async (req, res) => {
  const admin = await Admin.findById(req.params.id);

  if (admin) {
    await admin.deleteOne();
    res.json({ message: 'Staff member removed' });
  } else {
    res.status(404).json({ message: 'Staff member not found' });
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
