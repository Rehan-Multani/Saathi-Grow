import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendor from '../src/models/Vendor.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- Connected to DB ---');

  const result = await Vendor.updateMany(
    { status: 'Pending' },
    { $set: { status: 'Active' } }
  );

  console.log(`Updated ${result.modifiedCount} pending vendors to Active.`);

  await mongoose.disconnect();
}

run().catch(console.error);
