import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Branch from '../src/models/Branch.js';
import Vendor from '../src/models/Vendor.js';
import Product from '../src/models/Product.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- Connected to DB ---');

  console.log('\n--- 5 Most Recent Vendors ---');
  const recentVendors = await Vendor.find().sort({ createdAt: -1 }).limit(5).lean();
  recentVendors.forEach(v => {
    console.log(`ID: ${v._id}, Name: ${v.storeName || v.name}, Status: ${v.status}, Location: ${JSON.stringify(v.address?.location)}, CreatedAt: ${v.createdAt}`);
  });

  console.log('\n--- 5 Most Recent Branches ---');
  const recentBranches = await Branch.find().sort({ createdAt: -1 }).limit(5).lean();
  recentBranches.forEach(b => {
    console.log(`ID: ${b._id}, Name: ${b.branchName}, isActive: ${b.isActive}, Location: ${JSON.stringify(b.address?.location)}, CreatedAt: ${b.createdAt}`);
  });

  console.log('\n--- 5 Most Recent Products ---');
  const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5).lean();
  recentProducts.forEach(p => {
    console.log(`ID: ${p._id}, Name: ${p.name}, Status: ${p.status}, Vendor: ${p.vendor}, BranchStocks: ${JSON.stringify(p.branchStocks)}, CreatedAt: ${p.createdAt}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
