import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- Connected to DB ---');

  const udaipurBranchId = '69e732a2e7e9bc830e36ac16';
  const productId = '6a1fcacea3f6db4739f1ec49';

  const p = await Product.findById(productId).lean();
  if (!p) {
    console.log('Product not found');
    await mongoose.disconnect();
    return;
  }

  // Check if stock entry already exists
  const existingIdx = p.branchStocks.findIndex(bs => bs.branchId.toString() === udaipurBranchId);
  if (existingIdx !== -1) {
    await Product.updateOne(
      { _id: productId, 'branchStocks.branchId': udaipurBranchId },
      { $set: { 'branchStocks.$.stock': 50 } }
    );
    console.log('Updated existing Udaipur stock to 50');
  } else {
    await Product.updateOne(
      { _id: productId },
      { $push: { branchStocks: { branchId: udaipurBranchId, stock: 50, lowStockThreshold: 10 } } }
    );
    console.log('Added Udaipur stock entry with 50 items');
  }

  console.log('Product updated successfully via MongoDB updateOne');

  await mongoose.disconnect();
}

run().catch(console.error);
