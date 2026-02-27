import DeliveryPartner from '../models/DeliveryPartner.js';
import OrderDelivery from '../models/OrderDelivery.js';
import axios from 'axios';
import Order from '../models/Order.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import DeliveryLocation from '../models/DeliveryLocation.js';
import { findOptimalSource } from '../services/locationService.js';

// @desc    Get delivery partner profile
// @route   GET /api/delivery/profile
// @access  Private (Rider)
export const getProfile = async (req, res) => {
    try {
        const partner = req.partner;
        if (!partner) {
            return res.status(404).json({ message: 'Delivery partner profile not found' });
        }
        res.json(partner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update partner status (online/offline)
// @route   PATCH /api/delivery/status
// @access  Private (Rider)
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const partner = await DeliveryPartner.findByIdAndUpdate(
            req.partner._id,
            { dutyStatus: status === 'online' ? 'Online' : 'Offline' },
            { new: true }
        );
        res.json(partner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update partner location
// @route   POST /api/delivery/location
// @access  Private (Rider)
export const updateLocation = async (req, res) => {
    try {
        const { longitude, latitude } = req.body;
        const location = {
            type: 'Point',
            coordinates: [longitude, latitude]
        };

        const partner = await DeliveryPartner.findByIdAndUpdate(
            req.partner._id,
            { currentLocation: location },
            { new: true }
        );

        // Track history
        await DeliveryLocation.create({
            deliveryPartner: partner._id,
            location
        });

        res.json({ message: 'Location updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get active/pending orders for partner
// @route   GET /api/delivery/orders
// @access  Private (Rider)
export const getOrders = async (req, res) => {
    try {
        const partner = req.partner;
        if (!partner) return res.status(404).json({ message: 'Partner not found' });

        const { type } = req.query; // pending, active, completed

        let query = {};
        if (type === 'pending') {
            query = { status: 'pending', deliveryPartner: { $exists: false } };
            // In a real app, we might also filter by service area distance
        } else if (type === 'active') {
            query = {
                deliveryPartner: partner._id,
                status: { $in: ['assigned', 'picked_up', 'in_transit'] }
            };
        } else if (type === 'history') {
            query = {
                deliveryPartner: partner._id,
                status: { $in: ['delivered', 'failed', 'returned'] }
            };
        }

        const deliveries = await OrderDelivery.find(query)
            .populate({
                path: 'order',
                populate: { path: 'user', select: 'name phone' }
            })
            .sort({ createdAt: -1 });

        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single delivery detail
// @route   GET /api/delivery/orders/:id
// @access  Private (Rider)
export const getDeliveryDetail = async (req, res) => {
    try {
        const delivery = await OrderDelivery.findById(req.params.id)
            .populate({
                path: 'order',
                populate: [
                    { path: 'user', select: 'name phone' },
                    { path: 'branchId', select: 'name address phone' }
                ]
            });

        if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
        res.json(delivery);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update delivery status (accept, pick up, deliver)
// @route   PATCH /api/delivery/orders/:id/status
// @access  Private (Rider)
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const delivery = await OrderDelivery.findById(req.params.id);

        if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

        const partner = req.partner;

        // Firebase RTDB DB Instance
        const { db } = await import('../config/firebase.js');

        if (status === 'assigned') {
            delivery.deliveryPartner = partner._id;
            delivery.assignedAt = Date.now();

            // Create Firebase Realtime Tracking Node when assigned
            const trackingRef = db.ref(`active_trackings/${delivery._id}`);
            await trackingRef.set({
                driverId: partner._id.toString(),
                location: partner.currentLocation ? {
                    lat: partner.currentLocation.coordinates[1],
                    lng: partner.currentLocation.coordinates[0]
                } : { lat: 22.7196, lng: 75.8577 },
                heading: 0,
                isActive: true,
                updatedAt: Date.now()
            });

        } else if (status === 'picked_up') {
            delivery.pickedUpAt = Date.now();
            await Order.findByIdAndUpdate(delivery.order, { status: 'out_for_delivery' });
        } else if (status === 'delivered') {
            delivery.deliveredAt = Date.now();
            delivery.status = 'delivered';
            await Order.findByIdAndUpdate(delivery.order, { status: 'delivered' });

            // Remove Firebase Realtime Tracking Node after delivery
            const trackingRef = db.ref(`active_trackings/${delivery._id}`);
            await trackingRef.remove();

            // Free up the delivery partner for new orders
            partner.assignmentStatus = 'Free';
            partner.activeOrder = null;
            await partner.save();

            // Add earnings to wallet
            let wallet = await Wallet.findOne({ deliveryPartner: partner._id });
            if (!wallet) {
                wallet = await Wallet.create({ deliveryPartner: partner._id, balance: 0, totalEarnings: 0 });
            }
            const fee = delivery.deliveryFee || 40; // Default fee if not set
            wallet.balance += fee;
            wallet.totalEarnings += fee;
            await wallet.save();

            // Create transaction
            await Transaction.create({
                wallet: wallet._id,
                amount: fee,
                type: 'credit',
                category: 'delivery_fee',
                referenceId: delivery._id,
                referenceModel: 'OrderDelivery'
            });
        }

        delivery.status = status;
        await delivery.save();

        res.json(delivery);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get wallet details and transactions
// @route   GET /api/delivery/wallet
// @access  Private (Rider)
export const getWallet = async (req, res) => {
    try {
        const partner = req.partner;
        let wallet = await Wallet.findOne({ deliveryPartner: partner._id });

        if (!wallet) {
            wallet = await Wallet.create({ deliveryPartner: partner._id, balance: 0, totalEarnings: 0 });
        }

        const transactions = await Transaction.find({ wallet: wallet._id }).sort({ createdAt: -1 }).limit(20);

        res.json({ wallet, transactions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create/Update delivery partner profile
// @route   POST /api/delivery/profile
// @access  Private (User with rider role)
export const createProfile = async (req, res) => {
    try {
        const { vehicleType, vehicleNumber, bankDetails } = req.body;

        let partner = await DeliveryPartner.findOne({ user: req.user._id });

        if (partner) {
            partner.vehicleType = vehicleType || partner.vehicleType;
            partner.vehicleNumber = vehicleNumber || partner.vehicleNumber;
            partner.bankDetails = bankDetails || partner.bankDetails;
            await partner.save();
        } else {
            partner = await DeliveryPartner.create({
                user: req.user._id,
                vehicleType,
                vehicleNumber,
                bankDetails
            });

            // Initialize wallet
            await Wallet.create({ deliveryPartner: partner._id });
        }

        res.status(201).json(partner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard summary statistics
// @route   GET /api/delivery/stats
// @access  Private (Rider)
export const getDashboardStats = async (req, res) => {
    try {
        const partner = req.partner;
        if (!partner) return res.status(404).json({ message: 'Partner not found' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let wallet = await Wallet.findOne({ deliveryPartner: partner._id });
        if (!wallet) {
            wallet = await Wallet.create({ deliveryPartner: partner._id, balance: 0, totalEarnings: 0 });
        }

        const pendingOrders = await OrderDelivery.countDocuments({ status: 'pending' });
        const todayDeliveries = await OrderDelivery.countDocuments({
            deliveryPartner: partner._id,
            status: 'delivered',
            deliveredAt: { $gte: today }
        });

        const todayEarnings = await Transaction.aggregate([
            {
                $match: {
                    wallet: wallet._id,
                    type: 'credit',
                    createdAt: { $gte: today }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        res.json({
            walletBalance: wallet.balance,
            totalEarnings: wallet.totalEarnings,
            todayEarnings: todayEarnings[0]?.total || 0,
            pendingOrders,
            todayDeliveries,
            status: partner.status,
            activeOrders: await OrderDelivery.countDocuments({
                deliveryPartner: partner._id,
                status: { $in: ['assigned', 'picked_up', 'in_transit'] }
            })
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Simulate a new order for testing notifications
// @route   POST /api/delivery/simulate-order
// @access  Public (For testing)
export const simulateOrder = async (req, res) => {
    try {
        // Find a random user to be the customer
        const User = (await import('../models/User.js')).default;
        const customer = await User.findOne({ role: 'user' });

        if (!customer) return res.status(404).json({ message: 'No customer found to simulate order' });

        const shippingAddress = {
            street: 'Vijay Nagar, Scheme No. 54',
            city: 'Indore',
            state: 'MP',
            location: { type: 'Point', coordinates: [75.8948, 22.7533] } // Real Indore coordinates for test
        };

        // For simulation, find a real product to check stock against
        const Product = (await import('../models/Product.js')).default;
        const randomProduct = await Product.findOne({ status: 'Active' });
        const items = randomProduct ? [{ product: randomProduct._id, quantity: 1 }] : [];

        const optimalSource = await findOptimalSource(shippingAddress.location.coordinates, items);

        const newOrder = await Order.create({
            orderId: 'SIM-' + Math.floor(Math.random() * 10000),
            user: customer._id,
            totalAmount: 500,
            status: 'pending',
            paymentMethod: 'cod',
            shippingAddress,
            branchId: optimalSource?.type === 'branch' ? optimalSource.id : undefined,
            vendor: optimalSource?.type === 'vendor' ? optimalSource.id : undefined
        });

        const delivery = await OrderDelivery.create({
            order: newOrder._id,
            status: 'pending',
            deliveryFee: 45
        });

        // Emit socket event (io is exported from app.js)
        const { io } = await import('../app.js');
        io.emit('new_order', {
            id: delivery._id,
            orderId: newOrder.orderId,
            customerName: customer.name,
            amount: newOrder.totalAmount,
            address: newOrder.shippingAddress.street,
            branchLocation: optimalSource?.location,
            customerLocation: shippingAddress.location.coordinates
        });

        res.json({ message: 'Order simulated successfully', delivery });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Route Directions via Google Maps API
// @route   GET /api/delivery/route
// @access  Private (Rider)
export const getRouteDirections = async (req, res) => {
    try {
        const { origin, destination } = req.query;
        if (!origin || !destination) {
            return res.status(400).json({ message: 'Origin and destination coordinates are required' });
        }

        const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API;
        if (!apiKey) {
            return res.status(500).json({ message: 'Google Maps API is not configured on the server' });
        }

        const mapUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

        const response = await axios.get(mapUrl);

        if (response.data.status !== "OK") {
            return res.status(400).json({ message: response.data.error_message || "Failed to fetch directions" });
        }

        res.json({ routes: response.data.routes });
    } catch (error) {
        console.error('getRouteDirections error:', error);
        res.status(500).json({ message: 'Error fetching directions from Google Maps' });
    }
};
