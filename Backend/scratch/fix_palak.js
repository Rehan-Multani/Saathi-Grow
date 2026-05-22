import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DeliveryPartner from '../src/models/DeliveryPartner.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    await DeliveryPartner.updateMany(
        {}, 
        { $set: { assignmentStatus: 'Free', activeOrder: null, activeRun: null } }
    );
    console.log('Fixed all partners');
    process.exit(0);
});
