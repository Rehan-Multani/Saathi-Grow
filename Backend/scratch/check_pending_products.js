import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import Vendor from '../src/models/Vendor.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- Connected to DB ---');

  const products = await Product.find().lean();
  console.log(`Total Products: ${products.length}`);

  let count = 0;
  for (const p of products) {
    if (p.vendor) {
      const vendor = await Vendor.findById(p.vendor).lean();
      if (!vendor) {
        console.log(`Product "${p.name}" (${p._id}) has non-existing Vendor ID: ${p.vendor}`);
      } else if (vendor.status !== 'Active') {
        console.log(`Product "${p.name}" (${p._id}) has Vendor "${vendor.storeName || vendor.name}" (${vendor._id}) with status: ${vendor.status}`);
        count++;
      }
    }
  }
  console.log(`\nProducts with inactive/pending vendors: ${count}`);

  await mongoose.disconnect();
}

run().catch(console.error);
