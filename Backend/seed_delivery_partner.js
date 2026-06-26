/**
 * Seed a test delivery partner
 * Run: node seed_delivery_partner.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import DeliveryPartner from './src/models/DeliveryPartner.js';

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const phone = '9685974247'; // test number — OTP is always 123456

  const existing = await DeliveryPartner.findOne({ phone });
  if (existing) {
    console.log('\n⚠️  Delivery partner already exists. Updating OTP and status...\n');
    existing.otp = '123456';
    existing.otpExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year expiry
    existing.authStatus = 'Active';
    await existing.save();
    printCreds(existing);
    await mongoose.disconnect();
    return;
  }

  const partner = await DeliveryPartner.create({
    name: 'Raju Delivery',
    phone,
    email: 'raju.delivery@saathigro.com',
    vehicleType: 'Bike',
    vehicleNumber: 'MP09-AB-1234',
    authStatus: 'Active',
    dutyStatus: 'Online',
    assignmentStatus: 'Free',
    currentLocation: {
      type: 'Point',
      coordinates: [75.8577, 22.7196], // Indore [lng, lat]
    },
    otp: '123456',
    otpExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
  });

  console.log('\n✅ Delivery partner created:\n');
  printCreds(partner);
  await mongoose.disconnect();
}

function printCreds(p) {
  console.log('─────────────────────────────────────');
  console.log(`  Name    : ${p.name}`);
  console.log(`  Phone   : ${p.phone}`);
  console.log(`  OTP     : 123456  (test number — always works)`);
  console.log(`  ID      : ${p._id}`);
  console.log(`  UniqueId: ${p.uniqueId}`);
  console.log('─────────────────────────────────────');
}

seed().catch(err => { console.error(err); process.exit(1); });
