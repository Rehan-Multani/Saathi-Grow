import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const products = await Product.find({
    $or: [
      { vendor: { $exists: false } },
      { vendor: null }
    ],
    $or: [
      { branchStocks: { $exists: false } },
      { branchStocks: { $size: 0 } }
    ]
  }).lean();

  console.log(`Found ${products.length} products with no vendor and no branchStocks`);
  for (const p of products.slice(0, 5)) {
    console.log(`  ID: ${p._id}, Name: ${p.name}, status: ${p.status}, stock: ${p.stock}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
