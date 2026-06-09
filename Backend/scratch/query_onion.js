import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import Branch from '../src/models/Branch.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- Connected to DB ---');

  const p = await Product.findById("6a1fcacea3f6db4739f1ec49").lean();
  if (!p) {
    console.log('Product not found');
  } else {
    console.log(`ID: ${p._id}`);
    console.log(`Name: ${p.name}`);
    console.log(`Status: ${p.status}`);
    console.log(`Vendor ID: ${p.vendor}`);
    console.log(`branchStocks: ${JSON.stringify(p.branchStocks)}`);
    console.log(`isAllBranches: ${p.isAllBranches}`);
    console.log(`stock: ${p.stock}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
