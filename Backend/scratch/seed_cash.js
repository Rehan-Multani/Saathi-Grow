import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Dynamically get models if possible or define minimal schemas
        const DeliveryPartner = mongoose.model('DeliveryPartner', new mongoose.Schema({ 
            name: String,
            phone: String
        }), 'deliverypartners');

        const Order = mongoose.model('Order', new mongoose.Schema({
            orderNumber: String,
            totalPrice: Number
        }), 'orders');

        const CashCollection = mongoose.model('CashCollection', new mongoose.Schema({
            deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
            order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
            amount: Number,
            status: { type: String, default: 'collected' },
            collectedAt: { type: Date, default: Date.now },
            adminAcknowledge: { type: Boolean, default: false }
        }), 'cashcollections');

        const rider = await DeliveryPartner.findOne();
        const order = await Order.findOne();

        if (!rider) {
            console.log('No rider found. Creating one...');
            // Add a rider if none exists
        }

        if (!order) {
            console.log('No order found. Creating one...');
            // Add an order if none exists
        }

        if (rider && order) {
            const entry = new CashCollection({
                deliveryPartner: rider._id,
                order: order._id,
                amount: 500,
                status: 'collected'
            });
            await entry.save();
            console.log('Cash Collection entry seeded successfully!');
            console.log('Rider:', rider.name);
            console.log('Order:', order.orderNumber);
        } else {
            console.log('Could not find rider or order to link to.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

seed();
