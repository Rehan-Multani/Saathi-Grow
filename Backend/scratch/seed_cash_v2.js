import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const DeliveryPartner = mongoose.model('DeliveryPartner', new mongoose.Schema({ 
            name: String,
            cashInHand: { type: Number, default: 0 }
        }), 'deliverypartners');

        const Order = mongoose.model('Order', new mongoose.Schema({
            orderId: String
        }), 'orders');

        const CashCollection = mongoose.model('CashCollection', new mongoose.Schema({
            deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
            order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
            amount: Number,
            status: { type: String, default: 'collected' }
        }), 'cashcollections');

        const rider = await DeliveryPartner.findOne({ name: /Sarthak/i });
        const order = await Order.findOne();

        if (rider && order) {
            // Create the record
            const amount = 750;
            const entry = new CashCollection({
                deliveryPartner: rider._id,
                order: order._id,
                amount: amount,
                status: 'collected'
            });
            await entry.save();

            // IMPORTANT: Update the rider's cashInHand field which the UI actually looks at
            rider.cashInHand = (rider.cashInHand || 0) + amount;
            await rider.save();

            console.log('Cash Collection entry seeded AND Rider cashInHand updated!');
            console.log('Rider:', rider.name);
            console.log('New Cash In Hand:', rider.cashInHand);
        } else {
            console.log('Could not find rider or order.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

seed();
