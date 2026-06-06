import PromoCode from '../models/PromoCode.js';
import PromoUsage from '../models/PromoUsage.js';
import mongoose from 'mongoose';
import { notifyAllUsers } from '../services/notificationService.js';

// @desc    Create a new promo code
// @route   POST /api/promocodes
// @access  Admin
export const createPromoCode = async (req, res) => {
    try {
        const { code, discountValue, validFrom, validUntil, minOrderValue, usageLimitTotal, usageLimitPerUser, isAutoApply } = req.body;

        // Parse freeGift if it exists (might be a string from FormData)
        let freeGift = req.body.freeGift;
        if (typeof freeGift === 'string') {
            try {
                freeGift = JSON.parse(freeGift);
            } catch (e) {
                console.error("Error parsing freeGift JSON", e);
            }
        }

        // Basic Validations
        if (!code || !validFrom || !validUntil) {
            return res.status(400).json({ success: false, message: 'Code, Valid From and Valid Until dates are required' });
        }

        const fromDate = new Date(validFrom);
        fromDate.setHours(0, 0, 0, 0);

        const untilDate = new Date(validUntil);
        untilDate.setHours(23, 59, 59, 999);

        if (fromDate >= untilDate) {
            return res.status(400).json({ success: false, message: 'Start date must be before expiry date' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (fromDate < today) {
            return res.status(400).json({ success: false, message: 'Start date cannot be in the past' });
        }
        if (untilDate <= today) {
            return res.status(400).json({ success: false, message: 'Expiry date must be in the future' });
        }

        if (discountValue < 0 || minOrderValue < 0 || usageLimitTotal < 0 || usageLimitPerUser < 0) {
            return res.status(400).json({ success: false, message: 'Negative values are not allowed for discount, limits or order value' });
        }

        // Check for existing code
        const existing = await PromoCode.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'A promo code with this name already exists' });
        }

        // Handle Image Upload for Free Gift
        if (req.file && freeGift) {
            freeGift.image = req.file.path;
        }

        const promoCode = new PromoCode({
            ...req.body,
            freeGift,
            code: code.toUpperCase(),
            validFrom: fromDate,
            validUntil: untilDate,
            isAutoApply: isAutoApply === 'true' || isAutoApply === true
        });
        await promoCode.save();
        res.status(201).json({ success: true, data: promoCode });

        // Notify All Users about new Promo Code
        if (promoCode.isActive) {
            let bodyText = `Use this code to get ${promoCode.discountType === 'Percentage' ? promoCode.discountValue + '%' : '₹' + promoCode.discountValue} off on orders above ₹${promoCode.minOrderValue}!`;
            if (promoCode.discountType === 'FreeGift') {
                bodyText = `Get a Free Gift: "${promoCode.freeGift?.title}" on orders above ₹${promoCode.minOrderValue}!`;
            }
            
            notifyAllUsers({
                title: `🎟️ New Promo: ${promoCode.code}`,
                body: bodyText
            }, { promoCode: promoCode.code, type: 'promo' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all promo codes
// @route   GET /api/promocodes
// @access  Admin/Private
export const getAllPromoCodes = async (req, res) => {
    try {
        const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: promoCodes.length, data: promoCodes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get applicable promo codes for a user during checkout
// @route   POST /api/promocodes/applicable
// @access  Private
export const getApplicablePromoCodes = async (req, res) => {
    try {
        const { subTotal, totalAmount } = req.body;
        const amountToCheck = subTotal || totalAmount || 0;
        const userId = req.user._id;
        const now = new Date();

        // Fetch active and within date range promocodes
        const promoCodes = await PromoCode.find({
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now },
            minOrderValue: { $lte: amountToCheck }
        }).sort({ createdAt: -1 });

        // Filter out codes that have reached global limit
        let applicable = promoCodes.filter(promo => {
            if (promo.usageLimitTotal > 0 && promo.usedCount >= promo.usageLimitTotal) return false;
            return true;
        });

        // Filter out codes that user has already reached their personal limit
        const userUsages = await PromoUsage.find({ user: userId, promoCode: { $in: applicable.map(p => p._id) } });

        applicable = applicable.filter(promo => {
            const usage = userUsages.find(u => u.promoCode.toString() === promo._id.toString());
            if (usage && usage.usageCount >= promo.usageLimitPerUser) return false;
            return true;
        });

        res.status(200).json({ success: true, count: applicable.length, data: applicable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get promo codes for upselling (greed factor)
// @route   POST /api/promocodes/upselling
// @access  Private
export const getUpsellingPromoCodes = async (req, res) => {
    try {
        const { subTotal } = req.body;
        const amountToCheck = subTotal || 0;
        const userId = req.user._id;
        const now = new Date();

        // Fetch active and within date range promocodes where minOrderValue > subTotal
        // We can limit this to promos within a certain range (e.g., +1000) or just get all and filter
        const promoCodes = await PromoCode.find({
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now },
            minOrderValue: { $gt: amountToCheck }
        }).sort({ minOrderValue: 1 });

        // Filter out codes that have reached global limit
        let candidates = promoCodes.filter(promo => {
            if (promo.usageLimitTotal > 0 && promo.usedCount >= promo.usageLimitTotal) return false;
            return true;
        });

        // Filter out codes that user has already reached their personal limit
        const userUsages = await PromoUsage.find({ user: userId, promoCode: { $in: candidates.map(p => p._id) } });

        candidates = candidates.filter(promo => {
            const usage = userUsages.find(u => u.promoCode.toString() === promo._id.toString());
            if (usage && usage.usageCount >= promo.usageLimitPerUser) return false;
            return true;
        });

        // We only want to return the "closest" one or a few
        res.status(200).json({ success: true, count: candidates.length, data: candidates.slice(0, 3) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single promo code
// @route   GET /api/promocodes/:id
// @access  Admin
export const getPromoCodeById = async (req, res) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id);
        if (!promoCode) {
            return res.status(404).json({ success: false, message: 'Promo code not found' });
        }
        res.status(200).json({ success: true, data: promoCode });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePromoCode = async (req, res) => {
    try {
        let updateData = { ...req.body };

        // Parse freeGift if it exists (might be a string from FormData)
        if (typeof updateData.freeGift === 'string') {
            try {
                updateData.freeGift = JSON.parse(updateData.freeGift);
            } catch (e) {}
        }

        if (req.file && updateData.freeGift) {
            updateData.freeGift.image = req.file.path;
        }

        if (updateData.isAutoApply !== undefined) {
            updateData.isAutoApply = updateData.isAutoApply === 'true' || updateData.isAutoApply === true;
        }

        if (updateData.validFrom) {
            const fromDate = new Date(updateData.validFrom);
            fromDate.setHours(0, 0, 0, 0);
            updateData.validFrom = fromDate;
        }

        if (updateData.validUntil) {
            const untilDate = new Date(updateData.validUntil);
            untilDate.setHours(23, 59, 59, 999);
            updateData.validUntil = untilDate;
        }

        const promoCode = await PromoCode.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });
        if (!promoCode) {
            return res.status(404).json({ success: false, message: 'Promo code not found' });
        }
        res.status(200).json({ success: true, data: promoCode });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete promo code
// @route   DELETE /api/promocodes/:id
// @access  Admin
export const deletePromoCode = async (req, res) => {
    try {
        const promoCode = await PromoCode.findByIdAndDelete(req.params.id);
        if (!promoCode) {
            return res.status(404).json({ success: false, message: 'Promo code not found' });
        }
        res.status(200).json({ success: true, message: 'Promo code deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Validate promo code for a user
// @route   POST /api/promocodes/validate
// @access  Private
export const validatePromoCode = async (req, res) => {
    try {
        const { code, totalAmount, subTotal } = req.body;
        const amountToCheck = subTotal || totalAmount;
        const userId = req.user._id;

        const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });

        if (!promo) {
            return res.status(404).json({ success: false, message: 'Invalid promo code' });
        }

        // Validity Period check
        const now = new Date();
        const fromDate = new Date(promo.validFrom);
        const untilDate = new Date(promo.validUntil);
        if (untilDate.getHours() === 0 && untilDate.getMinutes() === 0 && untilDate.getSeconds() === 0) {
            untilDate.setHours(23, 59, 59, 999);
        }
        if (now < fromDate || now > untilDate) {
            return res.status(400).json({ success: false, message: 'Promo code is expired or not yet active' });
        }

        // Global usage limit
        if (promo.usageLimitTotal > 0 && promo.usedCount >= promo.usageLimitTotal) {
            return res.status(400).json({ success: false, message: 'Promo code usage limit reached' });
        }

        // Per User usage limit
        const usage = await PromoUsage.findOne({ user: userId, promoCode: promo._id });
        if (usage && usage.usageCount >= promo.usageLimitPerUser) {
            return res.status(400).json({ success: false, message: 'You have already used this promo code' });
        }

        // Minimum Order Value
        if (amountToCheck < promo.minOrderValue) {
            return res.status(400).json({ success: false, message: `Minimum order value of ₹${promo.minOrderValue} required` });
        }

        // Calculate Discount
        let discountAmount = 0;
        if (promo.discountType === 'Percentage') {
            discountAmount = (amountToCheck * promo.discountValue) / 100;
            if (promo.maxDiscountAmount > 0 && discountAmount > promo.maxDiscountAmount) {
                discountAmount = promo.maxDiscountAmount;
            }
        } else if (promo.discountType === 'Fixed') {
            discountAmount = promo.discountValue;
        } else if (promo.discountType === 'FreeShipping') {
            discountAmount = 0; 
        }

        res.status(200).json({
            success: true,
            promoCode: promo,
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            isFreeShipping: promo.discountType === 'FreeShipping'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
