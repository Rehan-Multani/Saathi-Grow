import User from '../models/User.js';
import Order from '../models/Order.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin/Manager)
export const getAllUsers = async (req, res) => {
  try {
    const admin = req.admin;
    let query = {};

    // Branch Scoping: If not Super Admin, filter users who have interacted with this specific branch
    if (admin && admin.role !== 'Admin' && admin.branchId) {
      // Find IDs of users who have placed orders in this branch
      const customerIdsInBranch = await Order.find({ branchId: admin.branchId }).distinct('user');
      query._id = { $in: customerIdsInBranch };
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// @desc    Create user (by admin)
// @route   POST /api/admin/users
// @access  Private (Admin)
export const createUser = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    const userExists = await User.findOne({ phone });
    if (userExists) return res.status(400).json({ message: 'User already exists with this phone number' });

    const user = new User({
      name,
      email,
      phone,
      role: role || 'user',
      isActive: true
    });

    if (req.file) {
      user.profileImage = req.file.path;
      user.profileImagePublicId = req.file.filename;
    }

    await user.save();
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

// @desc    Update user (by admin)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.role = req.body.role || user.role;
    user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;

    if (req.file) {
      if (user.profileImagePublicId) {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      }
      user.profileImage = req.file.path;
      user.profileImagePublicId = req.file.filename;
    }

    const updatedUser = await user.save();
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.profileImagePublicId) {
      await cloudinary.uploader.destroy(user.profileImagePublicId);
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};
