import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import Vendor from '../src/models/Vendor.js';
import Branch from '../src/models/Branch.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- Connected to DB ---');

  const products = await Product.find().lean();
  console.log(`Total Products: ${products.length}`);

  const countsByVendor = {};
  const countsByBranch = {};
  let nullSourceCount = 0;

  for (const p of products) {
    if (p.vendor) {
      const vId = p.vendor.toString();
      countsByVendor[vId] = (countsByVendor[vId] || 0) + 1;
    }
    if (p.branchStocks && p.branchStocks.length > 0) {
      p.branchStocks.forEach(bs => {
        const bId = bs.branchId.toString();
        countsByBranch[bId] = (countsByBranch[bId] || 0) + 1;
      });
    }
    if (!p.vendor && (!p.branchStocks || p.branchStocks.length === 0)) {
      nullSourceCount++;
    }
  }

  console.log('\nProducts count by Vendor ID:');
  for (const [vId, count] of Object.entries(countsByVendor)) {
    const vendor = await Vendor.findById(vId).lean();
    console.log(`Vendor ID: ${vId}, Name: ${vendor ? (vendor.storeName || vendor.name) : 'UNKNOWN'}, Status: ${vendor ? vendor.status : 'N/A'}, Count: ${count}, Location: ${vendor ? JSON.stringify(vendor.address?.location) : 'N/A'}`);
  }

  console.log('\nProducts count by Branch ID:');
  for (const [bId, count] of Object.entries(countsByBranch)) {
    const branch = await Branch.findById(bId).lean();
    console.log(`Branch ID: ${bId}, Name: ${branch ? branch.name : 'UNKNOWN'}, isActive: ${branch ? branch.isActive : 'N/A'}, Count: ${count}, Location: ${branch ? JSON.stringify(branch.address?.location) : 'N/A'}`);
  }

  console.log(`\nProducts with no vendor and no branch stocks: ${nullSourceCount}`);

  await mongoose.disconnect();
}

run().catch(console.error);
