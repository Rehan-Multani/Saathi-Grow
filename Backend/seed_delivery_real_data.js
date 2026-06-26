/**
 * Seed real data for delivery partner bottom navigation tabs
 * Run: node seed_delivery_real_data.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import DeliveryPartner from './src/models/DeliveryPartner.js';
import DeliveryRun from './src/models/DeliveryRun.js';
import Order from './src/models/Order.js';
import User from './src/models/User.js';
import Branch from './src/models/Branch.js';
import CashCollection from './src/models/CashCollection.js';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ Error: MONGO_URI is not defined in your .env file.');
  process.exit(1);
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const phone = '9685974247';
  const partner = await DeliveryPartner.findOne({ phone });
  if (!partner) {
    console.error(`❌ Delivery partner with phone ${phone} not found. Please run seed_delivery_partner.js first.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  // 1. Find or create a test Branch
  let branch = await Branch.findOne();
  if (!branch) {
    console.log('Creating test Branch...');
    branch = await Branch.create({
      name: 'Central Indore Branch',
      code: 'IND01',
      phone: '9893012345',
      address: {
        street: 'AB Road, Near Vijay Nagar',
        city: 'Indore',
        state: 'MP',
        zipCode: '452010',
        location: { type: 'Point', coordinates: [75.8948, 22.7533] }
      }
    });
  }
  console.log(`✅ Using Branch: ${branch.name} (${branch._id})`);

  // 2. Find or create a test User (Customer)
  let customer = await User.findOne({ role: 'user' });
  if (!customer) {
    console.log('Creating test Customer...');
    customer = await User.create({
      name: 'Rohan Sharma',
      phone: '9827098765',
      role: 'user',
      email: 'rohan.sharma@example.com',
      addresses: [{
        label: 'Home',
        name: 'Rohan Sharma',
        phone: '9827098765',
        street: 'Scheme No 54, Vijay Nagar',
        city: 'Indore',
        state: 'MP',
        zipCode: '452010',
        location: { type: 'Point', coordinates: [75.8950, 22.7540] }
      }]
    });
  }
  console.log(`✅ Using Customer: ${customer.name} (${customer._id})`);

  // Cleanup old seed run data for clean state
  await DeliveryRun.deleteMany({ deliveryPartner: partner._id });
  await CashCollection.deleteMany({ deliveryPartner: partner._id });

  // 3. Create active Order and active DeliveryRun (for Tactical & Missions)
  console.log('Creating active order and delivery run...');
  const activeOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const activeOrder = await Order.create({
    orderId: activeOrderId,
    user: customer._id,
    branchId: branch._id,
    totalAmount: 750,
    subTotal: 700,
    deliveryFee: 40,
    handlingFee: 10,
    status: 'out_for_delivery',
    paymentStatus: 'pending',
    paymentMethod: 'cod',
    shippingAddress: {
      name: customer.name,
      phone: customer.phone,
      street: 'Scheme No 54, Vijay Nagar',
      city: 'Indore',
      state: 'MP',
      zipCode: '452010',
      location: { type: 'Point', coordinates: [75.8950, 22.7540] }
    },
    deliveryPartnerId: partner._id,
    deliveryOTP: '4321',
    deliveryTimestamps: {
      assignedAt: new Date(),
      pickedUpAt: new Date()
    }
  });

  const activeRunId = 'RUN-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-001';
  const activeRun = await DeliveryRun.create({
    runId: activeRunId,
    runType: 'delivery',
    deliveryPartner: partner._id,
    slotDate: new Date(),
    branchId: branch._id,
    status: 'in_progress',
    isImmediate: true,
    orders: [{
      order: activeOrder._id,
      stopSequence: 1,
      status: 'out_for_delivery',
      deliveryOTP: '4321',
      startedAt: new Date()
    }]
  });

  // Link active run to partner and set online/busy
  partner.activeRun = activeRun._id;
  partner.dutyStatus = 'Online';
  partner.assignmentStatus = 'Busy';
  partner.currentStopIndex = 0;
  await partner.save();

  console.log(`✅ Active Delivery Run created: ${activeRun.runId} with Order: ${activeOrder.orderId}`);

  // 4. Create completed Order, completed DeliveryRun, and CashCollection (for Cash/Wallet & History)
  console.log('Creating completed order, completed delivery run, and cash collection...');
  const completedOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const completedOrder = await Order.create({
    orderId: completedOrderId,
    user: customer._id,
    branchId: branch._id,
    totalAmount: 480,
    subTotal: 440,
    deliveryFee: 30,
    handlingFee: 10,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'cod',
    shippingAddress: {
      name: customer.name,
      phone: customer.phone,
      street: 'Geeta Bhawan Square',
      city: 'Indore',
      state: 'MP',
      zipCode: '452001',
      location: { type: 'Point', coordinates: [75.8777, 22.7196] }
    },
    deliveryPartnerId: partner._id,
    deliveryOTP: '1111',
    deliveryTimestamps: {
      assignedAt: new Date(Date.now() - 4 * 3600 * 1000),
      pickedUpAt: new Date(Date.now() - 3.5 * 3600 * 1000),
      deliveredAt: new Date(Date.now() - 3 * 3600 * 1000)
    }
  });

  const completedRunId = 'RUN-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-002';
  await DeliveryRun.create({
    runId: completedRunId,
    runType: 'delivery',
    deliveryPartner: partner._id,
    slotDate: new Date(),
    branchId: branch._id,
    status: 'completed',
    isImmediate: true,
    orders: [{
      order: completedOrder._id,
      stopSequence: 1,
      status: 'delivered',
      deliveryOTP: '1111',
      startedAt: new Date(Date.now() - 3.5 * 3600 * 1000),
      deliveredAt: new Date(Date.now() - 3 * 3600 * 1000)
    }],
    assignedAt: new Date(Date.now() - 4 * 3600 * 1000),
    startedAt: new Date(Date.now() - 3.5 * 3600 * 1000),
    completedAt: new Date(Date.now() - 3 * 3600 * 1000)
  });

  // Create cash collection
  await CashCollection.create({
    deliveryPartner: partner._id,
    order: completedOrder._id,
    amount: completedOrder.totalAmount,
    status: 'collected',
    collectedAt: new Date(Date.now() - 3 * 3600 * 1000)
  });

  // Update partner cash liability
  partner.cashInHand = completedOrder.totalAmount;
  await partner.save();

  console.log(`✅ Completed Delivery Run created: ${completedRunId} with Order: ${completedOrder.orderId}`);
  console.log(`✅ Cash Collection created: ₹${completedOrder.totalAmount}`);

  console.log('\n⭐ Database successfully seeded with real data for all tabs! ⭐');
  console.log('──────────────────────────────────────────────────────────────────');
  console.log(`  Rider Name      : ${partner.name}`);
  console.log(`  Rider Phone     : ${partner.phone}`);
  console.log(`  Active Mission  : Order #${activeOrder.orderId} (OTP: 4321, Amount: ₹750)`);
  console.log(`  Completed Trip  : Order #${completedOrder.orderId} (Amount: ₹480)`);
  console.log(`  Cash Liability  : ₹${partner.cashInHand}`);
  console.log('──────────────────────────────────────────────────────────────────\n');

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error('❌ An error occurred during seeding:', err);
  try {
    await mongoose.disconnect();
  } catch (dErr) {}
  process.exit(1);
});
