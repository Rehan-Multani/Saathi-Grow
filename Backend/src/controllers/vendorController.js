import Vendor from '../models/Vendor.js';
import VendorPayout from '../models/VendorPayout.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import { cloudinary } from '../config/cloudinary.js';
import { geocodeAddress, getFullAddress } from '../services/locationService.js';
import { sendPushNotification } from '../services/notificationService.js';
import { sendWelcomeEmail, sendSystemNotificationEmail } from '../services/emailService.js';

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private (Admin/Staff)
export const getVendors = async (req, res) => {
  try {
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const includeMeta = req.query.includeMeta === 'true';
    const pageNumber = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const search = (req.query.search || '').trim();
    const query = {};

    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const vendorsQuery = Vendor.find(query)
      .select('storeName ownerName email phone status logo rating products createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    if (hasPagination) {
      const total = await Vendor.countDocuments(query);
      const vendors = await vendorsQuery
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      res.set('X-Total-Count', String(total));
      res.set('X-Page', String(pageNumber));
      res.set('X-Limit', String(limitNumber));
      res.set('X-Total-Pages', String(Math.ceil(total / limitNumber) || 1));
      if (includeMeta) {
        return res.json({
          success: true,
          vendors,
          pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber) || 1
          }
        });
      }
      return res.json(vendors);
    }

    const vendors = await vendorsQuery;
    if (includeMeta) {
      return res.json({ success: true, vendors });
    }
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor by ID
// @route   GET /api/admin/vendors/:id
// @access  Private (Admin/Staff)
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new vendor
// @route   POST /api/admin/vendors
// @access  Private (Admin/Staff)
export const createVendor = async (req, res) => {
  try {
    const { storeName, ownerName, email, phone, address, description, status, password } = req.body;

    let parsedAddress = address;
    if (typeof address === 'string') {
      try {
        parsedAddress = JSON.parse(address);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid address format' });
      }
    }

    const vendorExists = await Vendor.findOne({ email });
    if (vendorExists) {
      return res.status(400).json({ message: 'Vendor with this email already exists' });
    }

    let logo = '';
    if (req.file) {
      logo = req.file.path;
    }

    // Geocoding fallback if coordinates are missing or required fields are empty
    if (parsedAddress && parsedAddress.street) {
      const locationMissing = !parsedAddress.location || !parsedAddress.location.coordinates || (parsedAddress.location.coordinates[0] === 0 && parsedAddress.location.coordinates[1] === 0);
      const fieldsMissing = !parsedAddress.city || !parsedAddress.state || !parsedAddress.zipCode;

      if (locationMissing || fieldsMissing) {
        const fullAddr = await getFullAddress(`${parsedAddress.street}, ${parsedAddress.city || ''}, ${parsedAddress.state || ''}`);
        if (fullAddr) {
          parsedAddress.location = { type: 'Point', coordinates: fullAddr.coordinates };
          parsedAddress.city = parsedAddress.city || fullAddr.city;
          parsedAddress.state = parsedAddress.state || fullAddr.state;
          parsedAddress.zipCode = parsedAddress.zipCode || fullAddr.zipCode;
        }
      }
    }

    const vendor = await Vendor.create({
      storeName,
      ownerName,
      email,
      phone,
      address: parsedAddress,
      description,
      status: status || 'Pending',
      password: password || '123456', // Default password if not provided
      logo,
      createdBy: req.admin._id
    });

    res.status(201).json(vendor);

    // Send Welcome Email
    await sendWelcomeEmail(vendor.email, vendor.ownerName, 'Vendor', password || '123456');

    // Optional: Push notification if they have FCM token (usually not on first create)
    if (vendor.fcmToken?.web || vendor.fcmToken?.app) {
      await sendPushNotification(vendor._id, 'Vendor', {
        title: 'Welcome to SaathiGro!',
        body: 'Your vendor account has been created successfully.'
      }, { type: 'vendor_welcome' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vendor
// @route   PUT /api/admin/vendors/:id
// @access  Private (Admin/Staff)
export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const { storeName, ownerName, email, phone, address, description, status } = req.body;

    let parsedAddress = address;
    if (address && typeof address === 'string') {
      try {
        parsedAddress = JSON.parse(address);
      } catch (err) {
        // Fallback or ignore if not JSON
      }
    }

    if (parsedAddress) {
      // If street/city changed or coordinates are missing, re-geocode
      const addressChanged = parsedAddress.street !== vendor.address.street || parsedAddress.city !== vendor.address.city;
      const locationMissing = !parsedAddress.location || !parsedAddress.location.coordinates || (parsedAddress.location.coordinates[0] === 0 && parsedAddress.location.coordinates[1] === 0);
      const fieldsMissing = !parsedAddress.city || !parsedAddress.state || !parsedAddress.zipCode;

      if (addressChanged || locationMissing || fieldsMissing) {
        const fullAddr = await getFullAddress(`${parsedAddress.street}, ${parsedAddress.city || ''}, ${parsedAddress.state || ''}`);
        if (fullAddr) {
          parsedAddress.location = { type: 'Point', coordinates: fullAddr.coordinates };
          parsedAddress.city = parsedAddress.city || fullAddr.city;
          parsedAddress.state = parsedAddress.state || fullAddr.state;
          parsedAddress.zipCode = parsedAddress.zipCode || fullAddr.zipCode;
        }
      }
      vendor.address = parsedAddress;
    }

    vendor.storeName = storeName || vendor.storeName;
    vendor.ownerName = ownerName || vendor.ownerName;
    vendor.email = email || vendor.email;
    vendor.phone = phone || vendor.phone;
    vendor.description = description || vendor.description;
    vendor.status = status || vendor.status;

    if (req.file) {
      vendor.logo = req.file.path;
    }

    const updatedVendor = await vendor.save();
    res.json(updatedVendor);

    // Notify on Status Change
    if (status && status !== vendor.status) {
      const subject = `Account Status Updated: ${status}`;
      const title = 'Account Status Update';
      const body = `Hi ${vendor.ownerName}, your store '${vendor.storeName}' account status has been updated to ${status}.`;
      
      await sendSystemNotificationEmail(vendor.email, subject, title, body);
      await sendPushNotification(vendor._id, 'Vendor', { title, body }, { type: 'account_status', status });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete vendor
// @route   DELETE /api/admin/vendors/:id
// @access  Private (Admin)
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    await vendor.deleteOne();
    res.json({ message: 'Vendor removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payouts (Admin view — includes vendor withdrawal requests)
// @route   GET /api/admin/vendors/payouts
// @access  Private (Admin/Staff)
export const getPayouts = async (req, res) => {
  try {
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const includeMeta = req.query.includeMeta === 'true';
    const includeStats = req.query.includeStats === 'true';
    const pageNumber = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const status = (req.query.status || '').trim();
    const query = {};
    if (status) {
      query.status = status;
    }

    const payoutsQuery = VendorPayout.find(query)
      .select('vendor amount upiId payoutDate paymentMethod referenceNumber status note processedBy requestType processedAt createdAt updatedAt')
      .populate('vendor', 'storeName ownerName logo')
      .populate('processedBy', 'name email')
      .sort({ status: 1, createdAt: -1 }) // Pending first, then newest
      .lean();

    const baseStatsQuery = status ? { status } : {};

    if (hasPagination) {
      const [total, payouts] = await Promise.all([
        VendorPayout.countDocuments(query),
        payoutsQuery
          .skip((pageNumber - 1) * limitNumber)
          .limit(limitNumber)
      ]);

      res.set('X-Total-Count', String(total));
      res.set('X-Page', String(pageNumber));
      res.set('X-Limit', String(limitNumber));
      res.set('X-Total-Pages', String(Math.ceil(total / limitNumber) || 1));
      if (includeMeta) {
        let stats = null;
        if (includeStats) {
          const statsAgg = await VendorPayout.aggregate([
            { $match: {} },
            {
              $group: {
                _id: '$status',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            }
          ]);
          stats = {
            totals: { pending: 0, paid: 0, processing: 0, rejected: 0, failed: 0 },
            counts: { pending: 0, paid: 0, processing: 0, rejected: 0, failed: 0 }
          };
          statsAgg.forEach((row) => {
            const key = (row._id || '').toLowerCase();
            if (stats.totals[key] !== undefined) {
              stats.totals[key] = row.totalAmount || 0;
              stats.counts[key] = row.count || 0;
            }
          });
        }
        return res.json({
          success: true,
          payouts,
          pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber) || 1
          },
          ...(includeStats ? { stats } : {})
        });
      }
      return res.json(payouts);
    }

    const payouts = await payoutsQuery;
    if (includeMeta && includeStats) {
      const statsAgg = await VendorPayout.aggregate([
        { $match: {} },
        { $group: { _id: '$status', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);
      const stats = {
        totals: { pending: 0, paid: 0, processing: 0, rejected: 0, failed: 0 },
        counts: { pending: 0, paid: 0, processing: 0, rejected: 0, failed: 0 }
      };
      statsAgg.forEach((row) => {
        const key = (row._id || '').toLowerCase();
        if (stats.totals[key] !== undefined) {
          stats.totals[key] = row.totalAmount || 0;
          stats.counts[key] = row.count || 0;
        }
      });
      return res.json({ success: true, payouts, stats });
    }
    if (includeMeta) {
      return res.json({ success: true, payouts });
    }
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a payout (Admin-initiated)
// @route   POST /api/admin/vendors/payouts
// @access  Private (Admin)
export const createPayout = async (req, res) => {
  try {
    const { vendor, amount, paymentMethod, referenceNumber, note, status, upiId } = req.body;

    const payout = await VendorPayout.create({
      vendor,
      amount,
      upiId: upiId || '',
      paymentMethod: paymentMethod || 'Bank Transfer',
      referenceNumber,
      note,
      status: status || 'Processing',
      requestType: 'admin_payout',
      processedBy: req.admin._id,
      processedAt: new Date()
    });

    const populatedPayout = await VendorPayout.findById(payout._id)
      .populate('vendor', 'storeName ownerName logo');

    res.status(201).json(populatedPayout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject/Update payout status (Admin action)
// @route   PATCH /api/admin/vendors/payouts/:id
// @access  Private (Admin)
export const updatePayoutStatus = async (req, res) => {
  try {
    const { status, referenceNumber, note } = req.body;
    const payout = await VendorPayout.findById(req.params.id);

    if (!payout) {
      return res.status(404).json({ message: 'Payout request not found' });
    }

    const prevStatus = payout.status;

    payout.status = status || payout.status;
    payout.referenceNumber = referenceNumber || payout.referenceNumber;
    payout.note = note || payout.note;
    payout.processedBy = req.admin._id;
    payout.processedAt = new Date();

    // ── WALLET DEDUCTION: Only when marking as Paid for the first time ──────
    if (status === 'Paid' && prevStatus !== 'Paid') {
      const wallet = await Wallet.findOneAndUpdate(
        { owner: payout.vendor, ownerModel: 'Vendor' },
        { $setOnInsert: { balance: 0, totalEarnings: 0, pendingPayouts: 0 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Check sufficient balance
      if (wallet.balance < payout.amount) {
        return res.status(400).json({
          message: `Insufficient vendor wallet balance. Available: ₹${wallet.balance}, Requested: ₹${payout.amount}`
        });
      }

      // Deduct balance from vendor wallet
      await Wallet.findByIdAndUpdate(wallet._id, {
        $inc: { balance: -payout.amount, pendingPayouts: -payout.amount }
      });

      // Record withdrawal transaction
      await Transaction.create({
        wallet: wallet._id,
        amount: payout.amount,
        type: 'debit',
        category: 'withdrawal',
        description: `Withdrawal Processed by Admin: Ref ${referenceNumber || payout._id}`,
        referenceId: payout._id,
        referenceModel: 'VendorPayout'
      });

      payout.payoutDate = new Date();
    }

    // ── WALLET RESTORE: If Rejected, release any pending hold ───────────────
    if (status === 'Rejected' && prevStatus !== 'Rejected') {
      // Release pendingPayouts hold if it was set when request was submitted
      const wallet = await Wallet.findOne({ owner: payout.vendor, ownerModel: 'Vendor' });
      if (wallet && wallet.pendingPayouts >= payout.amount) {
        await Wallet.findByIdAndUpdate(wallet._id, {
          $inc: { pendingPayouts: -payout.amount }
        });
      }

      // Record rejection transaction for audit
      if (wallet) {
        await Transaction.create({
          wallet: wallet._id,
          amount: payout.amount,
          type: 'credit',
          category: 'withdrawal_rejection',
          description: `Withdrawal Request Rejected: ${note || 'Rejected by Admin'}`,
          referenceId: payout._id,
          referenceModel: 'VendorPayout'
        });
      }
    }

    const updatedPayout = await payout.save();
    const populatedPayout = await VendorPayout.findById(updatedPayout._id)
      .populate('vendor', 'storeName ownerName logo')
      .populate('processedBy', 'name email');

    res.json(populatedPayout);

    // Notify Vendor on Payout Status Change
    if (status && status !== prevStatus) {
      const vendor = populatedPayout.vendor;
      const title = 'Payout Status Updated';
      const body = `Your payout of ₹${payout.amount} is now ${status}. ${note ? `Note: ${note}` : ''}`;
      
      await sendSystemNotificationEmail(vendor.email, `Payout Update: ${status}`, title, body);
      await sendPushNotification(vendor._id, 'Vendor', { title, body }, { 
        type: 'payout_update', 
        payoutId: payout._id.toString(),
        status 
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
