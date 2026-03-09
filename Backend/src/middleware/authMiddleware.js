import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Vendor from '../models/Vendor.js';
import DeliveryPartner from '../models/DeliveryPartner.js';

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

// Optional User Protection - Populates req.user if token exists, but doesn't error if not
export const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      // Silently fail, req.user will remain undefined
    }
  }
  next();
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

// Optional Admin Protection - Populates req.admin if token exists, but doesn't error if not
export const optionalProtectAdmin = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id);
    } catch (error) {
      // Silently fail, req.admin will remain undefined
    }
  }
  next();
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

// Protect Delivery Partner Logic
export const protectDeliveryPartner = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.partner = await DeliveryPartner.findById(decoded.id);
      if (!req.partner) return res.status(401).json({ message: 'Delivery Partner access denied' });
      if (req.partner.authStatus !== 'Active') return res.status(403).json({ message: 'Account is suspended or inactive' });
      next();
    } catch (error) {
      res.status(401).json({ message: 'Session expired, please login again' });
    }
  }
  if (!token) res.status(401).json({ message: 'Delivery Partner authentication required' });
};
// Protect routes for both Vendors and Admins (Branch Managers)
export const protectStoreManager = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Try to find Admin first
      const admin = await Admin.findById(decoded.id);
      if (admin) {
        req.admin = admin;
        req.user = admin;
        req.role = 'Admin';
        return next();
      }

      // Try to find Vendor
      const vendor = await Vendor.findById(decoded.id);
      if (vendor) {
        req.vendor = vendor;
        req.user = vendor;
        req.role = 'Vendor';
        return next();
      }

      return res.status(401).json({ message: 'Store manager access denied' });
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  }
  if (!token) res.status(401).json({ message: 'Authentication required' });
};
// Optional Store Manager Protection - Populates req.admin or req.vendor if token exists
export const optionalProtectStoreManager = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Try Admin
      const admin = await Admin.findById(decoded.id);
      if (admin) {
        req.admin = admin;
        return next();
      }

      // Try Vendor
      const vendor = await Vendor.findById(decoded.id);
      if (vendor) {
        req.vendor = vendor;
        return next();
      }
    } catch (error) {
      // Silently fail
    }
  }
  next();
};
