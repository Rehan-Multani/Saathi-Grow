import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import DeliveryPartner from '../src/models/DeliveryPartner.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const partners = await DeliveryPartner.find({}, 'name phone email fcmToken authStatus dutyStatus assignmentStatus');
    console.log('--- Delivery Partners ---');
    partners.forEach(p => {
      console.log(`Name: ${p.name}`);
      console.log(`Phone: ${p.phone}`);
      console.log(`Auth Status: ${p.authStatus}`);
      console.log(`Duty Status: ${p.dutyStatus}`);
      console.log(`Assignment Status: ${p.assignmentStatus}`);
      console.log(`FCM Token (App): ${p.fcmToken?.app || 'NONE'}`);
      console.log(`FCM Token (Web): ${p.fcmToken?.web || 'NONE'}`);
      console.log('------------------------');
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
