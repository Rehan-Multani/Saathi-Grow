import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from './models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Correct path to .env
dotenv.config({ path: join(__dirname, '../.env') });

const check = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('MONGO_URI is not defined in .env');
        process.exit(1);
    }
    await mongoose.connect(uri);
    console.log('Connected to DB');
    
    const latestProducts = await Product.find().sort({ createdAt: -1 }).limit(10).lean();
    console.log('Latest 10 Products:');
    latestProducts.forEach(p => {
      console.log(`- Name: ${p.name}, SKU: ${p.sku}, Image: "${p.image}", Gallery: ${p.gallery.length} files, Created: ${p.createdAt}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
