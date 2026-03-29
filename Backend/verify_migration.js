
import mongoose from 'mongoose';
import dotEnv from 'dotenv';
import Product from './src/models/Product.js';

dotEnv.config({ path: './.env' });

async function verify() {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({ subCategory: { $ne: null } }).limit(5).select('name category subCategory');
  console.log(JSON.stringify(products, null, 2));
  process.exit(0);
}
verify();
