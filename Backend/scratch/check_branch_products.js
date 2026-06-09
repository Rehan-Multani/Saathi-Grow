import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- Connected to DB ---');

  const udaipurBranchId = '69e732a2e7e9bc830e36ac16';
  
  // Find products that have stocks at Udaipur branch
  const products = await Product.find({
    'branchStocks.branchId': new mongoose.Types.ObjectId(udaipurBranchId)
  }).lean();

  console.log(`Products in Udaipur branch (Count: ${products.length}):`);
  products.forEach(p => {
    const stockInfo = p.branchStocks.find(bs => bs.branchId.toString() === udaipurBranchId);
    console.log(`ID: ${p._id}, Name: ${p.name}, Status: ${p.status}, Stock: ${stockInfo?.stock}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
