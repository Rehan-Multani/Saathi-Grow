import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendor from '../src/models/Vendor.js';
import Branch from '../src/models/Branch.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- Connected to DB ---');

  const vendors = await Vendor.find().sort({ createdAt: -1 }).lean();
  console.log(`Vendors (Count: ${vendors.length}):`);
  vendors.forEach(v => {
    console.log(`ID: ${v._id}, Name: ${v.storeName || v.name}, Status: ${v.status}, Location: ${JSON.stringify(v.address?.location)}, CreatedAt: ${v.createdAt}`);
  });

  const branches = await Branch.find().sort({ createdAt: -1 }).lean();
  console.log(`\nBranches (Count: ${branches.length}):`);
  branches.forEach(b => {
    console.log(`ID: ${b._id}, Name: ${b.branchName}, isActive: ${b.isActive}, Location: ${JSON.stringify(b.address?.location)}, CreatedAt: ${b.createdAt}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
