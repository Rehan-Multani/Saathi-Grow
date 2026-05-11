
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DeliveryPartner from '../src/models/DeliveryPartner.js';
import connectDB from '../src/config/db.js';

dotenv.config();

const findPartner = async () => {
    await connectDB();
    const phone = '6264715409';
    const partner = await DeliveryPartner.findOne({ phone });
    
    if (!partner) {
        console.log('Delivery partner not found with phone:', phone);
    } else {
        console.log('Partner Found:');
        console.log('ID:', partner._id);
        console.log('Name:', partner.name);
        console.log('Phone:', partner.phone);
        console.log('Status:', partner.authStatus);
        console.log('Assignment Status:', partner.assignmentStatus);
        console.log('Active Run:', partner.activeRun);
        console.log('Active Order:', partner.activeOrder);
        console.log('Total Deliveries:', partner.totalDeliveries);
        console.log('Cash in Hand:', partner.cashInHand);
    }
    process.exit(0);
};

findPartner();
