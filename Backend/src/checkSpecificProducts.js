import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from './models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const check = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log('Connected to DB');
    
    const skus = ['SAATHI-TES-XYZ-5HGXH', 'SAATHI-TES-TES-ABYU5', 'SAATHI-BRE-ERT-H4386'];
    const products = await Product.find({ sku: { $in: skus } }).lean();
    
    console.log(`Found ${products.length} products`);
    products.forEach(p => {
      console.log(`- Name: ${p.name}, SKU: ${p.sku}, Image: "${p.image}", Gallery: ${JSON.stringify(p.gallery)}, Created: ${p.createdAt}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
