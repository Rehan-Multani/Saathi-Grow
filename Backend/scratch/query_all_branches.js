import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- Connected to DB ---');

  const products = await Product.find({ isAllBranches: true }).lean();
  console.log(`Found ${products.length} products with isAllBranches: true`);
  for (const p of products.slice(0, 5)) {
    console.log(`ID: ${p._id}, Name: ${p.name}, branchStocks: ${JSON.stringify(p.branchStocks)}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
