import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Vendor from '../models/Vendor.js';

// Protect Customer/User Routes
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      if (!req.user) return res.status(401).json({ message: 'User no longer exists' });
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) res.status(401).json({ message: 'Not authorized, no token' });
};

// Protect Vendor Portal Routes
export const protectVendor = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.vendor = await Vendor.findById(decoded.id);
      if (!req.vendor) return res.status(401).json({ message: 'Vendor access denied' });
      if (req.vendor.status !== 'Active') return res.status(403).json({ message: 'Account is not active' });
      next();
    } catch (error) {
      res.status(401).json({ message: 'Session expired, please login again' });
    }
  }
  if (!token) res.status(401).json({ message: 'Vendor authentication required' });
};

// Protect Admin Panel Routes
export const protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id);
      if (!req.admin) return res.status(401).json({ message: 'Admin access denied' });
      next();
    } catch (error) {
      res.status(401).json({ message: 'Session expired, please login again' });
    }
  }
  if (!token) res.status(401).json({ message: 'Admin authentication required' });
};

// Check specific admin role
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};

// RBAC Middleware
export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    // Super Admins ('Admin' role) bypass all permission checks
    if (req.admin.role === 'Admin') {
      return next();
    }

    // Branch Managers and Staff must possess the required permission in their array
    const hasPermission = Array.isArray(req.admin.permissions) && req.admin.permissions.includes(requiredPermission);

    if (hasPermission) {
      return next();
    }

    return res.status(403).json({
      message: `Access Denied: You do not have the ${requiredPermission} permission.`
    });
  };
};
