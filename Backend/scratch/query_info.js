import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Branch from '../src/models/Branch.js';
import Vendor from '../src/models/Vendor.js';
import Product from '../src/models/Product.js';
import GlobalSetting from '../src/models/GlobalSetting.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- DB connected ---');

  const settings = await GlobalSetting.findOne();
  console.log('Global Settings:', JSON.stringify(settings, null, 2));

  const branches = await Branch.find().lean();
  console.log(`\n--- Branches (Count: ${branches.length}) ---`);
  branches.forEach(b => {
    console.log(`ID: ${b._id}, Name: ${b.branchName}, isActive: ${b.isActive}, Location:`, JSON.stringify(b.address?.location));
  });

  const vendors = await Vendor.find().lean();
  console.log(`\n--- Vendors (Count: ${vendors.length}) ---`);
  vendors.forEach(v => {
    console.log(`ID: ${v._id}, Name: ${v.storeName || v.name}, status: ${v.status}, Location:`, JSON.stringify(v.address?.location));
  });

  const productCount = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ status: 'Active' });
  console.log(`\nProducts Count: ${productCount}, Active Products: ${activeProducts}`);

  const sampleProducts = await Product.find().limit(5).lean();
  console.log('\n--- Sample Products ---');
  sampleProducts.forEach(p => {
    console.log(`ID: ${p._id}, Name: ${p.name}, Status: ${p.status}, Vendor: ${p.vendor}, HasBranchStocks: ${p.branchStocks?.length || 0}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
