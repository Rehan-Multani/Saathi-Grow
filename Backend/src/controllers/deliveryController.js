import DeliveryPartner from '../models/DeliveryPartner.js';
import OrderDelivery from '../models/OrderDelivery.js'; // Legacy
import DeliveryRun from '../models/DeliveryRun.js';
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

// @desc    Get active/pending runs/orders for partner
// @route   GET /api/delivery/orders
// @access  Private (Rider)
export const getOrders = async (req, res) => {
    try {
        const partner = req.partner;
        if (!partner) return res.status(404).json({ message: 'Partner not found' });

        const { type } = req.query; // pending, active, completed

        if (type === 'active') {
            const activeRun = await DeliveryRun.findOne({
                deliveryPartner: partner._id,
                status: { $in: ['assigned', 'in_progress'] }
            }).populate({
                path: 'orders.order',
                populate: [
                    { path: 'user', select: 'name phone' },
                    { path: 'branchId', select: 'name address' }
                ]
            }).populate('branchId');

            // Return as an array to maintain frontend compatibility, even though it's one run
            return res.json(activeRun ? [activeRun] : []);

        } else if (type === 'history') {
            const completedRuns = await DeliveryRun.find({
                deliveryPartner: partner._id,
                status: { $in: ['completed', 'partial_complete'] }
            })
                .populate({ path: 'orders.order' })
                .sort({ createdAt: -1 })
                .limit(20);

            return res.json(completedRuns);
        }

        res.json([]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single delivery run detail
// @route   GET /api/delivery/orders/:id
// @access  Private (Rider)
export const getDeliveryDetail = async (req, res) => {
    try {
        const run = await DeliveryRun.findById(req.params.id)
            .populate({
                path: 'orders.order',
                populate: [
                    { path: 'user', select: 'name phone' },
                    { path: 'branchId', select: 'name address phone location' }
                ]
            });

        if (!run) return res.status(404).json({ message: 'Delivery run not found' });
        res.json(run);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update delivery run/stop status (start run, pick up, deliver stop)
// @route   PATCH /api/delivery/orders/:id/status
// @access  Private (Rider)
export const updateDeliveryStatus = async (req, res) => {
    try {
        // Here, 'id' is the DeliveryRun _id
        // We will pass stopOrderId and new stopStatus for individual stops
        const { status, stopOrderId, stopStatus, otp } = req.body;
        const run = await DeliveryRun.findById(req.params.id);

        if (!run) return res.status(404).json({ message: 'Delivery run not found' });

        const partner = req.partner;

        // Firebase RTDB Tracking setup
        const { db } = await import('../config/firebase.js');

        // 1. Overall Run Status Updates (e.g. marking the whole run as in_progress/picked_up)
        if (status === 'in_progress') {
            run.status = 'in_progress';
            run.startedAt = Date.now();

            // Create Firebase Tracking Node for full run
            const trackingRef = db.ref(`active_trackings/${run._id}`);
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

        } else if (status === 'completed') {
            // Check if all stops are done
            const pendingStops = run.orders.filter(o => o.status === 'pending' || o.status === 'out_for_delivery');
            if (pendingStops.length > 0) {
                return res.status(400).json({ message: 'Cannot complete run. Some stops are still pending.' });
            }

            run.status = run.orders.some(o => o.status === 'failed') ? 'partial_complete' : 'completed';
            run.completedAt = Date.now();

            // Remove Firebase Tracking
            const trackingRef = db.ref(`active_trackings/${run._id}`);
            await trackingRef.remove();

            // Free Partner
            partner.assignmentStatus = 'Free';
            partner.activeRun = null;
            partner.currentStopIndex = 0;
            await partner.save();

            // Add earnings (Bulk fee, 40 per delivered order as placeholder logic)
            const deliveredCount = run.orders.filter(o => o.status === 'delivered').length;
            if (deliveredCount > 0) {
                let wallet = await Wallet.findOne({ deliveryPartner: partner._id });
                if (!wallet) wallet = await Wallet.create({ deliveryPartner: partner._id, balance: 0, totalEarnings: 0 });

                const fee = 40 * deliveredCount;
                wallet.balance += fee;
                wallet.totalEarnings += fee;
                await wallet.save();

                await Transaction.create({
                    wallet: wallet._id,
                    amount: fee,
                    type: 'credit',
                    category: 'delivery_fee',
                    referenceId: run._id,
                    referenceModel: 'DeliveryRun',
                    description: `Earnings for delivering ${deliveredCount} stops in run ${run.runId}`
                });
            }
        }

        // 2. Individual Stop Status Updates
        if (stopOrderId && stopStatus) {
            const stopIndex = run.orders.findIndex(s => s.order.toString() === stopOrderId.toString());
            if (stopIndex === -1) return res.status(404).json({ message: 'Stop not found in run' });

            const stop = run.orders[stopIndex];

            // Verify OTP if delivering
            if (stopStatus === 'delivered') {
                if (stop.deliveryOTP && stop.deliveryOTP !== otp) {
                    stop.otpAttempts += 1;
                    await run.save();
                    return res.status(400).json({ message: 'Invalid OTP', attempts: stop.otpAttempts });
                }
                stop.status = 'delivered';
                stop.deliveredAt = Date.now();
                await Order.findByIdAndUpdate(stopOrderId, { status: 'delivered' });

                // Advance current stop index
                partner.currentStopIndex = partner.currentStopIndex + 1;
                await partner.save();
            } else if (stopStatus === 'failed') {
                stop.status = 'failed';
                stop.failedAt = Date.now();
                // We keep Order status as is or mark returned. Leaving it as confirmed/preparing for admin re-assign.
                partner.currentStopIndex = partner.currentStopIndex + 1;
                await partner.save();
            } else if (stopStatus === 'out_for_delivery') {
                stop.status = 'out_for_delivery';
                stop.startedAt = Date.now();
                await Order.findByIdAndUpdate(stopOrderId, { status: 'out_for_delivery' });
            }
        }

        await run.save();
        res.json(run);
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
            }),
            returnPickups: await OrderDelivery.countDocuments({
                type: 'return_pickup',
                status: 'pending',
                deliveryPartner: { $exists: false }
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

        console.log(`🗺️ Fetching Route: Origin ${origin}, Destination ${destination}`);
        const mapUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

        const response = await axios.get(mapUrl);

        if (response.data.status !== "OK") {
            console.error('❌ Google Maps Error:', response.data.status, response.data.error_message);
            return res.status(400).json({ message: response.data.error_message || "Failed to fetch directions" });
        }

        console.log(`✅ Route fetched successfully: ${response.data.routes.length} routes found`);
        res.json({ routes: response.data.routes });
    } catch (error) {
        console.error('getRouteDirections error:', error);
        res.status(500).json({ message: 'Error fetching directions from Google Maps' });
    }
};

// ─────────────────────────────────────────────────────
// RETURN PICKUP MODULE — Delivery Partner Side
// ─────────────────────────────────────────────────────

// @desc    Get all pending/active return pickup tasks for delivery partner
// @route   GET /api/delivery/returns
// @access  Private (Rider)
export const getReturnPickups = async (req, res) => {
    try {
        const partner = req.partner;
        const { type = 'available' } = req.query;

        let query = { type: 'return_pickup' };

        if (type === 'available') {
            query.status = 'pending';
            query.deliveryPartner = { $exists: false };
        } else if (type === 'active') {
            query.deliveryPartner = partner._id;
            query.status = { $in: ['return_pickup_assigned', 'return_in_transit'] };
        } else if (type === 'history') {
            query.deliveryPartner = partner._id;
            query.status = 'return_delivered';
        }

        const tasks = await OrderDelivery.find(query)
            .populate({
                path: 'order',
                populate: [
                    { path: 'user', select: 'name phone' },
                    { path: 'branchId', select: 'name address phone' },
                    { path: 'vendor', select: 'storeName address phone' }
                ]
            })
            .sort({ createdAt: -1 });

        // Attach unified dropDestinationInfo so frontend doesn't need to determine source type
        const enrichedTasks = tasks.map(task => {
            const t = task.toObject();
            const order = t.order;

            if (t.dropDestinationType === 'branch' && order?.branchId) {
                t.dropDestinationInfo = {
                    type: 'branch',
                    name: order.branchId.name,
                    address: typeof order.branchId.address === 'object'
                        ? `${order.branchId.address.street || ''}, ${order.branchId.address.city || ''}`.trim().replace(/^,|,$/g, '')
                        : order.branchId.address,
                    phone: order.branchId.phone
                };
            } else if (t.dropDestinationType === 'vendor' && order?.vendor) {
                t.dropDestinationInfo = {
                    type: 'vendor',
                    name: order.vendor.storeName,
                    address: typeof order.vendor.address === 'object'
                        ? `${order.vendor.address.street || ''}, ${order.vendor.address.city || ''}`.trim().replace(/^,|,$/g, '')
                        : order.vendor.address,
                    phone: order.vendor.phone
                };
            } else {
                t.dropDestinationInfo = null;
            }
            return t;
        });

        res.json(enrichedTasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Accept a return pickup task
// @route   PATCH /api/delivery/returns/:id/accept
// @access  Private (Rider)
export const acceptReturnPickup = async (req, res) => {
    try {
        const partner = req.partner;
        const task = await OrderDelivery.findById(req.params.id);

        if (!task || task.type !== 'return_pickup') {
            return res.status(404).json({ message: 'Return pickup task not found' });
        }

        if (task.status !== 'pending') {
            return res.status(400).json({ message: 'This return pickup has already been assigned' });
        }

        task.deliveryPartner = partner._id;
        task.status = 'return_pickup_assigned';
        task.assignedAt = new Date();
        await task.save();

        // Link partner to the order's returnRequest
        await Order.findByIdAndUpdate(task.order, {
            'returnRequest.pickupPartnerId': partner._id
        });

        // Mark partner as busy
        partner.assignmentStatus = 'Busy';
        await partner.save();

        const populated = await OrderDelivery.findById(task._id).populate({
            path: 'order',
            populate: [
                { path: 'user', select: 'name phone' },
                { path: 'branchId', select: 'name address phone' },
                { path: 'vendor', select: 'storeName address phone' }
            ]
        });

        res.json({ success: true, task: populated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update return pickup task status
//          return_in_transit  = picked up from customer
//          return_delivered   = delivered back to branch/store
// @route   PATCH /api/delivery/returns/:id/status
// @access  Private (Rider)
export const updateReturnPickupStatus = async (req, res) => {
    try {
        const { status, proofImage } = req.body;
        const partner = req.partner;

        const task = await OrderDelivery.findById(req.params.id);
        if (!task || task.type !== 'return_pickup') {
            return res.status(404).json({ message: 'Return pickup task not found' });
        }

        if (task.deliveryPartner?.toString() !== partner._id.toString()) {
            return res.status(403).json({ message: 'This task is not assigned to you' });
        }

        const order = await Order.findById(task.order);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (status === 'return_in_transit') {
            // Partner has picked item from customer
            task.returnPickedUpAt = new Date();
            task.status = 'return_in_transit';

            // Update order status
            order.status = 'return_picked_up';
            order.returnRequest.pickedUpAt = new Date();
            if (proofImage) order.returnRequest.pickupProofImage = proofImage;
            await order.save();

        } else if (status === 'return_delivered') {
            // Partner has returned item to store/branch — FULL COMPLETION
            task.returnDeliveredAt = new Date();
            task.status = 'return_delivered';

            // Mark order as fully returned
            order.status = 'returned';
            order.returnRequest.resolvedAt = new Date();

            // Restore stock (if not already done on approval)
            // Note: stock was restored on admin approval — skip here

            // Process refund if not already done
            if (order.paymentStatus === 'paid') {
                const User = (await import('../models/User.js')).default;
                const UserTransaction = (await import('../models/UserTransaction.js')).default;

                const user = await User.findById(order.user);
                if (user) {
                    user.walletBalance = (user.walletBalance || 0) + order.totalAmount;
                    await user.save();

                    await UserTransaction.create({
                        user: order.user,
                        amount: order.totalAmount,
                        type: 'credit',
                        category: 'order_refund',
                        status: 'completed',
                        description: `Refund for Returned Order #${order.orderId}`,
                        orderId: order._id
                    });
                }
                order.paymentStatus = 'refunded';
            }

            await order.save();

            // Credit partner with pickup fee
            const fee = task.pickupFee || 30;
            let wallet = await Wallet.findOne({ deliveryPartner: partner._id });
            if (!wallet) {
                wallet = await Wallet.create({ deliveryPartner: partner._id, balance: 0, totalEarnings: 0 });
            }
            wallet.balance += fee;
            wallet.totalEarnings += fee;
            await wallet.save();

            await Transaction.create({
                wallet: wallet._id,
                amount: fee,
                type: 'credit',
                category: 'return_pickup_fee',
                referenceId: task._id,
                referenceModel: 'OrderDelivery'
            });

            // Free up partner
            partner.assignmentStatus = 'Free';
            partner.activeOrder = null;
            await partner.save();
        }

        await task.save();
        res.json({ success: true, task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

